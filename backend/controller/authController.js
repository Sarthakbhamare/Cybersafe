 import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redisDelete, redisGetJSON, redisSetJSON } from "../config/redis.js";

const AUTH_CREDENTIAL_CACHE_TTL = 5 * 60;
const AUTH_PROFILE_CACHE_TTL = 5 * 60;
const AUTH_SESSION_CACHE_TTL = 60 * 60;

const cacheKeyForCredentialByEmail = (email) => `auth:credential:${email.toLowerCase()}`;
const cacheKeyForProfile = (userId) => `auth:profile:${String(userId)}`;
const cacheKeyForSession = (token) => `auth:session:${token}`;

const toCredentialCache = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  demographic: userDoc.demographic,
  passwordHash: userDoc.password,
  xp: userDoc.xp || 0,
});

const sanitizeUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  gender: user.gender,
  email: user.email,
  phone: user.phone,
  demographic: user.demographic,
  xp: user.xp || 0,
  lastLoginAt: user.lastLoginAt || null,
  certification: user.certification || {
    status: "not_attempted",
    isCertified: false,
    attempts: [],
  },
});

const readCredentialsForLogin = async (email) => {
  const key = cacheKeyForCredentialByEmail(email);
  const cached = await redisGetJSON(key);
  if (cached && cached.email && cached.passwordHash) {
    return { credentials: cached, fromCache: true };
  }

  const userDoc = await User.findOne({ email })
    .select("_id name email demographic password xp")
    .lean();
  if (!userDoc) return { credentials: null, fromCache: false };

  const minimalCredentials = toCredentialCache(userDoc);
  await redisSetJSON(key, minimalCredentials, AUTH_CREDENTIAL_CACHE_TTL);
  return { credentials: minimalCredentials, fromCache: false };
};

const invalidateUserCaches = async (user) => {
  if (!user) return;
  await redisDelete(cacheKeyForCredentialByEmail(user.email));
  await redisDelete(cacheKeyForProfile(user._id));
};

export const  signup = async (req, res) => {
  try {
    const { name, gender, email, phone, demographic, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ msg: "Email is required" });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      gender,
      email: normalizedEmail,
      phone,
      demographic,
      password: hashedPassword,
      xp: 0,
    });
    await user.save();
    await invalidateUserCaches(user);

    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    
    const { credentials } = await readCredentialsForLogin(normalizedEmail);
    if (!credentials) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, credentials.passwordHash);
    
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: String(credentials._id),
        demographic: credentials.demographic,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      async (err, token) => {
        if (err) throw err;

        // Persist last login and refresh profile cache.
        await User.findByIdAndUpdate(credentials._id, { $set: { lastLoginAt: new Date() } });
        const latestUser = await User.findById(credentials._id).select("-password").lean();
        if (latestUser) {
          await redisSetJSON(cacheKeyForProfile(latestUser._id), latestUser, AUTH_PROFILE_CACHE_TTL);
          await redisSetJSON(
            cacheKeyForCredentialByEmail(latestUser.email),
            {
              _id: latestUser._id,
              name: latestUser.name,
              email: latestUser.email,
              demographic: latestUser.demographic,
              passwordHash: credentials.passwordHash,
              xp: latestUser.xp || 0,
            },
            AUTH_CREDENTIAL_CACHE_TTL
          );
        }
        await redisSetJSON(cacheKeyForSession(token), { userId: String(credentials._id) }, AUTH_SESSION_CACHE_TTL);

        res.json({
          token,
          demographic: credentials.demographic,
          name: credentials.name,
          email: credentials.email,
          userId: String(credentials._id),
          xp: latestUser?.xp || credentials.xp || 0,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const me = async (req, res) => {
  try {
    const cacheKey = cacheKeyForProfile(req.user.id);
    const cached = await redisGetJSON(cacheKey);
    if (cached) {
      return res.json(sanitizeUserResponse(cached));
    }

    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    await redisSetJSON(cacheKey, user, AUTH_PROFILE_CACHE_TTL);
    res.json(sanitizeUserResponse(user));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const updateMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const current = await User.findById(req.user.id);
    if (!current) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updates = {};

    if (typeof req.body?.name === "string") {
      const name = req.body.name.trim();
      if (name.length < 2) {
        return res.status(400).json({ msg: "Name must be at least 2 characters" });
      }
      updates.name = name;
    }

    if (typeof req.body?.gender === "string") {
      const gender = req.body.gender.trim();
      if (gender) updates.gender = gender;
    }

    if (typeof req.body?.demographic === "string") {
      const demographic = req.body.demographic.trim();
      if (demographic) updates.demographic = demographic;
    }

    if (typeof req.body?.phone === "string") {
      const phone = req.body.phone.trim();
      if (!/^\+?[0-9]{10,13}$/.test(phone)) {
        return res.status(400).json({ msg: "Phone number must be 10 to 13 digits" });
      }
      updates.phone = phone;
    }

    if (typeof req.body?.email === "string") {
      const normalizedEmail = req.body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ msg: "Please provide a valid email" });
      }

      if (normalizedEmail !== current.email) {
        const existing = await User.findOne({ email: normalizedEmail }).select("_id").lean();
        if (existing && String(existing._id) !== String(current._id)) {
          return res.status(400).json({ msg: "Email is already in use" });
        }
      }
      updates.email = normalizedEmail;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ msg: "No valid fields to update" });
    }

    const oldIdentity = { _id: current._id, email: current.email };

    Object.assign(current, updates);
    await current.save();

    await invalidateUserCaches(oldIdentity);
    await invalidateUserCaches(current);

    const sanitized = sanitizeUserResponse(current.toObject());
    await redisSetJSON(cacheKeyForProfile(current._id), sanitized, AUTH_PROFILE_CACHE_TTL);

    return res.json(sanitized);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

export const syncXP = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const rawDelta = Number(req.body?.delta);
    if (!Number.isFinite(rawDelta)) {
      return res.status(400).json({ msg: "delta must be a valid number" });
    }

    const delta = Math.trunc(rawDelta);
    if (Math.abs(delta) > 10000) {
      return res.status(400).json({ msg: "delta is out of allowed range" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { xp: delta } },
      { new: true, projection: { password: 0 } }
    ).lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await invalidateUserCaches(user);
    await redisSetJSON(cacheKeyForProfile(user._id), user, AUTH_PROFILE_CACHE_TTL);

    return res.json({ xp: user.xp, delta });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

export const syncCertification = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const certification = req.body?.certification;
    if (!certification || typeof certification !== "object") {
      return res.status(400).json({ msg: "certification object is required" });
    }

    const sanitizedCertification = {
      status: certification.status || "not_attempted",
      isCertified: Boolean(certification.isCertified),
      certificateId: certification.certificateId || null,
      score: typeof certification.score === "number" ? certification.score : null,
      issuedAt: certification.issuedAt || null,
      expiryDate: certification.expiryDate || null,
      attempts: Array.isArray(certification.attempts) ? certification.attempts.slice(-20) : [],
      updatedAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { certification: sanitizedCertification } },
      { new: true, projection: { password: 0 } }
    ).lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await invalidateUserCaches(user);
    await redisSetJSON(cacheKeyForProfile(user._id), user, AUTH_PROFILE_CACHE_TTL);

    return res.json({ certification: user.certification });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

export const getProgress = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(req.user.id)
      .select("xp certification")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({
      xp: user.xp || 0,
      certification: user.certification || {
        status: "not_attempted",
        isCertified: false,
        attempts: [],
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

export const logout = async (req, res) => {
  try {
    if (req.token) {
      await redisDelete(cacheKeyForSession(req.token));
    }
    return res.json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};
