import express from "express";
import auth from "../middleware/auth.js";
import { reputationCheckRateLimiter, reputationReportRateLimiter } from "../middleware/rateLimit.js";
import {
  checkIndicatorReputation,
  submitIndicatorReport,
  getCommunityStats,
  getTrendingReports,
  getRecentReports,
  getMyReportImpact,
} from "../controller/reputationController.js";

const router = express.Router();

router.get("/check", reputationCheckRateLimiter, checkIndicatorReputation);
router.get("/stats", getCommunityStats);
router.get("/trending", getTrendingReports);
router.get("/recent", getRecentReports);
router.get("/impact", auth, getMyReportImpact);
router.post("/report", auth, reputationReportRateLimiter, submitIndicatorReport);

export default router;
