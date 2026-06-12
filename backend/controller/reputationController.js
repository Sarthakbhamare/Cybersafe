import IndicatorReport from "../models/IndicatorReport.js";
import { detectIndicatorType, normalizeIndicator } from "../utils/indicatorUtils.js";
import { redisDelete, redisDeleteByPrefix, redisGetJSON, redisSetJSON } from "../config/redis.js";

const VIRUSTOTAL_API_BASE = "https://www.virustotal.com/api/v3";
const COMMUNITY_STATS_TTL_SECONDS = 60;
const COMMUNITY_TRENDING_TTL_SECONDS = 45;
const COMMUNITY_RECENT_TTL_SECONDS = 45;
const INDICATOR_CHECK_TTL_SECONDS = 10 * 60;

const COMMUNITY_STATS_CACHE_KEY = "rep:stats:v1";
const COMMUNITY_TRENDING_CACHE_PREFIX = "rep:trending:v1:";
const COMMUNITY_RECENT_CACHE_PREFIX = "rep:recent:v1:";
const INDICATOR_CHECK_CACHE_PREFIX = "rep:check:v1:";

const keyForTrending = (limit) => `${COMMUNITY_TRENDING_CACHE_PREFIX}${limit}`;
const keyForRecent = (limit) => `${COMMUNITY_RECENT_CACHE_PREFIX}${limit}`;
const keyForIndicatorCheck = (normalizedIndicator) => `${INDICATOR_CHECK_CACHE_PREFIX}${normalizedIndicator}`;

function buildTypeCounts(reports = []) {
  const map = new Map();
  reports.forEach((report) => {
    const prev = map.get(report.reportType) || { count: 0, lastSeen: null };
    prev.count += 1;
    const timestamp = report.updatedAt || report.createdAt || new Date();
    prev.lastSeen = !prev.lastSeen || new Date(timestamp) > new Date(prev.lastSeen) ? timestamp : prev.lastSeen;
    map.set(report.reportType, prev);
  });

  return Array.from(map.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    last_seen: data.lastSeen,
  }));
}

function scoreFromSignals({ severity = "safe", reports = 0 }) {
  const severityScore = {
    critical: 10,
    high: 25,
    medium: 50,
    low: 70,
    safe: 90,
  };

  const base = severityScore[severity] ?? 75;
  const reportPenalty = Math.min(35, Math.round(reports / 5));
  return Math.max(0, base - reportPenalty);
}

