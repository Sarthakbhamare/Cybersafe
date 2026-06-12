import jwt from "jsonwebtoken";
import { redisIncrement } from "../config/redis.js";

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const [first] = forwarded.split(",");
    return first.trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const getTokenFromRequest = (req) => {
  const authHeader = req.header("authorization") || req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.header("x-auth-token") || null;
};

const resolveUserId = (req) => {
  if (req.user?.id) return String(req.user.id);

  const token = getTokenFromRequest(req);
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.user?.id ? String(decoded.user.id) : null;
  } catch {
    return null;
  }
};

export const createRedisRateLimiter = ({
  keyPrefix,
  limit,
  windowSeconds = 60,
  includeIp = true,
  includeUser = false,
  message = "Too many requests. Please try again shortly.",
}) => {
  return async (req, res, next) => {
    try {
      const keys = [];

      if (includeIp) {
        keys.push(`${keyPrefix}:ip:${getClientIp(req)}`);
      }

      if (includeUser) {
        const userId = resolveUserId(req);
        if (userId) keys.push(`${keyPrefix}:user:${userId}`);
      }

      let blocked = false;
      for (const key of keys) {
        const count = await redisIncrement(key, windowSeconds);
        if (count !== null && count > limit) {
          blocked = true;
          break;
        }
      }

      if (blocked) {
        res.set("Retry-After", String(windowSeconds));
        return res.status(429).json({ error: message });
      }

      return next();
    } catch (error) {
      console.error("Rate limiter failed:", error.message);
      return next();
    }
  };
};

export const chatRateLimiter = createRedisRateLimiter({
  keyPrefix: "ratelimit:chat",
  limit: 20,
  windowSeconds: 60,
  includeIp: true,
  includeUser: true,
  message: "Too many chat requests. Please wait a minute and try again.",
});

export const reputationCheckRateLimiter = createRedisRateLimiter({
  keyPrefix: "ratelimit:reputation:check",
  limit: 30,
  windowSeconds: 60,
  includeIp: true,
  includeUser: true,
  message: "Too many reputation checks. Please wait a minute and try again.",
});

export const reputationReportRateLimiter = createRedisRateLimiter({
  keyPrefix: "ratelimit:reputation:report",
  limit: 10,
  windowSeconds: 60,
  includeIp: true,
  includeUser: true,
  message: "Too many reports submitted. Please wait a minute and try again.",
});
