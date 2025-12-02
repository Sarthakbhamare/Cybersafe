import React, { useMemo, useState } from "react";

const CHARACTER_LIMIT = 2000;
const TRAINING_PROGRESS = 0.15;

const modelMetrics = [
  { label: "Model confidence", value: "98.4%", detail: "Last 10k scans" },
  { label: "Response time", value: "720ms", detail: "P95 • Global edge" },
  { label: "Coverage", value: "37 languages", detail: "Expanding weekly" },
];

const analysisModes = [
  { value: "dual", label: "Dual engine", description: "LLM verdict fused with heuristics" },
  { value: "nlp", label: "NLP signature", description: "Pattern rules + playbooks" },
  { value: "vision", label: "Vision co-pilot", description: "Document & screenshot OCR" },
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
  "fake-job": {
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
    summary: "Emotionally leveraged monetary solicitation that matches curated romance scam signatures.",
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
    summary: "OTP harvesting attempt using account suspension scare tactics. Hard block recommended immediately.",
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

const sessionFlags = [
  { label: "Protected inference session", color: "bg-emerald-400" },
  { label: "Tier-1 analyst escalation", color: "bg-indigo-400" },
];

const telemetryTimeline = [
  { step: "Signal heuristics", detail: "Pattern library cross-check complete", latency: "12ms" },
  { step: "LLM verdict", detail: "Confidence aggregation finalised", latency: "31ms" },
  {
    step: "Guardrail sync",
    detail: "Redaction policies and escalation SLA matched",
    latency: "45ms",
  },
];

const coverageHighlights = [
  "Social engineering playbooks (lottery, job, romance)",
  "Financial fraud triggers (UPI, wire transfer, account reset)",
  "Multilingual phishing classification across 37 locales",
  "Suspicious contact extraction with real-time redaction",
];

const analysisHistory = [
  {
    id: "hist-01",
    persona: "fake-job",
    risk: "Medium",
    score: 58,
    summary: "Processing fee requested via third-party payment rail.",
    timestamp: "06:43 PM IST",
  },
  {
    id: "hist-02",
    persona: "lottery",
    risk: "High",
    score: 72,
    summary: "Prize claim urgency detected with unverifiable contact number.",
    timestamp: "05:58 PM IST",
  },
  {
    id: "hist-03",
    persona: "otp",
    risk: "Critical",
    score: 91,
    summary: "OTP exfiltration attempt flagged against banking policy.",
    timestamp: "04:15 PM IST",
  },
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

const safeguardPillars = [
  {
    title: "Explainable AI",
    description: "Every inference ships with transparent signal attribution and audit exports.",
  },
  {
    title: "Human-in-loop",
    description: "Tier-1 analysts staffed 24/7 with SLA-backed callbacks for severe cases.",
  },
  {
    title: "Data residency",
    description: "Regional clusters in US, EU and APAC to align with sovereign controls.",
  },
];

const APIToolPage = () => {
  const [activePersona, setActivePersona] = useState(personaOrder[0]);
  const [activeMode, setActiveMode] = useState(analysisModes[0].value);
  const [message, setMessage] = useState(personaCatalog[personaOrder[0]].preset);
  const [statusMessage, setStatusMessage] = useState("");

  const persona = personaCatalog[activePersona];
  const characterCount = Math.min(message.length, CHARACTER_LIMIT);

  const activeModeMeta = useMemo(
    () => analysisModes.find((mode) => mode.value === activeMode) ?? analysisModes[0],
    [activeMode],
  );

  const progressStyle = useMemo(() => {
    const degrees = Math.floor(TRAINING_PROGRESS * 360);
    return {
      background: `conic-gradient(#6366f1 ${degrees}deg, rgba(99,102,241,0.15) ${degrees}deg 360deg)`,
      boxShadow: "0 24px 60px rgba(99,102,241,0.28)",
    };
  }, []);

  const handlePersonaChange = (value) => {
    setActivePersona(value);
    setMessage(personaCatalog[value].preset);
    setStatusMessage("");
  };

  const handleAnalyze = () => {
    setStatusMessage(
      `${activeModeMeta.label} preview is gated while training completes. Simulated verdict: ${persona.riskLevel} at ${persona.confidence}% confidence.`,
    );
  };

  const handleReset = () => {
    setMessage(persona.preset);
    setStatusMessage("");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-95">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(165,180,252,0.14),transparent_42%)]" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12">
        <header className="grid gap-6 lg:grid-cols-[2fr,1.1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,106,255,0.35),_rgba(15,23,42,0.95))] p-10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
            <div className="absolute inset-0 mix-blend-soft-light opacity-40">
              <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-sky-500/40 blur-3xl" />
              <div className="absolute bottom-10 left-8 h-28 w-28 rounded-full bg-indigo-500/30 blur-2xl" />
            </div>

            <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/90">
              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Dual model</span>
              <span className="rounded-full bg-emerald-500/25 px-4 py-2 text-emerald-200">Realtime</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Preview</span>
            </div>

            <h1 className="relative mt-6 text-4xl font-semibold sm:text-5xl">
              Dual Model Threat Detector
            </h1>
            <p className="relative mt-4 max-w-xl text-sm text-slate-200/85">
              Enterprise-grade orchestration that classifies suspicious messages, extracts risky contact points, and recommends next steps within milliseconds.
            </p>

            <dl className="relative mt-8 grid gap-4 sm:grid-cols-3">
              {modelMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 text-slate-100/90"
                >
                  <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-indigo-200/70">
                    {metric.label}
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-white">{metric.value}</dd>
                  <p className="mt-2 text-[0.75rem] text-slate-300/80">{metric.detail}</p>
                </div>
              ))}
            </dl>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_32px_90px_rgba(12,19,34,0.55)] backdrop-blur-2xl">
              <div className="flex items-center justify-between text-sm text-slate-200/85">
                <span className="font-medium">Model status</span>
                <span className="inline-flex items-center gap-2 text-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-300" /> Training
                </span>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <div className="absolute inset-2 rounded-full" style={progressStyle} />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-950/85 text-center">
                    <span className="text-xl font-semibold text-indigo-100">{Math.round(TRAINING_PROGRESS * 100)}%</span>
                  </div>
                </div>
                <div className="text-sm text-slate-200/80">
                  <p>
                    Last updated Nov 04, 06:39 PM IST. Inferences run through ISO 27001 and SOC2 compliant pipelines with immutable logging.
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100/80">
                    <span className="h-2 w-2 rounded-full bg-indigo-300" /> Guardrails: operational playbacks coming soon
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs text-slate-200/80">
                <div>
                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Guardrails</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guardrailTags.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {complianceBadges.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Assurances</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assurancePoints.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 backdrop-blur-2xl">
              <p className="font-medium text-indigo-100">Why this matters</p>
              <p className="mt-2 text-slate-200/70">
                Dual engines corroborate curated fraud playbooks with language intelligence, enabling faster analyst decisions and auditable outcomes.
              </p>
            </div>
          </aside>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.9fr,1.1fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-100 shadow-[0_32px_96px_rgba(12,19,34,0.55)] backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">Realtime threat analyzer</p>
                  <h2 className="mt-2 text-2xl font-semibold">Evaluate suspicious communications instantly</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisModes.map((mode) => {
                    const active = mode.value === activeMode;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setActiveMode(mode.value)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                          active
                            ? "border border-indigo-400 bg-indigo-600 text-white shadow-[0_12px_32px_rgba(79,70,229,0.35)]"
                            : "border border-white/15 bg-white/10 text-indigo-100 hover:border-white/35"
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-indigo-200/70">
                Mode detail: {activeModeMeta.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {personaOrder.map((key) => {
                  const option = personaCatalog[key];
                  const active = key === activePersona;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePersonaChange(key)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
                        active
                          ? "border border-indigo-300/70 bg-indigo-500/25 text-indigo-100"
                          : "border border-white/15 bg-white/10 text-slate-200 hover:border-white/35"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <textarea
                  className="h-44 w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  value={message}
                  onChange={(event) => setMessage(event.target.value.slice(0, CHARACTER_LIMIT))}
                  placeholder="Paste any message, email, or script you want our models to evaluate..."
                />

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    {sessionFlags.map((item) => (
                      <span key={item.label} className="inline-flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">
                    {characterCount}/{CHARACTER_LIMIT} characters
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {assurancePoints.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-300/90"
                    >
                      {item}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">
                    <span className="h-2 w-2 rounded-full bg-fuchsia-300" /> Ctrl + Enter (launch ready)
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(244,114,182,0.35)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    <span className="absolute inset-0 translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />
                    <span className="relative">Run analysis</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-12 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    Reset
                  </button>
                </div>

                {statusMessage && (
                  <p className="mt-4 rounded-2xl border border-indigo-300/30 bg-indigo-500/15 px-4 py-3 text-xs text-indigo-100">
                    {statusMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_30px_90px_rgba(12,19,34,0.5)] backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80">
                    {persona.riskLevel}
                  </span>
                  <p className="mt-4 text-sm text-slate-200/90">
                    Confidence {persona.confidence}% • Persona: {persona.label}
                  </p>
                  <p className="mt-3 text-base text-white/90">{persona.summary}</p>
                </div>
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/35 via-fuchsia-500/25 to-rose-500/30 shadow-inner">
                  <div className="absolute inset-3 rounded-full bg-white/10 blur-md" />
                  <span className="relative text-3xl font-semibold text-white">{persona.confidence}%</span>
                  <span className="absolute bottom-7 text-[0.65rem] uppercase tracking-[0.35em] text-white/60">Conf.</span>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Signals observed</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">
                    {persona.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />
                        <p>{signal}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Extracted entities</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">
                    {persona.entities.map((entity) => (
                      <li key={entity}>{entity}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Recommended actions</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-100/85">
                  {persona.actions.map((action) => (
                    <li key={action} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-rose-300" />
                      <p>{action}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {telemetryTimeline.map((event) => (
                  <div key={event.step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{event.step}</p>
                    <p className="mt-2 text-slate-100/85">{event.detail}</p>
                    <p className="mt-3 text-xs text-slate-300/80">{event.latency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
              <h3 className="text-xl font-semibold text-slate-900">Detection coverage</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {coverageHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
              <h3 className="text-xl font-semibold text-slate-900">Recent analyses</h3>
              <div className="mt-4 space-y-4 text-sm">
                {analysisHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-indigo-600">
                        {entry.risk} • {personaCatalog[entry.persona].label}
                      </span>
                      <span>{entry.timestamp}</span>
                    </div>
                    <p className="mt-3 text-slate-700">{entry.summary}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                      Risk score {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
              <h3 className="text-xl font-semibold text-slate-900">Developer preview</h3>
              <p className="mt-2 text-sm text-slate-500">
                Prep your integration. REST endpoints unlock during pilot — schema subject to refinement.
              </p>
              <div className="mt-4 space-y-4 text-xs font-mono text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample request</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.request}</pre>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample response</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.response}</pre>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
              >
                Subscribe for SDK preview
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_28px_80px_rgba(12,19,34,0.45)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Launch roadmap</p>
                <h3 className="mt-2 text-2xl font-semibold">Transparency first</h3>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Request early access
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {launchRoadmap.map((item) => (
                <div key={item.phase} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{item.phase}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.status}</p>
                  <p className="mt-3 text-sm text-slate-200/80">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/85">
              <p>Need analysts on day one? Toggle the human-in-the-loop escalation from Settings once the pilot begins.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
            <h3 className="text-xl font-semibold text-slate-900">Enterprise safeguards</h3>
            <div className="mt-4 space-y-4 text-sm">
              {safeguardPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{pillar.title}</p>
                  <p className="mt-2 text-slate-600">{pillar.description}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              View trust center
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_25px_70px_rgba(12,19,34,0.45)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Transparency first</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">What happens next</h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/85">
                Live red-team drills and multilingual corpus expansion continue. Once accuracy thresholds are met, we will open early access with audit-ready reporting.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Join the waitlist
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default APIToolPage;import React, { useMemo, useState } from "react";import React, { useMemo, useState } from "react";



const TRAINING_PROGRESS = 0.15;const TRAINING_PROGRESS = 0.15;

const CHARACTER_LIMIT = 2000;const CHARACTER_LIMIT = 2000;



const modelMetrics = [const modelMetrics = [

  { label: "Model confidence", value: "98.4%", caption: "Last 10k scans" },  { label: "Model confidence", value: "98.4%", caption: "Last 10k scans" },

  { label: "Response time", value: "720ms", caption: "P95, global edge" },  { label: "Response time", value: "720ms", caption: "P95, global edge" },

  { label: "Coverage", value: "37 languages", caption: "Expanding weekly" },  { label: "Coverage", value: "37 languages", caption: "Expanding weekly" },

];];



const guardrailTags = ["PII redaction", "Prompt firewall", "SOC2 audit trail"];const guardrailTags = ["PII redaction", "Prompt firewall", "SOC2 audit trail"];

const complianceTags = ["SOC2 Type II", "ISO 27001", "GDPR"];const complianceTags = ["SOC2 Type II", "ISO 27001", "GDPR"];

const escalationTag = "Analyst review < 4h";const escalationTag = "Analyst review < 4h";

const statusSummary =const statusSummary =

  "Last updated Nov 04, 06:39 PM IST. All inferences run through ISO 27001 and SOC2 compliant pipelines with immutable logging.";  "Last updated Nov 04, 06:39 PM IST. All inferences run through ISO 27001 and SOC2 compliant pipelines with immutable logging.";



const coverageHighlights = [const coverageHighlights = [

  "Social engineering playbooks (lottery, job, romance schemes)",  "Social engineering playbooks (lottery, job, romance schemes)",

  "Financial fraud triggers (UPI, wire transfer, account reset)",  "Financial fraud triggers (UPI, wire transfer, account reset)",

  "Malicious contact extraction with real-time redaction",  "Malicious contact extraction with real-time redaction",

  "Multilingual phishing classification across 37 locales",  "Multilingual phishing classification across 37 locales",

];];



const assurancePoints = [const assurancePoints = [

  "Zero data retention",  "Zero data retention",

  "PII automatically redacted",  "PII automatically redacted",

  "SOC2 controls enforced",  "SOC2 controls enforced",

];];



const sessionStatuses = [const sessionStatuses = [

  { label: "Protected inference session", color: "bg-emerald-400" },  { label: "Protected inference session", color: "bg-emerald-400" },

  { label: "Analyst escalation available", color: "bg-indigo-400" },  { label: "Analyst escalation available", color: "bg-indigo-400" },

];];



const personas = [const personas = [

  { value: "lottery", label: "Lottery Scam" },  { value: "lottery", label: "Lottery Scam" },

  { value: "fake-job", label: "Fake Job Offer" },  { value: "fake-job", label: "Fake Job Offer" },

  { value: "romance", label: "Romance Scam" },  { value: "romance", label: "Romance Scam" },

  { value: "otp", label: "OTP Fraud" },  { value: "otp", label: "OTP Fraud" },

  { value: "bank", label: "Bank Alert" },  { value: "bank", label: "Bank Alert" },

];];



const analysisModes = [const analysisModes = [

  { value: "dual", label: "Dual Engine", description: "LLM + rule ensemble" },  { value: "dual", label: "Dual Engine", description: "LLM + rule ensemble" },

  { value: "nlp", label: "NLP Signature", description: "Pattern heuristics" },  { value: "nlp", label: "NLP Signature", description: "Pattern heuristics" },

  { value: "vision", label: "Vision Co-Pilot", description: "Optical extraction" },  { value: "vision", label: "Vision Co-Pilot", description: "Optical extraction" },

];];



const exampleMessages = {const exampleMessages = {

  lottery:  lottery:

    "Congratulations! You've won ₹5,00,000. Call +91 98765 43210 within 10 minutes to claim or the winnings expire.",    "Congratulations! You've won ₹5,00,000. Call +91 98765 43210 within 10 minutes to claim or the winnings expire.",

  "fake-job":  "fake-job":

    "Dear Candidate, you have been shortlisted for a premium role. Pay the processing fee of ₹6,999 via secure link to confirm onboarding.",    "Dear Candidate, you have been shortlisted for a premium role. Pay the processing fee of ₹6,999 via secure link to confirm onboarding.",

  romance:  romance:

    "I feel so close to you already. Can you help me with an urgent transfer to my family? I'll pay you back tomorrow.",    "I feel so close to you already. Can you help me with an urgent transfer to my family? I'll pay you back tomorrow.",

  otp: "Your bank account will be blocked. Share the OTP now to keep it active. This is from HQ security desk.",  otp: "Your bank account will be blocked. Share the OTP now to keep it active. This is from HQ security desk.",

  bank: "Update KYC to avoid account suspension. Click secure-upi.co.in and enter card PIN + CVV for verification.",  bank: "Update KYC to avoid account suspension. Click secure-upi.co.in and enter card PIN + CVV for verification.",

};};



const personaInsights = {const personaInsights = {

  lottery: {  lottery: {

    risk: "High Risk",    risk: "High Risk",

    confidence: 88,    confidence: 88,

    summary:    summary:

      "Language mirrors high-value lottery scam patterns. Urgency signal plus unverifiable prize instructions detected.",      "Language mirrors high-value lottery scam patterns. Urgency signal plus unverifiable prize instructions detected.",

    signals: ["Unverifiable prize notification", "10 minute call-to-action"],    signals: ["Unverifiable prize notification", "10 minute call-to-action"],

    entities: ["₹5,00,000", "+91 98765 43210"],    entities: ["₹5,00,000", "+91 98765 43210"],

    actions: [    actions: [

      "Ignore the sender and block the number across devices.",      "Ignore the sender and block the number across devices.",

      "Report the incident via CyberSafe portal for audit trails.",      "Report the incident via CyberSafe portal for audit trails.",

      "Educate the recipient on common lottery scam playbooks.",      "Educate the recipient on common lottery scam playbooks.",

    ],    ],

  },  },

  "fake-job": {  "fake-job": {

    risk: "Medium Risk",    risk: "Medium Risk",

    confidence: 74,    confidence: 74,

    summary:    summary:

      "Advance-fee recruitment scheme detected. Payment request prior to onboarding breaches policy guardrails.",      "Advance-fee recruitment scheme detected. Payment request prior to onboarding breaches policy guardrails.",

    signals: ["Processing fee request", "External payment link"],    signals: ["Processing fee request", "External payment link"],

    entities: ["₹6,999", "premium role"],    entities: ["₹6,999", "premium role"],

    actions: [    actions: [

      "Escalate to corporate hiring for legitimacy verification.",      "Escalate to corporate hiring for legitimacy verification.",

      "Do not process payments to unverified endpoints.",      "Do not process payments to unverified endpoints.",

      "Share fraud education kit with reported candidate.",      "Share fraud education kit with reported candidate.",

    ],    ],

  },  },

  romance: {  romance: {

    risk: "Elevated Risk",    risk: "Elevated Risk",

    confidence: 82,    confidence: 82,

    summary:    summary:

      "Emotionally leveraged monetary solicitation flagged. Matches curated romance scam signatures.",      "Emotionally leveraged monetary solicitation flagged. Matches curated romance scam signatures.",

    signals: ["Urgent financial request", "Promise of repayment"],    signals: ["Urgent financial request", "Promise of repayment"],

    entities: ["Family emergency"],    entities: ["Family emergency"],

    actions: [    actions: [

      "Pause engagement until identity proof is validated.",      "Pause engagement until identity proof is validated.",

      "Archive chat logs for investigative retention.",      "Archive chat logs for investigative retention.",

      "Notify the financial wellness desk if funds moved.",      "Notify the financial wellness desk if funds moved.",

    ],    ],

  },  },

  otp: {  otp: {

    risk: "Critical Risk",    risk: "Critical Risk",

    confidence: 93,    confidence: 93,

    summary:    summary:

      "OTP harvesting attempt using account suspension scare tactic. Hard block recommended.",      "OTP harvesting attempt using account suspension scare tactic. Hard block recommended.",

    signals: ["Credential harvesting", "Account suspension bait"],    signals: ["Credential harvesting", "Account suspension bait"],

    entities: ["OTP", "Suspension notice"],    entities: ["OTP", "Suspension notice"],

    actions: [    actions: [

      "Do not share credentials over unsecured channels.",      "Do not share credentials over unsecured channels.",

      "Alert the bank's fraud desk and rotate factors.",      "Alert the bank's fraud desk and rotate factors.",

      "Add the sender to institution-wide blocklists.",      "Add the sender to institution-wide blocklists.",

    ],    ],

  },  },

  bank: {  bank: {

    risk: "High Risk",    risk: "High Risk",

    confidence: 85,    confidence: 85,

    summary:    summary:

      "Phishing payload targeting KYC workflow. Fraudulent domain and CVV capture intent detected.",      "Phishing payload targeting KYC workflow. Fraudulent domain and CVV capture intent detected.",

    signals: ["Suspicious domain", "Sensitive credential request"],    signals: ["Suspicious domain", "Sensitive credential request"],

    entities: ["secure-upi.co.in", "CVV"],    entities: ["secure-upi.co.in", "CVV"],

    actions: [    actions: [

      "Submit takedown with threat intel partners.",      "Submit takedown with threat intel partners.",

      "Circulate advisory to impacted customer cohorts.",      "Circulate advisory to impacted customer cohorts.",

      "Feed indicators into SIEM for ongoing monitoring.",      "Feed indicators into SIEM for ongoing monitoring.",

    ],    ],

  },  },

};};



const telemetryTimeline = [const telemetryTimeline = [

  {  {

    title: "Signal heuristics",    title: "Signal heuristics",

    detail: "Pattern library cross-check complete",    detail: "Pattern library cross-check complete",

    latency: "12ms",    latency: "12ms",

  },  },

  {  {

    title: "LLM verdict",    title: "LLM verdict",

    detail: "Risk confidence aggregated",    detail: "Risk confidence aggregated",

    latency: "31ms",    latency: "31ms",

  },  },

  {  {

    title: "Guardrail sync",    title: "Guardrail sync",

    detail: "Redaction policy + escalation SLA matched",    detail: "Redaction policy + escalation SLA matched",

    latency: "45ms",    latency: "45ms",

  },  },

];];



const analysisHistory = [const analysisHistory = [

  {  {

    id: "hist-01",    id: "hist-01",

    persona: "fake-job",    persona: "fake-job",

    risk: "Medium",    risk: "Medium",

    score: 58,    score: 58,

    summary: "Processing fee requested via third-party payment rail.",    summary: "Processing fee requested via third-party payment rail.",

    timestamp: "06:43 PM",    timestamp: "06:43 PM",

  },  },

  {  {

    id: "hist-02",    id: "hist-02",

    persona: "lottery",    persona: "lottery",

    risk: "High",    risk: "High",

    score: 72,    score: 72,

    summary: "Prize claim urgency detected with unverifiable contact number.",    summary: "Prize claim urgency detected with unverifiable contact number.",

    timestamp: "05:58 PM",    timestamp: "05:58 PM",

  },  },

  {  {

    id: "hist-03",    id: "hist-03",

    persona: "otp",    persona: "otp",

    risk: "Critical",    risk: "Critical",

    score: 91,    score: 91,

    summary: "OTP exfil pattern flagged against bank security policy.",    summary: "OTP exfil pattern flagged against bank security policy.",

    timestamp: "04:15 PM",    timestamp: "04:15 PM",

  },  },

];];



const developerPreview = {const developerPreview = {

  request: `POST https://api.cybersafe.ai/v1/detector/analyze  request: `POST https://api.cybersafe.ai/v1/detector/analyze

Authorization: Bearer <token>Authorization: Bearer <token>

Content-Type: application/jsonContent-Type: application/json



{{

  "profile": "enterprise_dual",  "profile": "enterprise_dual",

  "persona": "lottery",  "persona": "lottery",

  "payload": "<message_or_email_body>",  "payload": "<message_or_email_body>",

  "metadata": {  "metadata": {

    "locale": "en-IN",    "locale": "en-IN",

    "channel": "email"    "channel": "email"

  }  }

}`,}`,

  response: `200 OK  response: `200 OK

{{

  "risk": "high",  "risk": "high",

  "score": 0.82,  "score": 0.82,

  "signals": ["upfront_fee", "urgency_trigger"],  "signals": ["upfront_fee", "urgency_trigger"],

  "recommended_actions": [  "recommended_actions": [

    "block_sender",    "block_sender",

    "escalate_to_tier1"    "escalate_to_tier1"

  ],  ],

  "extracted_entities": [  "extracted_entities": [

    { "type": "phone", "value": "+91 98765 43210" }    { "type": "phone", "value": "+91 98765 43210" }

  ]  ]

}`,}`,

};};



const launchMilestones = [const launchMilestones = [

  {  {

    phase: "Pilot onboarding",    phase: "Pilot onboarding",

    status: "Live",    status: "Live",

    description: "Customer cohorts seeded with red-team datasets for baseline calibration.",    description: "Customer cohorts seeded with red-team datasets for baseline calibration.",

  },  },

  {  {

    phase: "Realtime inference",    phase: "Realtime inference",

    status: "QA",    status: "QA",

    description: "Latency hardening underway across Mumbai, Frankfurt, and Oregon edges.",    description: "Latency hardening underway across Mumbai, Frankfurt, and Oregon edges.",

  },  },

  {  {

    phase: "Governance suite",    phase: "Governance suite",

    status: "In design",    status: "In design",

    description: "SOC workflows, PDF exports, and SIEM connectors finalizing with partners.",    description: "SOC workflows, PDF exports, and SIEM connectors finalizing with partners.",

  },  },

];];



const safeguardPillars = [const safeguardPillars = [

  {  {

    title: "Explainable AI",    title: "Explainable AI",

    description: "Transparent signal audit for every inference with exportable evidence trail.",    description: "Transparent signal audit for every inference with exportable evidence trail.",

  },  },

  {  {

    title: "Analyst escalation",    title: "Analyst escalation",

    description: "Tier-1 analysts staffed 24/7 with SLA-backed callbacks for severe incidents.",    description: "Tier-1 analysts staffed 24/7 with SLA-backed callbacks for severe incidents.",

  },  },

  {  {

    title: "Data residency",    title: "Data residency",

    description: "Regional inference clusters in US, EU, and APAC to respect sovereign controls.",    description: "Regional inference clusters in US, EU, and APAC to respect sovereign controls.",

  },  },

];];



const APIToolPage = () => {const APIToolPage = () => {

  const [activePersona, setActivePersona] = useState(personas[0].value);  const [activePersona, setActivePersona] = useState(personas[0].value);

  const [activeMode, setActiveMode] = useState(analysisModes[0].value);  const [activeMode, setActiveMode] = useState(analysisModes[0].value);

  const [inputValue, setInputValue] = useState(exampleMessages[personas[0].value]);  const [inputValue, setInputValue] = useState(exampleMessages[personas[0].value]);

  const [infoMessage, setInfoMessage] = useState("");  const [infoMessage, setInfoMessage] = useState("");



  const insight = personaInsights[activePersona];  const insight = personaInsights[activePersona];

  const characterCount = Math.min(inputValue.length, CHARACTER_LIMIT);  const characterCount = Math.min(inputValue.length, CHARACTER_LIMIT);



  const activeModeMeta = useMemo(  const activeModeMeta = useMemo(

    () => analysisModes.find((mode) => mode.value === activeMode) ?? analysisModes[0],    () => analysisModes.find((mode) => mode.value === activeMode) ?? analysisModes[0],

    [activeMode],    [activeMode],

  );  );



  const progressStyle = useMemo(() => {  const progressStyle = useMemo(() => {

    const degrees = Math.floor(TRAINING_PROGRESS * 360);    const degrees = Math.floor(TRAINING_PROGRESS * 360);

    return {    return {

      background: `conic-gradient(#6366f1 ${degrees}deg, rgba(99,102,241,0.18) ${degrees}deg 360deg)`,      background: `conic-gradient(#6366f1 ${degrees}deg, rgba(99,102,241,0.18) ${degrees}deg 360deg)`,

      boxShadow: "0 24px 60px rgba(99,102,241,0.32)",      boxShadow: "0 24px 60px rgba(99,102,241,0.32)",

    };    };

  }, []);  }, []);



  const handlePersonaChange = (value) => {  const handlePersonaChange = (value) => {

    setActivePersona(value);    setActivePersona(value);

    setInputValue(exampleMessages[value]);    setInputValue(exampleMessages[value]);

    setInfoMessage("");    setInfoMessage("");

  };  };



  const handleAnalyze = () => {  const handleAnalyze = () => {

    setInfoMessage(    setInfoMessage(

      `${activeModeMeta.label} preview locked while models finish training. Latest simulated verdict: ${insight.risk} at ${insight.confidence}% confidence.`,      `${activeModeMeta.label} preview locked while models finish training. Latest simulated verdict: ${insight.risk} at ${insight.confidence}% confidence.`,

    );    );

  };  };



  const handleReset = () => {  const handleReset = () => {

    setInputValue(exampleMessages[activePersona]);    setInputValue(exampleMessages[activePersona]);

    setInfoMessage("");    setInfoMessage("");

  };  };



  return (  return (

    <div className="relative min-h-screen bg-slate-950 px-4 py-16 sm:px-6 lg:px-12">    <div className="relative min-h-screen bg-slate-950 px-4 py-16 sm:px-6 lg:px-12">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_55%)]" />      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_55%)]" />

      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-95">      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-95">

        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="absolute -bottom-32 right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />        <div className="absolute -bottom-32 right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(165,180,252,0.14),transparent_42%)]" />        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(165,180,252,0.14),transparent_42%)]" />

      </div>      </div>



      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12">      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12">

        <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">        <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,106,255,0.35),_rgba(15,23,42,0.95))] p-10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl">          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,106,255,0.35),_rgba(15,23,42,0.95))] p-10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl">

            <div className="absolute inset-0 mix-blend-soft-light opacity-40">            <div className="absolute inset-0 mix-blend-soft-light opacity-40">

              <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-sky-500/40 blur-3xl" />              <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-sky-500/40 blur-3xl" />

              <div className="absolute bottom-10 left-8 h-28 w-28 rounded-full bg-indigo-500/30 blur-2xl" />              <div className="absolute bottom-10 left-8 h-28 w-28 rounded-full bg-indigo-500/30 blur-2xl" />

            </div>            </div>



            <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/90">            <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/90">

              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Dual model</span>              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">Dual model</span>

              <span className="rounded-full bg-emerald-500/25 px-4 py-2 text-emerald-200">Realtime</span>              <span className="rounded-full bg-emerald-500/25 px-4 py-2 text-emerald-200">Realtime</span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">v1.3</span>              <span className="rounded-full bg-white/10 px-4 py-2 text-indigo-100">v1.3</span>

            </div>            </div>



            <h1 className="relative mt-6 text-4xl font-semibold text-white sm:text-5xl">            <h1 className="relative mt-6 text-4xl font-semibold text-white sm:text-5xl">

              Dual Model Threat Detector              Dual Model Threat Detector

            </h1>            </h1>

            <p className="relative mt-4 max-w-xl text-sm text-slate-200/85">            <p className="relative mt-4 max-w-xl text-sm text-slate-200/85">

              Enterprise-grade orchestration that classifies suspicious messages, extracts risky contact points, and recommends next steps within milliseconds.              Enterprise-grade orchestration that classifies suspicious messages, extracts risky contact points, and recommends next steps within milliseconds.

            </p>            </p>



            <div className="relative mt-8 grid gap-4 sm:grid-cols-3">            <div className="relative mt-8 grid gap-4 sm:grid-cols-3">

              {modelMetrics.map((metric) => (              {modelMetrics.map((metric) => (

                <div                <div

                  key={metric.label}                  key={metric.label}

                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 text-slate-100/90"                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 text-slate-100/90"

                >                >

                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-indigo-200/70">                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-indigo-200/70">

                    {metric.label}                    {metric.label}

                  </p>                  </p>

                  <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>                  <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>

                  {metric.caption && (                  {metric.caption && (

                    <p className="mt-2 text-[0.75rem] text-slate-300/80">{metric.caption}</p>                    <p className="mt-2 text-[0.75rem] text-slate-300/80">{metric.caption}</p>

                  )}                  )}

                </div>                </div>

              ))}              ))}

            </div>            </div>

          </div>          </div>



          <div className="flex flex-col gap-6">          <div className="flex flex-col gap-6">

            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_32px_90px_rgba(12,19,34,0.55)] backdrop-blur-2xl">            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_32px_90px_rgba(12,19,34,0.55)] backdrop-blur-2xl">

              <div className="flex items-center justify-between text-sm text-slate-200/85">              <div className="flex items-center justify-between text-sm text-slate-200/85">

                <span className="font-medium">Model status</span>                <span className="font-medium">Model status</span>

                <span className="inline-flex items-center gap-2 text-amber-200">                <span className="inline-flex items-center gap-2 text-amber-200">

                  <span className="h-2 w-2 rounded-full bg-amber-300" /> Training                  <span className="h-2 w-2 rounded-full bg-amber-300" /> Training

                </span>                </span>

              </div>              </div>



              <div className="mt-6 flex items-center gap-6">              <div className="mt-6 flex items-center gap-6">

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10">                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10">

                  <div className="absolute inset-2 rounded-full" style={progressStyle} />                  <div className="absolute inset-2 rounded-full" style={progressStyle} />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-950/85 text-center">                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-950/85 text-center">

                    <span className="text-xl font-semibold text-indigo-100">{Math.round(TRAINING_PROGRESS * 100)}%</span>                    <span className="text-xl font-semibold text-indigo-100">{Math.round(TRAINING_PROGRESS * 100)}%</span>

                  </div>                  </div>

                </div>                </div>

                <div className="text-sm text-slate-200/80">                <div className="text-sm text-slate-200/80">

                  <p>{statusSummary}</p>                  <p>{statusSummary}</p>

                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100/80">                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100/80">

                    <span className="h-2 w-2 rounded-full bg-indigo-300" /> Guardrails: operational playbacks coming soon                    <span className="h-2 w-2 rounded-full bg-indigo-300" /> Guardrails: operational playbacks coming soon

                  </p>                  </p>

                </div>                </div>

              </div>              </div>



              <div className="mt-6 space-y-4 text-xs text-slate-200/80">              <div className="mt-6 space-y-4 text-xs text-slate-200/80">

                <div>                <div>

                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Guardrails</p>                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Guardrails</p>

                  <div className="mt-2 flex flex-wrap gap-2">                  <div className="mt-2 flex flex-wrap gap-2">

                    {guardrailTags.map((chip) => (                    {guardrailTags.map((chip) => (

                      <span                      <span

                        key={chip}                        key={chip}

                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"

                      >                      >

                        {chip}                        {chip}

                      </span>                      </span>

                    ))}                    ))}

                  </div>                  </div>

                </div>                </div>

                <div>                <div>

                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Certifications</p>                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Certifications</p>

                  <div className="mt-2 flex flex-wrap gap-2">                  <div className="mt-2 flex flex-wrap gap-2">

                    {complianceTags.map((chip) => (                    {complianceTags.map((chip) => (

                      <span                      <span

                        key={chip}                        key={chip}

                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"                        className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80"

                      >                      >

                        {chip}                        {chip}

                      </span>                      </span>

                    ))}                    ))}

                  </div>                  </div>

                </div>                </div>

                <div>                <div>

                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Escalation SLA</p>                  <p className="uppercase tracking-[0.3em] text-indigo-200/70">Escalation SLA</p>

                  <span className="mt-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80">                  <span className="mt-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-100/80">

                    {escalationTag}                    {escalationTag}

                  </span>                  </span>

                </div>                </div>

              </div>              </div>

            </div>            </div>



            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 backdrop-blur-2xl">            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 backdrop-blur-2xl">

              <p className="font-medium text-indigo-100">Why this matters</p>              <p className="font-medium text-indigo-100">Why this matters</p>

              <p className="mt-2 text-slate-200/70">              <p className="mt-2 text-slate-200/70">

                Dual engines corroborate NLP signatures with curated fraud playbooks. Expect deeper attribution, executive-friendly summaries, and API hooks for your SOC workflows.                Dual engines corroborate NLP signatures with curated fraud playbooks. Expect deeper attribution, executive-friendly summaries, and API hooks for your SOC workflows.

              </p>              </p>

            </div>            </div>

          </div>          </div>

        </section>        </section>



        <section className="grid gap-6 xl:grid-cols-[1.9fr,1.1fr]">        <section className="grid gap-6 xl:grid-cols-[1.9fr,1.1fr]">

          <div className="flex flex-col gap-6">          <div className="flex flex-col gap-6">

            <div className="rounded-3xl border border-slate-200/20 bg-white/10 p-8 text-slate-100 shadow-[0_32px_90px_rgba(12,19,34,0.45)] backdrop-blur-2xl">            <div className="rounded-3xl border border-slate-200/20 bg-white/10 p-8 text-slate-100 shadow-[0_32px_90px_rgba(12,19,34,0.45)] backdrop-blur-2xl">

              <div className="flex flex-wrap items-center justify-between gap-4">              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>                <div>

                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">Realtime threat analyzer</p>                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">Realtime threat analyzer</p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">Evaluate suspicious communications instantly</h2>                  <h2 className="mt-2 text-2xl font-semibold text-white">Evaluate suspicious communications instantly</h2>

                </div>                </div>

                <div className="flex flex-wrap gap-2">                <div className="flex flex-wrap gap-2">

                  {analysisModes.map((mode) => {                  {analysisModes.map((mode) => {

                    const active = mode.value === activeMode;                    const active = mode.value === activeMode;

                    return (                    return (

                      <button                      <button

                        key={mode.value}                        key={mode.value}

                        type="button"                        type="button"

                        onClick={() => setActiveMode(mode.value)}                        onClick={() => setActiveMode(mode.value)}

                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${

                          active                          active

                            ? "border border-indigo-400 bg-indigo-600 text-white shadow-[0_12px_32px_rgba(79,70,229,0.35)]"                            ? "border border-indigo-400 bg-indigo-600 text-white shadow-[0_12px_32px_rgba(79,70,229,0.35)]"

                            : "border border-white/15 bg-white/10 text-indigo-100 hover:border-white/35"                            : "border border-white/15 bg-white/10 text-indigo-100 hover:border-white/35"

                        }`}                        }`}

                      >                      >

                        {mode.label}                        {mode.label}

                      </button>                      </button>

                    );                    );

                  })}                  })}

                </div>                </div>

              </div>              </div>



              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-indigo-200/70">              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-indigo-200/70">

                Mode detail: {activeModeMeta.description}                Mode detail: {activeModeMeta.description}

              </p>              </p>



              <div className="mt-6 flex flex-wrap gap-2">              <div className="mt-6 flex flex-wrap gap-2">

                {personas.map((persona) => {                {personas.map((persona) => {

                  const active = persona.value === activePersona;                  const active = persona.value === activePersona;

                  return (                  return (

                    <button                    <button

                      key={persona.value}                      key={persona.value}

                      type="button"                      type="button"

                      onClick={() => handlePersonaChange(persona.value)}                      onClick={() => handlePersonaChange(persona.value)}

                      className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${                      className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${

                        active                        active

                          ? "border border-indigo-300/70 bg-indigo-500/25 text-indigo-100"                          ? "border border-indigo-300/70 bg-indigo-500/25 text-indigo-100"

                          : "border border-white/15 bg-white/10 text-slate-200 hover:border-white/35"                          : "border border-white/15 bg-white/10 text-slate-200 hover:border-white/35"

                      }`}                      }`}

                    >                    >

                      {persona.label}                      {persona.label}

                    </button>                    </button>

                  );                  );

                })}                })}

              </div>              </div>



              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">

                <textarea                <textarea

                  className="h-40 w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"                  className="h-40 w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"

                  value={inputValue}                  value={inputValue}

                  onChange={(event) => setInputValue(event.target.value.slice(0, CHARACTER_LIMIT))}                  onChange={(event) => setInputValue(event.target.value.slice(0, CHARACTER_LIMIT))}

                  placeholder="Paste any message, email, or script you want our models to evaluate..."                  placeholder="Paste any message, email, or script you want our models to evaluate..."

                />                />



                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">

                  <div className="flex flex-wrap items-center gap-3">                  <div className="flex flex-wrap items-center gap-3">

                    {assurancePoints.map((item) => (                    {assurancePoints.map((item) => (

                      <span                      <span

                        key={item}                        key={item}

                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-300/90"                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-300/90"

                      >                      >

                        {item}                        {item}

                      </span>                      </span>

                    ))}                    ))}

                  </div>                  </div>

                  <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">                  <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">

                    {characterCount}/{CHARACTER_LIMIT} characters                    {characterCount}/{CHARACTER_LIMIT} characters

                  </span>                  </span>

                </div>                </div>



                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">

                  {sessionStatuses.map((item) => (                  {sessionStatuses.map((item) => (

                    <span key={item.label} className="inline-flex items-center gap-2">                    <span key={item.label} className="inline-flex items-center gap-2">

                      <span className={`h-2 w-2 rounded-full ${item.color}`} />                      <span className={`h-2 w-2 rounded-full ${item.color}`} />

                      {item.label}                      {item.label}

                    </span>                    </span>

                  ))}                  ))}

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-slate-200/80">

                    <span className="h-2 w-2 rounded-full bg-fuchsia-300" /> Ctrl + Enter (launch ready)                    <span className="h-2 w-2 rounded-full bg-fuchsia-300" /> Ctrl + Enter (launch ready)

                  </span>                  </span>

                </div>                </div>



                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">

                  <button                  <button

                    type="button"                    type="button"

                    onClick={handleAnalyze}                    onClick={handleAnalyze}

                    className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(244,114,182,0.35)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"                    className="group relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(244,114,182,0.35)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"

                  >                  >

                    <span className="absolute inset-0 translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />                    <span className="absolute inset-0 translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />

                    <span className="relative">Run analysis</span>                    <span className="relative">Run analysis</span>

                  </button>                  </button>

                  <button                  <button

                    type="button"                    type="button"

                    onClick={handleReset}                    onClick={handleReset}

                    className="h-12 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"                    className="h-12 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"

                  >                  >

                    Reset                    Reset

                  </button>                  </button>

                </div>                </div>



                {infoMessage && (                {infoMessage && (

                  <p className="mt-4 rounded-2xl border border-indigo-300/30 bg-indigo-500/15 px-4 py-3 text-xs text-indigo-100">                  <p className="mt-4 rounded-2xl border border-indigo-300/30 bg-indigo-500/15 px-4 py-3 text-xs text-indigo-100">

                    {infoMessage}                    {infoMessage}

                  </p>                  </p>

                )}                )}

              </div>              </div>

            </div>            </div>



            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_30px_90px_rgba(12,19,34,0.50)] backdrop-blur-2xl">            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_30px_90px_rgba(12,19,34,0.50)] backdrop-blur-2xl">

              <div className="flex flex-wrap items-center justify-between gap-4">              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>                <div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80">                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/80">

                    {insight.risk}                    {insight.risk}

                  </span>                  </span>

                  <p className="mt-4 text-sm text-slate-200/90">                  <p className="mt-4 text-sm text-slate-200/90">

                    Confidence {insight.confidence}% • Persona: {personas.find((item) => item.value === activePersona)?.label}                    Confidence {insight.confidence}%  Persona: {personas.find((item) => item.value === activePersona)?.label}

                  </p>                  </p>

                  <p className="mt-3 text-base text-white/90">{insight.summary}</p>                  <p className="mt-3 text-base text-white/90">{insight.summary}</p>

                </div>                </div>

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/35 via-fuchsia-500/25 to-rose-500/30 shadow-inner">                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/35 via-fuchsia-500/25 to-rose-500/30 shadow-inner">

                  <div className="absolute inset-3 rounded-full bg-white/10 blur-md" />                  <div className="absolute inset-3 rounded-full bg-white/10 blur-md" />

                  <span className="relative text-3xl font-semibold text-white">{insight.confidence}%</span>                  <span className="relative text-3xl font-semibold text-white">{insight.confidence}%</span>

                  <span className="absolute bottom-7 text-[0.65rem] uppercase tracking-[0.35em] text-white/60">Conf.</span>                  <span className="absolute bottom-7 text-[0.65rem] uppercase tracking-[0.35em] text-white/60">Conf.</span>

                </div>                </div>

              </div>              </div>



              <div className="mt-8 grid gap-6 md:grid-cols-2">              <div className="mt-8 grid gap-6 md:grid-cols-2">

                <div>                <div>

                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Signals observed</p>                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Signals observed</p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">

                    {insight.signals.map((item) => (                    {insight.signals.map((item) => (

                      <li key={item} className="flex items-start gap-3">                      <li key={item} className="flex items-start gap-3">

                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />

                        <p>{item}</p>                        <p>{item}</p>

                      </li>                      </li>

                    ))}                    ))}

                  </ul>                  </ul>

                </div>                </div>

                <div>                <div>

                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Extracted entities</p>                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Extracted entities</p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">                  <ul className="mt-3 space-y-2 text-sm text-slate-100/85">

                    {insight.entities.map((item) => (                    {insight.entities.map((item) => (

                      <li key={item}>{item}</li>                      <li key={item}>{item}</li>

                    ))}                    ))}

                  </ul>                  </ul>

                </div>                </div>

              </div>              </div>



              <div className="mt-8">              <div className="mt-8">

                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Recommended actions</p>                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Recommended actions</p>

                <ul className="mt-4 space-y-2 text-sm text-slate-100/85">                <ul className="mt-4 space-y-2 text-sm text-slate-100/85">

                  {insight.actions.map((action) => (                  {insight.actions.map((action) => (

                    <li key={action} className="flex items-start gap-3">                    <li key={action} className="flex items-start gap-3">

                      <span className="mt-1 h-2 w-2 rounded-full bg-rose-300" />                      <span className="mt-1 h-2 w-2 rounded-full bg-rose-300" />

                      <p>{action}</p>                      <p>{action}</p>

                    </li>                    </li>

                  ))}                  ))}

                </ul>                </ul>

              </div>              </div>



              <div className="mt-8 grid gap-4 md:grid-cols-3">              <div className="mt-8 grid gap-4 md:grid-cols-3">

                {telemetryTimeline.map((event) => (                {telemetryTimeline.map((event) => (

                  <div key={event.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">                  <div key={event.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">

                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{event.title}</p>                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{event.title}</p>

                    <p className="mt-2 text-slate-100/85">{event.detail}</p>                    <p className="mt-2 text-slate-100/85">{event.detail}</p>

                    <p className="mt-3 text-xs text-slate-300/80">{event.latency}</p>                    <p className="mt-3 text-xs text-slate-300/80">{event.latency}</p>

                  </div>                  </div>

                ))}                ))}

              </div>              </div>

            </div>            </div>

          </div>          </div>



          <div className="flex flex-col gap-6">          <div className="flex flex-col gap-6">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.10)]">            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.10)]">

              <h3 className="text-xl font-semibold text-slate-900">Detection coverage</h3>              <h3 className="text-xl font-semibold text-slate-900">Detection coverage</h3>

              <ul className="mt-4 space-y-3 text-sm text-slate-600">              <ul className="mt-4 space-y-3 text-sm text-slate-600">

                {coverageHighlights.map((item) => (                {coverageHighlights.map((item) => (

                  <li key={item} className="flex items-start gap-3">                  <li key={item} className="flex items-start gap-3">

                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />

                    <p>{item}</p>                    <p>{item}</p>

                  </li>                  </li>

                ))}                ))}

              </ul>              </ul>

            </div>            </div>



            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.10)]">            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.10)]">

              <h3 className="text-xl font-semibold text-slate-900">Recent analyses</h3>              <h3 className="text-xl font-semibold text-slate-900">Recent analyses</h3>

              <div className="mt-4 space-y-4 text-sm">              <div className="mt-4 space-y-4 text-sm">

                {analysisHistory.map((entry) => (                {analysisHistory.map((entry) => (

                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center justify-between text-xs text-slate-500">                    <div className="flex items-center justify-between text-xs text-slate-500">

                      <span className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-indigo-600">                      <span className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-indigo-600">

                        {entry.risk} • {personas.find((item) => item.value === entry.persona)?.label}                        {entry.risk}  {personas.find((item) => item.value === entry.persona)?.label}

                      </span>                      </span>

                      <span>{entry.timestamp}</span>                      <span>{entry.timestamp}</span>

                    </div>                    </div>

                    <p className="mt-3 text-slate-700">{entry.summary}</p>                    <p className="mt-3 text-slate-700">{entry.summary}</p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">

                      Risk score {entry.score}                      Risk score {entry.score}

                    </div>                    </div>

                  </div>                  </div>

                ))}                ))}

              </div>              </div>

            </div>            </div>



            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">

              <h3 className="text-xl font-semibold text-slate-900">Developer preview</h3>              <h3 className="text-xl font-semibold text-slate-900">Developer preview</h3>

              <p className="mt-2 text-sm text-slate-500">              <p className="mt-2 text-sm text-slate-500">

                Prep your integration. REST endpoints unlock during pilot — schema subject to refinement.                Prep your integration. REST endpoints unlock during pilot — schema subject to refinement.

              </p>              </p>

              <div className="mt-4 space-y-4 text-xs font-mono text-slate-700">              <div className="mt-4 space-y-4 text-xs font-mono text-slate-700">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample request</p>                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample request</p>

                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.request}</pre>                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.request}</pre>

                </div>                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample response</p>                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-indigo-500">Sample response</p>

                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.response}</pre>                  <pre className="mt-2 whitespace-pre-wrap text-sm">{developerPreview.response}</pre>

                </div>                </div>

              </div>              </div>

              <button              <button

                type="button"                type="button"

                className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"                className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"

              >              >

                Subscribe for SDK preview                Subscribe for SDK preview

              </button>              </button>

            </div>            </div>

          </div>          </div>

        </section>        </section>



        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">

          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_28px_80px_rgba(12,19,34,0.45)] backdrop-blur-2xl">          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_28px_80px_rgba(12,19,34,0.45)] backdrop-blur-2xl">

            <div className="flex flex-wrap items-center justify-between gap-4">            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>              <div>

                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Launch roadmap</p>                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Launch roadmap</p>

                <h3 className="mt-2 text-2xl font-semibold text-white">Transparency first</h3>                <h3 className="mt-2 text-2xl font-semibold text-white">Transparency first</h3>

              </div>              </div>

              <button              <button

                type="button"                type="button"

                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"

              >              >

                Request early access                Request early access

              </button>              </button>

            </div>            </div>



            <div className="mt-6 grid gap-4 md:grid-cols-3">            <div className="mt-6 grid gap-4 md:grid-cols-3">

              {launchMilestones.map((milestone) => (              {launchMilestones.map((milestone) => (

                <div key={milestone.phase} className="rounded-2xl border border-white/10 bg-white/5 p-5">                <div key={milestone.phase} className="rounded-2xl border border-white/10 bg-white/5 p-5">

                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{milestone.phase}</p>                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{milestone.phase}</p>

                  <p className="mt-2 text-sm font-semibold text-white">{milestone.status}</p>                  <p className="mt-2 text-sm font-semibold text-white">{milestone.status}</p>

                  <p className="mt-3 text-sm text-slate-200/80">{milestone.description}</p>                  <p className="mt-3 text-sm text-slate-200/80">{milestone.description}</p>

                </div>                </div>

              ))}              ))}

            </div>            </div>



            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/85">            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/85">

              <p>Need analysts on day one? Toggle the human-in-the-loop escalation from Settings once the pilot begins.</p>              <p>Need analysts on day one? Toggle the human-in-the-loop escalation from Settings once the pilot begins.</p>

            </div>            </div>

          </div>          </div>



          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">

            <h3 className="text-xl font-semibold text-slate-900">Enterprise safeguards</h3>            <h3 className="text-xl font-semibold text-slate-900">Enterprise safeguards</h3>

            <div className="mt-4 space-y-4 text-sm">            <div className="mt-4 space-y-4 text-sm">

              {safeguardPillars.map((item) => (              {safeguardPillars.map((item) => (

                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>

                  <p className="mt-2 text-slate-600">{item.description}</p>                  <p className="mt-2 text-slate-600">{item.description}</p>

                </div>                </div>

              ))}              ))}

            </div>            </div>

            <button            <button

              type="button"              type="button"

              className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover;border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"              className="mt-4 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"

            >            >

              View trust center              View trust center

            </button>            </button>

          </div>          </div>

        </section>        </section>



        <section className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_25px_70px_rgba(12,19,34,0.45)] backdrop-blur-2xl">        <section className="rounded-3xl border border-white/10 bg-white/10 p-8 text-slate-100 shadow-[0_25px_70px_rgba(12,19,34,0.45)] backdrop-blur-2xl">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>            <div>

              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Transparency first</p>              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Transparency first</p>

              <h3 className="mt-3 text-2xl font-semibold text-white">What happens next</h3>              <h3 className="mt-3 text-2xl font-semibold text-white">What happens next</h3>

              <p className="mt-2 max-w-2xl text-sm text-slate-200/85">              <p className="mt-2 max-w-2xl text-sm text-slate-200/85">

                We are running live red-team drills and multilingual corpus expansion. As soon as accuracy thresholds are hit, we will open early access to your team with audit-ready reporting.                We are running live red-team drills and multilingual corpus expansion. As soon as accuracy thresholds are hit, we will open early access to your team with audit-ready reporting.

              </p>              </p>

            </div>            </div>

            <button            <button

              type="button"              type="button"

              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"

            >            >

              Join the waitlist              Join the waitlist

            </button>            </button>

          </div>          </div>

        </section>        </section>

      </div>      </div>

    </div>    </div>

  );  );

};};



export default APIToolPage;export default APIToolPage;