async function checkVirusTotal(indicator, indicatorType) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  let endpoint = null;
  try {
    if (indicatorType === "url") {
      const encoded = Buffer.from(indicator).toString("base64url");
      endpoint = `${VIRUSTOTAL_API_BASE}/urls/${encoded}`;
    } else if (indicatorType === "ip") {
      endpoint = `${VIRUSTOTAL_API_BASE}/ip_addresses/${indicator}`;
    } else if (indicatorType === "domain") {
      endpoint = `${VIRUSTOTAL_API_BASE}/domains/${indicator}`;
    } else if (indicatorType === "email") {
      const domain = indicator.split("@")[1];
      if (!domain) return null;
      endpoint = `${VIRUSTOTAL_API_BASE}/domains/${domain}`;
    }

    if (!endpoint) return null;

    const response = await fetch(endpoint, {
      headers: { "x-apikey": apiKey },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const stats = payload?.data?.attributes?.last_analysis_stats || {};
    const categories = payload?.data?.attributes?.categories || {};

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const reports = malicious + suspicious;

    let severity = "safe";
    if (malicious > 5 || suspicious > 10) severity = "critical";
    else if (malicious > 2 || suspicious > 5) severity = "high";
    else if (malicious > 0 || suspicious > 0) severity = "medium";

    return {
      source: "VirusTotal",
      externalReports: reports,
      malicious,
      suspicious,
      severity,
      category:
        Object.keys(categories)[0] ||
        (severity === "safe" ? "No Known Threat" : "Potential Threat"),
      lastSeen: payload?.data?.attributes?.last_analysis_date
        ? new Date(payload.data.attributes.last_analysis_date * 1000).toISOString()
        : null,
    };
  } catch (error) {
    console.error("VirusTotal check failed:", error.message);
    return null;
  }
}

function toReputationResponse({ indicator, normalizedIndicator, indicatorType, reportDoc, vt }) {
  const reportTypes = buildTypeCounts(reportDoc?.reports || []);
  const totalReports = reportDoc?.totalReports || 0;
  const uniqueReporters = reportDoc?.uniqueReporterCount || 0;

  const severity = vt?.severity || (totalReports > 10 ? "high" : totalReports > 0 ? "medium" : "safe");
  const category =
    vt?.category ||
    (totalReports > 0 ? "Community Reported Threat" : "No Community Reports Yet");

  return {
    indicator,
    normalizedIndicator,
    indicatorType,
    type: severity === "safe" ? "clean" : "malicious",
    severity,
    category,
    reports: totalReports,
    total_reports: totalReports,
    unique_reporters: uniqueReporters,
    externalReports: vt?.externalReports || 0,
    report_types: reportTypes,
    lastSeen: reportDoc?.lastReportedAt || vt?.lastSeen || null,
    reputationScore: scoreFromSignals({ severity, reports: totalReports }),
    source: vt ? "VirusTotal + CyberSafe Community" : "CyberSafe Community",
    description:
      totalReports > 0
        ? `Reported by ${uniqueReporters} community member(s) with ${totalReports} total reports.`
        : "No community reports found for this indicator.",
  };
}

export const checkIndicatorReputation = async (req, res) => {
  try {
    const indicator = String(req.query.indicator || "").trim();
    if (!indicator) {
      return res.status(400).json({ error: "Indicator is required" });
    }

    const indicatorType = detectIndicatorType(indicator);
    if (indicatorType === "unknown") {
      return res.status(400).json({ error: "Unsupported indicator format" });
    }

    const normalizedIndicator = normalizeIndicator(indicator, indicatorType);
    const cacheKey = keyForIndicatorCheck(normalizedIndicator);
    const cached = await redisGetJSON(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [reportDoc, vt] = await Promise.all([
      IndicatorReport.findOne({ normalizedIndicator }).lean(),
      checkVirusTotal(indicator, indicatorType),
    ]);

    const payload = toReputationResponse({
      indicator,
      normalizedIndicator,
      indicatorType,
      reportDoc,
      vt,
    });

    await redisSetJSON(cacheKey, payload, INDICATOR_CHECK_TTL_SECONDS);

    return res.json(payload);
  } catch (error) {
    console.error("Reputation check failed:", error);
    return res.status(500).json({ error: "Failed to check indicator reputation" });
  }
};

export const submitIndicatorReport = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const indicator = String(req.body?.indicator || "").trim();
    const reportType = String(req.body?.type || "other").trim().toLowerCase();
    const description = String(req.body?.description || "").trim();
    const proofUrl = String(req.body?.proofUrl || "").trim();

    if (!indicator) {
      return res.status(400).json({ error: "Indicator is required" });
    }

    const indicatorType = detectIndicatorType(indicator);
    if (indicatorType === "unknown") {
      return res.status(400).json({ error: "Unsupported indicator format" });
    }

    const normalizedIndicator = normalizeIndicator(indicator, indicatorType);

    let doc = await IndicatorReport.findOne({ normalizedIndicator });
    if (!doc) {
      doc = new IndicatorReport({
        indicator,
        normalizedIndicator,
        indicatorType,
        reports: [],
      });
    }

    const existingIndex = doc.reports.findIndex(
      (entry) => String(entry.userId) === String(req.user.id)
    );

    const now = new Date();

    if (existingIndex >= 0) {
      doc.reports[existingIndex].reportType = reportType;
      doc.reports[existingIndex].description = description;
      doc.reports[existingIndex].proofUrl = proofUrl;
      doc.reports[existingIndex].updatedAt = now;
    } else {
      doc.reports.push({
        userId: req.user.id,
        reportType,
        description,
        proofUrl,
        createdAt: now,
        updatedAt: now,
      });
    }

    await doc.save();

    await redisDelete(keyForIndicatorCheck(doc.normalizedIndicator));
    await redisDelete(COMMUNITY_STATS_CACHE_KEY);
    await redisDeleteByPrefix(COMMUNITY_TRENDING_CACHE_PREFIX);
    await redisDeleteByPrefix(COMMUNITY_RECENT_CACHE_PREFIX);

    return res.status(201).json({
      message: "Report submitted successfully",
      indicator: doc.indicator,
      normalizedIndicator: doc.normalizedIndicator,
      total_reports: doc.totalReports,
      unique_reporters: doc.uniqueReporterCount,
      report_types: buildTypeCounts(doc.reports),
      lastSeen: doc.lastReportedAt,
    });
  } catch (error) {
    console.error("Submit report failed:", error);
    return res.status(500).json({ error: "Failed to submit report" });
  }
};

