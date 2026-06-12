import React, { useMemo, useState } from "react";
import { post } from "../utils/apiClient";
import { getGamificationStats, ML_MODEL_UNLOCK_XP } from "../utils/gamification";

const channels = [
  { value: "general", label: "General" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

const examples = [
  { id: "lottery", label: "Lottery Scam", text: "Congratulations! You've won Rs 5,00,000. Call +91 98765 43210 within 10 minutes to claim.", channel: "sms" },
  { id: "job", label: "Fake Job", text: "Dear Candidate, pay Rs 6,999 onboarding fee via secure link to confirm your job offer.", channel: "email" },
  { id: "otp", label: "OTP Fraud", text: "URGENT: Your account will be blocked in 15 minutes. Share the OTP now with support to keep it active.", channel: "sms" },
  { id: "kyc", label: "KYC Scam", text: "SBI Alert: Your account blocked today. Update KYC here: sbi-verify.in", channel: "sms" },
];

const formatPercent = (value) => `${Math.round((Number(value) || 0) * 100)}%`;

const APIToolPage = () => {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("general");
  const [modelTier, setModelTier] = useState("standard");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const totalXP = useMemo(() => {
    try {
      return getGamificationStats().totalXP || 0;
    } catch {
      return 0;
    }
  }, []);
  const engagementProgress = Math.min(100, Math.round((totalXP / ML_MODEL_UNLOCK_XP) * 100));

  const riskConfig = useMemo(() => {
    if (!result) return null;
    const level = (result.riskLevel || "low").toLowerCase();
    const configs = {
      high: { bg: "bg-red-50", border: "border-red-300", accent: "text-red-600", badge: "bg-red-500" },
      medium: { bg: "bg-amber-50", border: "border-amber-300", accent: "text-amber-600", badge: "bg-amber-500" },
      moderate: { bg: "bg-amber-50", border: "border-amber-300", accent: "text-amber-600", badge: "bg-amber-500" },
      low: { bg: "bg-emerald-50", border: "border-emerald-300", accent: "text-emerald-600", badge: "bg-emerald-500" },
    };
    return configs[level] || configs.low;
  }, [result]);

  const handleAnalyze = async () => {
    const payload = text.trim();
    if (payload.length < 4) {
      setError("Enter at least 4 characters.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResult(null);
    try {
      const data = await post("/stories/detect", { text: payload, channel, modelTier });
      setResult(data);
    } catch (err) {
      setError(err?.message || "Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-700">Live</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Scam Scanner</h1>
            </div>
            {/* Channel Pills */}
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    channel === c.value
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-cyan-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
              <button
                onClick={() => setModelTier("standard")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  modelTier === "standard" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Standard Model
              </button>
              <button
                onClick={() => setModelTier("latest")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  modelTier === "latest"
                    ? "bg-cyan-600 text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Latest Model (Open)
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Engagement milestone: {totalXP.toLocaleString()}/{ML_MODEL_UNLOCK_XP.toLocaleString()} XP ({engagementProgress}%).
          </div>
        </div>
      </div>

      {/* Two Column Layout - QuillBot Style */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid min-h-[500px] gap-4 lg:grid-cols-2">
          
          {/* LEFT COLUMN - Input */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <span className="text-sm font-semibold text-slate-700">Input Message</span>
              <span className="text-xs text-slate-400">{text.length} characters</span>
            </div>
            <div className="relative flex-1">
              <textarea
                className="scanner-input h-full w-full resize-none border-0 bg-transparent p-5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:outline-none"
                placeholder="Paste a suspicious message here to check if it's a scam..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <div className="flex gap-2">
                {examples.slice(0, 3).map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { setText(ex.text); setChannel(ex.channel); setResult(null); }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setText(""); setResult(null); setError(""); }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || text.trim().length < 4}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Result */}
          <div className={`flex flex-col rounded-2xl border shadow-sm transition-all duration-300 ${
            result ? `${riskConfig.bg} ${riskConfig.border}` : "border-slate-200 bg-white"
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100/50 px-5 py-3">
              <span className="text-sm font-semibold text-slate-700">Analysis Result</span>
              {result && (
                <span className={`rounded-full ${riskConfig.badge} px-3 py-1 text-xs font-semibold text-white`}>
                  {result.riskLevel?.toUpperCase() || "LOW"} RISK
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-6">
              {/* Empty State */}
              {!result && !isLoading && !error && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">Paste a message and click <strong>Analyze</strong></p>
                  <p className="mt-1 text-sm text-slate-400">Results will appear here</p>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                    <svg className="h-8 w-8 animate-spin text-cyan-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <p className="font-medium text-cyan-700">Analyzing message...</p>
                </div>
              )}

              {/* Error */}
              {error && !result && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="w-full space-y-6">
                  {/* Verdict */}
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${result.isScam ? "text-red-600" : "text-emerald-600"}`}>
                      {result.isScam ? "⚠️ Scam Detected" : "✓ Looks Safe"}
                    </p>
                    <p className="mt-2 text-slate-600">
                      {result.isScam ? "This message has scam indicators" : "No scam patterns found"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/70 p-4 text-center">
                      <p className="text-xs font-medium uppercase text-slate-500">Probability</p>
                      <p className={`mt-1 text-3xl font-bold ${result.isScam ? "text-red-600" : "text-emerald-600"}`}>
                        {formatPercent(result.scamProbability)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-4 text-center">
                      <p className="text-xs font-medium uppercase text-slate-500">Confidence</p>
                      <p className="mt-1 text-3xl font-bold text-slate-800">
                        {typeof result.confidence === "number" ? formatPercent(result.confidence) : "High"}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                    <span>Channel: <strong className="text-slate-700">{(result.channel || channel).toUpperCase()}</strong></span>
                    <span>Model: <strong className="text-slate-700">{result.modelName || "generalized"} v{result.modelVersion || "3.0"}</strong></span>
                    <span>Tier: <strong className="text-slate-700">{(result.modelTierUsed || modelTier).toUpperCase()}</strong></span>
                  </div>

                  {/* Safety Tips */}
                  {result.isScam && (
                    <div className="rounded-xl bg-red-100/60 p-4 text-sm text-red-800">
                      <p className="font-semibold">🛡️ Stay Safe:</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Don't click links or share OTP</li>
                        <li>Report at cybercrime.gov.in</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIToolPage;
