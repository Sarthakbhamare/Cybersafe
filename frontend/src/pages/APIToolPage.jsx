import React, { useEffect, useId, useMemo, useRef, useState } from "react";

const CHARACTER_LIMIT = 2000;
const MODEL_LAST_UPDATE = "Nov 05, 2025 • 09:15 AM IST";
const MODEL_STATUS = "training";
const TRAINING_PROGRESS = 0.15;
const TRAINING_PROGRESS_DEGREES = Math.floor(TRAINING_PROGRESS * 360);
const TRAINING_RING_STYLE = {
  background: `conic-gradient(#6366f1 ${TRAINING_PROGRESS_DEGREES}deg, rgba(99,102,241,0.15) ${TRAINING_PROGRESS_DEGREES}deg 360deg)`,
  boxShadow: "0 24px 60px rgba(99,102,241,0.28)",
};

const SECTION_LABEL_CLASS = "text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70";
const PILL_CLASS = "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80";
const STATUS_PILL_CLASS = "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100/80";
const SURFACE_BASE_CLASS = "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl";
const SURFACE_TEXT_MUTED = "text-sm text-slate-200/80";
const SURFACE_SHADOW_HEAVY = "shadow-[0_32px_96px_rgba(12,19,34,0.55)]";
const SURFACE_SHADOW_MEDIUM = "shadow-[0_24px_70px_rgba(12,19,34,0.45)]";
const HERO_TITLE_CLASS = "relative mt-6 text-[clamp(2.5rem,5vw,3.5rem)] font-semibold leading-tight";
const SECTION_TITLE_CLASS = "text-[clamp(1.5rem,3vw,2.15rem)] font-semibold";
const GRID_WRAPPER_CLASS = "relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 lg:gap-14";

const modelMetrics = [
  { label: "Model confidence", value: "98.4%", detail: "Last 10k scans" },
  { label: "Response time", value: "720ms", detail: "P95 • Global edge" },
  { label: "Coverage", value: "37 languages", detail: "Expanding weekly" },
];

const analysisModes = [
  { value: "dual", label: "Dual engine", description: "LLM verdict fused with heuristics" },
  { value: "nlp", label: "NLP signature", description: "Pattern rules and playbooks" },
  { value: "vision", label: "Vision co-pilot", description: "Document and screenshot OCR" },
];

const quickExamples = [
  {
    id: "lottery",
    label: "Lottery Scam",
    text: "Congratulations! You've won ₹5,00,000. Call +91 98765 43210 within 10 minutes to claim or the winnings expire.",
  },
  {
    id: "job",
    label: "Fake Job Offer",
    text: "Dear Candidate, you have been shortlisted for a premium role. Pay the processing fee of ₹6,999 via secure link to confirm onboarding.",
  },
  {
    id: "romance",
    label: "Romance Scam",
    text: "I feel so close to you already. Can you help me with an urgent transfer to my family? I'll pay you back tomorrow.",
  },
  {
    id: "otp",
    label: "OTP Fraud",
    text: "Your bank account will be blocked. Share the OTP now to keep it active. This is from HQ security desk.",
  },
  {
    id: "bank",
    label: "Bank Alert",
    text: "Update KYC to avoid account suspension. Click secure-upi.co.in and enter card PIN + CVV for verification.",
  },
];

