import mongoose from "mongoose";

const indicatorReportEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportType: {
      type: String,
      enum: ["scam", "spam", "harassment", "phishing", "malware", "other"],
      required: true,
    },
    description: { type: String, default: "", maxlength: 600 },
    proofUrl: { type: String, default: "", maxlength: 600 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const indicatorReportSchema = new mongoose.Schema(
  {
    indicator: { type: String, required: true },
    normalizedIndicator: { type: String, required: true, unique: true, index: true },
    indicatorType: {
      type: String,
      enum: ["url", "ip", "domain", "email", "phone", "unknown"],
      required: true,
    },
    reports: { type: [indicatorReportEntrySchema], default: [] },
    totalReports: { type: Number, default: 0 },
    uniqueReporterCount: { type: Number, default: 0 },
    lastReportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

indicatorReportSchema.pre("save", function updateCounters(next) {
  this.totalReports = this.reports.length;

  const uniqueReporters = new Set(
    this.reports.map((report) => String(report.userId))
  );
  this.uniqueReporterCount = uniqueReporters.size;

  this.lastReportedAt =
    this.reports.length > 0
      ? this.reports[this.reports.length - 1].updatedAt || this.reports[this.reports.length - 1].createdAt
      : this.updatedAt;

  next();
});

const IndicatorReport = mongoose.model("IndicatorReport", indicatorReportSchema);

export default IndicatorReport;