export const getCommunityStats = async (_req, res) => {
  try {
    const cached = await redisGetJSON(COMMUNITY_STATS_CACHE_KEY);
    if (cached) {
      return res.json(cached);
    }

    const docs = await IndicatorReport.find().lean();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let reportsThisWeek = 0;
    let totalReports = 0;
    const contributorSet = new Set();

    docs.forEach((doc) => {
      totalReports += doc.totalReports || 0;
      (doc.reports || []).forEach((report) => {
        contributorSet.add(String(report.userId));
        const ts = new Date(report.updatedAt || report.createdAt).getTime();
        if (ts >= weekAgo) reportsThisWeek += 1;
      });
    });

    const activeContributors = contributorSet.size;
    const indicatorsTracked = docs.length;
    const communityScore = totalReports === 0
      ? 100
      : Math.max(60, Math.min(99, Math.round((activeContributors / totalReports) * 100 + 40)));

    const payload = {
      reportsThisWeek,
      activeContributors,
      indicatorsTracked,
      totalReports,
      communityScore,
    };

    await redisSetJSON(COMMUNITY_STATS_CACHE_KEY, payload, COMMUNITY_STATS_TTL_SECONDS);
    res.json(payload);
  } catch (error) {
    console.error("Get community stats failed:", error);
    res.status(500).json({ error: "Failed to fetch community stats" });
  }
};

export const getTrendingReports = async (req, res) => {
  try {
    const limit = Math.min(25, Math.max(1, Number(req.query.limit || 10)));
    const cacheKey = keyForTrending(limit);

    const cached = await redisGetJSON(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const docs = await IndicatorReport.find()
      .sort({ totalReports: -1, lastReportedAt: -1 })
      .limit(limit)
      .lean();

    const items = docs.map((doc) => ({
      indicator: doc.indicator,
      normalizedIndicator: doc.normalizedIndicator,
      indicatorType: doc.indicatorType,
      reports: doc.totalReports,
      uniqueReporters: doc.uniqueReporterCount,
      trend: "up",
      report_types: buildTypeCounts(doc.reports || []),
      lastSeen: doc.lastReportedAt,
    }));

    const payload = { items };
    await redisSetJSON(cacheKey, payload, COMMUNITY_TRENDING_TTL_SECONDS);
    res.json(payload);
  } catch (error) {
    console.error("Get trending reports failed:", error);
    res.status(500).json({ error: "Failed to fetch trending reports" });
  }
};

export const getRecentReports = async (req, res) => {
  try {
    const limit = Math.min(25, Math.max(1, Number(req.query.limit || 10)));
    const cacheKey = keyForRecent(limit);

    const cached = await redisGetJSON(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const docs = await IndicatorReport.find()
      .sort({ lastReportedAt: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    const items = docs.map((doc) => ({
      indicator: doc.indicator,
      score: scoreFromSignals({ severity: doc.totalReports > 10 ? "high" : doc.totalReports > 0 ? "medium" : "safe", reports: doc.totalReports }),
      total_reports: doc.totalReports,
      unique_reporters: doc.uniqueReporterCount,
      report_types: buildTypeCounts(doc.reports || []),
    }));

    const payload = { items };
    await redisSetJSON(cacheKey, payload, COMMUNITY_RECENT_TTL_SECONDS);
    res.json(payload);
  } catch (error) {
    console.error("Get recent reports failed:", error);
    res.status(500).json({ error: "Failed to fetch recent reports" });
  }
};

export const getMyReportImpact = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const docs = await IndicatorReport.find({ "reports.userId": req.user.id }).lean();

    let reportsSubmitted = 0;
    const indicators = new Set();
    docs.forEach((doc) => {
      const mine = (doc.reports || []).filter((r) => String(r.userId) === String(req.user.id));
      reportsSubmitted += mine.length;
      if (mine.length > 0) indicators.add(doc.normalizedIndicator);
    });

    // Rough impact estimate backed by actual report count.
    const peopleProtectedEstimate = reportsSubmitted * 37;

    let contributorLevel = "Bronze";
    if (reportsSubmitted >= 50) contributorLevel = "Platinum";
    else if (reportsSubmitted >= 20) contributorLevel = "Gold";
    else if (reportsSubmitted >= 10) contributorLevel = "Silver";

    res.json({
      reportsSubmitted,
      indicatorsContributed: indicators.size,
      peopleProtectedEstimate,
      contributorLevel,
    });
  } catch (error) {
    console.error("Get impact failed:", error);
    res.status(500).json({ error: "Failed to fetch your impact" });
  }
};