const personaCatalog = {
  lottery: {
    label: "Lottery Scam",
    preset:
      "Congratulations! You've won ₹5,00,000. Call +91 98765 43210 within 10 minutes to claim or the winnings expire.",
    riskLevel: "High risk",
    confidence: 88,
    summary:
      "Language mirrors high-value lottery scam patterns. Urgency play and unverifiable prize instructions detected.",
    signals: ["Unverifiable prize", "10 minute deadline"],
    entities: ["₹5,00,000", "+91 98765 43210"],
    actions: [
      "Block the sender and archive the evidence.",
      "File a case inside the CyberSafe console for downstream audit.",
      "Share the anti-lottery scam playbook with impacted users.",
    ],
  },
  job: {
    label: "Fake Job Offer",
    preset:
      "Dear Candidate, you have been shortlisted for a premium role. Pay the processing fee of ₹6,999 via secure link to confirm onboarding.",
    riskLevel: "Medium risk",
    confidence: 74,
    summary:
      "Advance-fee recruitment scheme. Payment demand prior to onboarding violates enterprise guardrails.",
    signals: ["Processing fee request", "External payment link"],
    entities: ["₹6,999", "secure link"],
    actions: [
      "Route to corporate hiring for source verification.",
      "Decline payment and notify the security awareness desk.",
      "Enroll reported candidates into the micro-learning module.",
    ],
  },
  romance: {
    label: "Romance Scam",
    preset:
      "I feel so close to you already. Can you help me with an urgent transfer to my family? I'll pay you back tomorrow.",
    riskLevel: "Elevated risk",
    confidence: 82,
    summary:
      "Emotionally leveraged monetary solicitation that matches curated romance scam signatures.",
    signals: ["Urgent financial request", "Promise of repayment"],
    entities: ["Family emergency"],
    actions: [
      "Pause the conversation until identity is verified.",
      "Retain transcript for the fraud intelligence backlog.",
      "Alert the financial wellness desk if funds moved.",
    ],
  },
  otp: {
    label: "OTP Fraud",
    preset:
      "Your bank account will be blocked. Share the OTP now to keep it active. This is from HQ security desk.",
    riskLevel: "Critical risk",
    confidence: 93,
    summary:
      "OTP harvesting attempt using account suspension scare tactics. Hard block recommended immediately.",
    signals: ["Credential harvesting", "Account suspension bait"],
    entities: ["OTP", "Account suspension"],
    actions: [
      "Do not share credentials on non-trusted channels.",
      "Escalate to the fraud desk and rotate second factors.",
      "Push sender indicators into the SIEM for monitoring.",
    ],
  },
  bank: {
    label: "Bank Alert",
    preset:
      "Update KYC to avoid account suspension. Click secure-upi.co.in and enter card PIN + CVV for verification.",
    riskLevel: "High risk",
    confidence: 85,
    summary: "Phishing payload targeting the KYC workflow. Fraudulent domain and CVV capture intent detected.",
    signals: ["Suspicious domain", "Sensitive credential request"],
    entities: ["secure-upi.co.in", "CVV"],
    actions: [
      "Launch takedown motion with domain registrar.",
      "Send advisories to impacted customer cohorts.",
      "Feed indicators into the threat intelligence graph.",
    ],
  },
};

const personaOrder = Object.keys(personaCatalog);

const guardrailTags = ["PII redaction", "Prompt firewall", "SOC2 audit trail"];
const complianceBadges = ["SOC2 Type II", "ISO 27001", "GDPR"];
const assurancePoints = ["Zero data retention", "Analyst escalation", "Immutable logging"];

const telemetryTimeline = [
  { step: "Signal heuristics", detail: "Pattern library cross-check complete", latency: "12ms" },
  { step: "LLM verdict", detail: "Confidence aggregation finalised", latency: "31ms" },
  { step: "Guardrail sync", detail: "Redaction policies and escalation SLA matched", latency: "45ms" },
];

const launchRoadmap = [
  {
    phase: "Pilot onboarding",
    status: "Live",
    description: "Red-team datasets streaming for baseline calibration and response tuning.",
  },
  {
    phase: "Realtime inference",
    status: "QA",
    description: "Latency hardening across Mumbai, Frankfurt and Oregon edges.",
  },
  {
    phase: "Governance suite",
    status: "In design",
    description: "SOC workflows, PDF exports and SIEM connectors in stakeholder review.",
  },
];

const coverageHighlights = [
  "Social engineering playbooks (lottery, job, romance)",
  "Financial fraud triggers (UPI, wire transfer, account reset)",
  "Multilingual phishing classification across 37 locales",
  "Suspicious contact extraction with real-time redaction",
];

const developerPreview = {
  request: `POST https://api.cybersafe.ai/v1/detector/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": "enterprise_dual",
  "persona": "lottery",
  "payload": "<message_or_email_body>",
  "metadata": {
    "locale": "en-IN",
    "channel": "email"
  }
}`,
  response: `200 OK
{
  "risk": "high",
  "score": 0.82,
  "signals": ["upfront_fee", "urgency_trigger"],
  "recommended_actions": [
    "block_sender",
    "escalate_to_tier1"
  ],
  "extracted_entities": [
    { "type": "phone", "value": "+91 98765 43210" }
  ]
}`,
};

