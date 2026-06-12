import { createClient } from "redis";

let redisClient = null;
let redisConnectAttempted = false;

export async function connectRedis() {
  if (redisConnectAttempted) return redisClient;
  redisConnectAttempted = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[redis] REDIS_URL not set; Redis cache disabled.");
    return null;
  }

  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err) => {
      console.error("[redis] Client error:", err.message);
    });

    await redisClient.connect();
    console.log("[redis] Connected");
    return redisClient;
  } catch (error) {
    console.error("[redis] Connection failed:", error.message);
    redisClient = null;
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export async function redisGetJSON(key) {
  try {
    if (!redisClient) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("[redis] get failed:", error.message);
    return null;
  }
}

export async function redisSetJSON(key, value, ttlSeconds = 300) {
  try {
    if (!redisClient) return false;
    const payload = JSON.stringify(value);
    await redisClient.set(key, payload, {
      EX: ttlSeconds,
    });
    return true;
  } catch (error) {
    console.error("[redis] set failed:", error.message);
    return false;
  }
}

export async function redisDelete(key) {
  try {
    if (!redisClient) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("[redis] delete failed:", error.message);
    return false;
  }
}

export async function redisDeleteByPrefix(prefix, batchSize = 200) {
  try {
    if (!redisClient || !prefix) return 0;

    let deleted = 0;
    for await (const item of redisClient.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: batchSize,
    })) {
      const keys = Array.isArray(item) ? item : [item];
      if (keys.length === 0) continue;
      deleted += await redisClient.del(...keys);
    }

    return deleted;
  } catch (error) {
    console.error("[redis] delete by prefix failed:", error.message);
    return 0;
  }
}

export async function redisIncrement(key, ttlSeconds = 60) {
  try {
    if (!redisClient) return null;
    const count = await redisClient.incr(key);
    if (count === 1 && ttlSeconds > 0) {
      await redisClient.expire(key, ttlSeconds);
    }
    return count;
  } catch (error) {
    console.error("[redis] increment failed:", error.message);
    return null;
  }
}
