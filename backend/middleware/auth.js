import jwt from "jsonwebtoken";
import { getRedisClient, redisGetJSON } from "../config/redis.js";

const cacheKeyForSession = (token) => `auth:session:${token}`;

const getTokenFromRequest = (req) => {
  const authHeader = req.header("authorization") || req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return req.header("x-auth-token") || null;
};

const auth = async (req, res, next) => {
  // Support both Authorization: Bearer <token> and legacy x-auth-token header
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Enforce Redis-backed session revocation when Redis is available.
    const shouldEnforceSession = process.env.REDIS_SESSION_ENFORCE !== "false";
    if (shouldEnforceSession && getRedisClient()) {
      const session = await redisGetJSON(cacheKeyForSession(token));
      if (!session || String(session.userId) !== String(decoded?.user?.id)) {
        return res.status(401).json({ msg: "Session expired or revoked" });
      }
    }

    req.user = decoded.user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export const optionalAuth = async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const shouldEnforceSession = process.env.REDIS_SESSION_ENFORCE !== "false";

    if (shouldEnforceSession && getRedisClient()) {
      const session = await redisGetJSON(cacheKeyForSession(token));
      if (!session || String(session.userId) !== String(decoded?.user?.id)) {
        return next();
      }
    }

    req.user = decoded.user;
    req.token = token;
    return next();
  } catch {
    return next();
  }
};

export default auth;
