import User from "../models/User.js";
import IndicatorReport from "../models/IndicatorReport.js";
import { getRedisClient, redisSetJSON } from "../config/redis.js";

const AUTH_PROFILE_TTL_SECONDS = 5 * 60;
const INDICATOR_CHECK_TTL_SECONDS = 10 * 60;
const COMMUNITY_TRENDING_TTL_SECONDS = 45;
const COMMUNITY_RECENT_TTL_SECONDS = 45;

const COMMUNITY_TRENDING_CACHE_PREFIX = "rep:trending:v1:";
const COMMUNITY_RECENT_CACHE_PREFIX = "rep:recent:v1:";
const INDICATOR_CHECK_CACHE_PREFIX = "rep:check:v1:";

const keyForProfile = (userId) => `auth:profile:${String(userId)}`;
const keyForTrending = (limit) => `${COMMUNITY_TRENDING_CACHE_PREFIX}${limit}`;
const keyForRecent = (limit) => `${COMMUNITY_RECENT_CACHE_PREFIX}${limit}`;
const keyForIndicatorCheck = (normalizedIndicator) => `${INDICATOR_CHECK_CACHE_PREFIX}${normalizedIndicator}`;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildTypeCounts = (reports = []) => {
  const map = new Map();

  reports.forEach((report) => {
    const type = report.reportType || "other";
    const previous = map.get(type) || { count: 0, last_seen: null };
    previous.count += 1;
    const timestamp = report.updatedAt || report.createdAt || new Date();
    previous.last_seen =
      !previous.last_seen || new Date(timestamp) > new Date(previous.last_seen)
        ? timestamp
        : previous.last_seen;
    map.set(type, previous);
  });

  return Array.from(map.entries()).map(([type, value]) => ({
    type,
    count: value.count,
    last_seen: value.last_seen,
  }));
};

const scoreFromSignals = ({ reports = 0 }) => {
  const base = reports > 10 ? 25 : reports > 0 ? 50 : 90;
  const reportPenalty = Math.min(35, Math.round(reports / 5));
  return Math.max(0, base - reportPenalty);
};

const buildIndicatorPayload = (doc) => {
  const totalReports = doc.totalReports || 0;
  const uniqueReporters = doc.uniqueReporterCount || 0;

  return {
    indicator: doc.indicator,
    normalizedIndicator: doc.normalizedIndicator,
    indicatorType: doc.indicatorType,
    type: totalReports > 0 ? "malicious" : "clean",
    severity: totalReports > 10 ? "high" : totalReports > 0 ? "medium" : "safe",
    category: totalReports > 0 ? "Community Reported Threat" : "No Community Reports Yet",
    reports: totalReports,
    total_reports: totalReports,
    unique_reporters: uniqueReporters,
    externalReports: 0,
    report_types: buildTypeCounts(doc.reports || []),
    lastSeen: doc.lastReportedAt || null,
    reputationScore: scoreFromSignals({ reports: totalReports }),
    source: "CyberSafe Community",
    description:
      totalReports > 0
        ? `Reported by ${uniqueReporters} community member(s) with ${totalReports} total reports.`
        : "No community reports found for this indicator.",
  };
};

const prewarmProfiles = async () => {
  const maxUsers = clamp(Number(process.env.REDIS_PREWARM_USERS || 200), 100, 500);

  const users = await User.find()
    .sort({ lastLoginAt: -1, updatedAt: -1 })
    .limit(maxUsers)
    .select("_id name gender email phone demographic xp lastLoginAt certification")
    .lean();

  await Promise.all(
    users.map((user) =>
      redisSetJSON(keyForProfile(user._id), user, AUTH_PROFILE_TTL_SECONDS)
    )
  );

  return users.length;
};

const prewarmReputationCaches = async () => {
  const maxIndicators = clamp(Number(process.env.REDIS_PREWARM_INDICATORS || 200), 100, 500);

  const trendingDocs = await IndicatorReport.find()
    .sort({ totalReports: -1, lastReportedAt: -1 })
    .limit(maxIndicators)
    .lean();

  await Promise.all(
    trendingDocs.map((doc) =>
      redisSetJSON(
        keyForIndicatorCheck(doc.normalizedIndicator),
        buildIndicatorPayload(doc),
        INDICATOR_CHECK_TTL_SECONDS
      )
    )
  );

  const trendingItems = trendingDocs.map((doc) => ({
    indicator: doc.indicator,
    normalizedIndicator: doc.normalizedIndicator,
    indicatorType: doc.indicatorType,
    reports: doc.totalReports,
    uniqueReporters: doc.uniqueReporterCount,
    trend: "up",
    report_types: buildTypeCounts(doc.reports || []),
    lastSeen: doc.lastReportedAt,
  }));

  await Promise.all([
    redisSetJSON(keyForTrending(8), { items: trendingItems.slice(0, 8) }, COMMUNITY_TRENDING_TTL_SECONDS),
    redisSetJSON(keyForTrending(10), { items: trendingItems.slice(0, 10) }, COMMUNITY_TRENDING_TTL_SECONDS),
  ]);

  const recentDocs = await IndicatorReport.find()
    .sort({ lastReportedAt: -1, updatedAt: -1 })
    .limit(10)
    .lean();

  const recentItems = recentDocs.map((doc) => ({
    indicator: doc.indicator,
    score: scoreFromSignals({ reports: doc.totalReports }),
    total_reports: doc.totalReports,
    unique_reporters: doc.uniqueReporterCount,
    report_types: buildTypeCounts(doc.reports || []),
  }));

  await Promise.all([
    redisSetJSON(keyForRecent(8), { items: recentItems.slice(0, 8) }, COMMUNITY_RECENT_TTL_SECONDS),
    redisSetJSON(keyForRecent(10), { items: recentItems.slice(0, 10) }, COMMUNITY_RECENT_TTL_SECONDS),
  ]);

  return { trendingCount: trendingDocs.length, recentCount: recentDocs.length };
};

let started = false;
let timer = null;

export async function runRedisPrewarmOnce() {
  if (!getRedisClient()) return;

  try {
    const [usersCount, reputation] = await Promise.all([
      prewarmProfiles(),
      prewarmReputationCaches(),
    ]);

    console.log(
      `[redis] prewarm complete: users=${usersCount}, trending=${reputation.trendingCount}, recent=${reputation.recentCount}`
    );
  } catch (error) {
    console.error("[redis] prewarm failed:", error.message);
  }
}

export function startRedisPrewarmJobs() {
  if (process.env.REDIS_PREWARM_ENABLED === "false") return;
  if (started) return;
  started = true;

  const intervalMs = Math.max(
    60_000,
    Number(process.env.REDIS_PREWARM_INTERVAL_MS || 5 * 60 * 1000)
  );
  const initialDelayMs = Math.max(
    5_000,
    Number(process.env.REDIS_PREWARM_INITIAL_DELAY_MS || 15_000)
  );

  setTimeout(() => {
    void runRedisPrewarmOnce();
  }, initialDelayMs);

  timer = setInterval(() => {
    void runRedisPrewarmOnce();
  }, intervalMs);

  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }

  console.log(`[redis] prewarm scheduler started (every ${Math.round(intervalMs / 1000)}s)`);
}