const APIToolPage = () => {
  const [activePersona, setActivePersona] = useState(personaOrder[0]);
  const [activeMode, setActiveMode] = useState(analysisModes[0].value);
  const [inputText, setInputText] = useState(personaCatalog[personaOrder[0]].preset);
  const [analysisResult, setAnalysisResult] = useState(personaCatalog[personaOrder[0]]);
  const [statusMessage, setStatusMessage] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const personaPreset = useMemo(() => personaCatalog[activePersona], [activePersona]);
  const analyzeTimeoutRef = useRef(null);
  const statusRef = useRef(null);

  const textAreaId = useId();
  const charMeterId = useId();
  const statusMessageId = useId();
  const verdictSectionId = useId();

  const characterCount = Math.min(inputText.length, CHARACTER_LIMIT);
  const characterProgress = Math.min(100, Math.round((characterCount / CHARACTER_LIMIT) * 100));
  const approachingCharacterLimit = characterProgress >= 90 && characterProgress < 100;
  const isAtLimit = characterProgress === 100;
  const characterBarClass = isAtLimit
    ? "bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400"
    : approachingCharacterLimit
      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-indigo-400"
      : "bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400";
  const textAreaDescribedBy = statusMessage ? `${charMeterId} ${statusMessageId}` : charMeterId;

  const activeModeMeta = useMemo(
    () => analysisModes.find((mode) => mode.value === activeMode) ?? analysisModes[0],
    [activeMode],
  );

  const handlePersonaChange = (personaKey) => {
    setActivePersona(personaKey);
    setInputText(personaCatalog[personaKey].preset);
    setAnalysisResult(personaCatalog[personaKey]);
    setStatusMessage("");
    setAnalyzing(false);
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }
  };

  const handleQuickExample = (item) => {
    handlePersonaChange(item.id);
    setInputText(item.text);
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setStatusMessage("Enter a message to analyze.");
      return;
    }

    setAnalyzing(true);
    setStatusMessage("");
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }

    analyzeTimeoutRef.current = window.setTimeout(() => {
      const persona = personaCatalog[activePersona];
      setAnalysisResult(persona);
      setStatusMessage(
        `${activeModeMeta.label} preview gated while training completes. Simulated verdict: ${persona.riskLevel} at ${persona.confidence}% confidence.`,
      );
      setAnalyzing(false);
    }, 600);
  };

  const handleReset = () => {
    setInputText(personaPreset.preset);
    setStatusMessage("");
    setAnalyzing(false);
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (statusMessage && statusRef.current) {
      statusRef.current.focus();
    }
  }, [statusMessage]);

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.28),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-90">
        <div className="absolute -top-32 left-6 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <main className={GRID_WRAPPER_CLASS}>
        <header className="grid gap-6 lg:grid-cols-[2fr,1.1fr]">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,106,255,0.35),_rgba(15,23,42,0.95))] p-10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
            <div className="absolute inset-0 mix-blend-soft-light opacity-40">
              <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-sky-500/35 blur-3xl" />
              <div className="absolute bottom-12 left-8 h-28 w-28 rounded-full bg-indigo-500/25 blur-2xl" />
            </div>

            <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/90">
              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Dual model</span>
              <span className="rounded-full bg-emerald-500/25 px-4 py-2 text-emerald-200">Realtime</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Preview</span>
            </div>

            <h1 className={HERO_TITLE_CLASS}>Dual Model Threat Detector</h1>
            <p className="relative mt-4 max-w-xl text-sm text-slate-200/85">
              Enterprise-grade orchestration that classifies suspicious messages, extracts risky contact points, and recommends next steps within milliseconds.
            </p>

            <dl className="relative mt-8 grid gap-4 sm:grid-cols-3">
              {modelMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 text-slate-100/90"
                >
                  <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-indigo-200/70">{metric.label}</dt>
                  <dd className="mt-3 text-2xl font-semibold text-white">{metric.value}</dd>
                  <p className="mt-2 text-[0.75rem] text-slate-300/80">{metric.detail}</p>
                </div>
              ))}
            </dl>
          </section>

          <aside className="flex flex-col gap-6">
            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_SHADOW_HEAVY} bg-white/10 p-8 text-slate-100`}>
              <div className="flex items-center justify-between text-sm text-slate-200/85">
                <span className="font-medium">Model status</span>
                <span className="inline-flex items-center gap-2 text-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-300" /> {MODEL_STATUS}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <div className="absolute inset-2 rounded-full" style={TRAINING_RING_STYLE} />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-950/85 text-center">
                    <span className="text-xl font-semibold text-indigo-100">
                      {Math.round(TRAINING_PROGRESS * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-200/80">
                  <p>Last updated {MODEL_LAST_UPDATE}. Pipelines realign with ISO 27001 and SOC2 guardrails.</p>
                  <p className={`${STATUS_PILL_CLASS} mt-3`}>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" /> Guardrails activate at GA
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs text-slate-200/80">
                <div>
                  <p className={SECTION_LABEL_CLASS}>Guardrails</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guardrailTags.map((chip) => (
                      <span key={chip} className={PILL_CLASS}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={SECTION_LABEL_CLASS}>Certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {complianceBadges.map((chip) => (
                      <span key={chip} className={PILL_CLASS}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={SECTION_LABEL_CLASS}>Assurances</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assurancePoints.map((item) => (
                      <span key={item} className={PILL_CLASS}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_TEXT_MUTED} p-6`}>
              <p className="font-medium text-indigo-100">Why this matters</p>
              <p className="mt-2 text-slate-200/70">
                Dual engines corroborate curated fraud playbooks with language intelligence, enabling faster analyst decisions and auditable outcomes.
              </p>
            </div>
          </aside>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.9fr,1.1fr]">
          <div className="flex flex-col gap-6">
            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_SHADOW_HEAVY} bg-slate-950/70 p-8 text-slate-100`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">Realtime threat analyzer</p>
                  <h2 className={`${SECTION_TITLE_CLASS} mt-1`}>Evaluate suspicious communications instantly</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisModes.map((mode) => {
                    const active = mode.value === activeMode;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setActiveMode(mode.value)}
                        aria-pressed={active}
                        aria-label={`${mode.label} mode`}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                          active
                            ? "border border-indigo-400 bg-indigo-600 text-white shadow-[0_12px_32px_rgba(79,70,229,0.35)]"
                            : "border border-white/15 bg-white/10 text-indigo-100 hover:border-white/35"
                        }`}
                        title={mode.description}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr,0.9fr]">
                <div className="flex flex-col gap-4">
                  <label className={SECTION_LABEL_CLASS} htmlFor={textAreaId}>
                    Suspicious message
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    rows={6}
                    id={textAreaId}
                    aria-describedby={textAreaDescribedBy}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-white shadow-inner shadow-indigo-900/20 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="Paste the suspicious message or email copy here"
                    maxLength={CHARACTER_LIMIT}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                    <div className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> {activeModeMeta.description}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10 sm:w-48" aria-hidden="true">
                        <div
                          className={`h-full rounded-full ${characterBarClass}`}
                          style={{ width: `${characterProgress}%` }}
                        />
                      </div>
                      <span id={charMeterId} className="font-semibold text-slate-200/85">
                        {characterCount} / {CHARACTER_LIMIT}
                      </span>
                    </div>
                  </div>
                  {approachingCharacterLimit ? (
                    <p className="text-xs text-amber-200/80">
                      {isAtLimit ? "Character limit reached." : "Approaching limit—trim non-essential context for fastest inference."}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4">
                  <label className={SECTION_LABEL_CLASS}>
                    Personas
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {personaOrder.map((personaKey) => {
                      const persona = personaCatalog[personaKey];
                      const active = personaKey === activePersona;
                      return (
                        <button
                          key={personaKey}
                          type="button"
                          onClick={() => handlePersonaChange(personaKey)}
                          aria-pressed={active}
                          aria-label={`${persona.label} persona`}
                          className={`rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                            active
                              ? "border-indigo-400 bg-indigo-500/30 text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)]"
                              : "border-white/15 bg-white/10 text-indigo-100 hover:border-white/35"
                          }`}
                        >
                          <p className="text-sm font-semibold">{persona.label}</p>
                          <p className="mt-1 text-[0.7rem] text-indigo-100/70">{persona.summary}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className={SECTION_LABEL_CLASS}>Quick examples</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {quickExamples.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleQuickExample(item)}
                          aria-label={`Load ${item.label} example`}
                          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left text-xs text-slate-100 transition hover:border-indigo-300 hover:bg-indigo-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                        >
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-[0.7rem] text-slate-200/80">{item.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || analyzing}
                  aria-busy={analyzing}
                  aria-controls={verdictSectionId}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {analyzing ? "Analyzing..." : "Run analysis"}
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:border-white/35 hover:bg-white/15"
                >
                  Reset to preset
                </button>
                {statusMessage ? (
                  <p
                    ref={statusRef}
                    id={statusMessageId}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    tabIndex={-1}
                    className="text-sm text-slate-200/80"
                  >
                    {statusMessage}
                  </p>
                ) : (
                  <p id={statusMessageId} className="text-sm text-slate-400/70">
                    Preview mode delivers simulated verdicts while training completes.
                  </p>
                )}
              </div>
            </div>

            <section
              id={verdictSectionId}
              className={`${SURFACE_BASE_CLASS} ${SURFACE_SHADOW_MEDIUM} relative overflow-hidden bg-white/5 p-8 text-slate-100`}
              aria-busy={analyzing}
            >
              {analyzing ? (
                <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-indigo-500/10 via-indigo-400/5 to-emerald-400/10" />
              ) : null}
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">Simulated verdict</p>
                  <h3 className={`${SECTION_TITLE_CLASS} mt-1`}>{analysisResult.label}</h3>
                </div>
                <div className="rounded-2xl border border-white/20 bg-slate-950/50 px-5 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.25em] text-indigo-200/70">Risk level</p>
                  <p className="text-lg font-semibold text-white">{analysisResult.riskLevel}</p>
                  <p className="text-xs text-slate-300/80">Confidence {analysisResult.confidence}%</p>
                </div>
              </div>

              <div className="relative mt-6 grid gap-6 lg:grid-cols-[1.25fr,1fr]">
                <div>
                  <p className={SECTION_LABEL_CLASS}>Summary</p>
                  <p className="mt-2 text-sm text-slate-200/80">{analysisResult.summary}</p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className={SECTION_LABEL_CLASS}>Signals</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-200/80">
                        {analysisResult.signals.map((signal) => (
                          <li key={signal} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className={SECTION_LABEL_CLASS}>Entities</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-200/80">
                        {analysisResult.entities.map((entity) => (
                          <li key={entity} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            <span>{entity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <p className={SECTION_LABEL_CLASS}>Actions</p>
                  <ul className="mt-3 space-y-3 text-sm text-slate-200/85">
                    {analysisResult.actions.map((action) => (
                      <li key={action} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_TEXT_MUTED} p-7`}>
              <p className={SECTION_LABEL_CLASS}>Telemetry</p>
              <ol className="mt-4 space-y-4">
                {telemetryTimeline.map((item) => (
                  <li key={item.step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{item.step}</p>
                    <p className="mt-1 text-xs text-slate-200/75">{item.detail}</p>
                    <p className="mt-2 text-xs text-indigo-200/70">Latency {item.latency}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_TEXT_MUTED} p-7`}>
              <p className={SECTION_LABEL_CLASS}>Launch roadmap</p>
              <ul className="mt-4 space-y-4">
                {launchRoadmap.map((item) => (
                  <li key={item.phase} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-semibold">{item.phase}</span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-indigo-100/80">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-200/75">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_TEXT_MUTED} p-7`}>
              <p className={SECTION_LABEL_CLASS}>Coverage</p>
              <ul className="mt-4 space-y-3">
                {coverageHighlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-300" />
                    <span className="text-slate-200/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${SURFACE_BASE_CLASS} ${SURFACE_SHADOW_MEDIUM} bg-slate-950/60 p-7 text-sm text-slate-200/80`}>
              <p className={SECTION_LABEL_CLASS}>Developer preview</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs text-indigo-100/90">
                <pre className="whitespace-pre-wrap">{developerPreview.request}</pre>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs text-emerald-100/90">
                <pre className="whitespace-pre-wrap">{developerPreview.response}</pre>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default APIToolPage;
