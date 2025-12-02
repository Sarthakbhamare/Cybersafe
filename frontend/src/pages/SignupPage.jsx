import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,13}$/;

const evaluatePasswordStrength = (value) => {
  if (!value) {
    return { score: 0, label: "", helper: "", percent: 0, tone: "bg-slate-700" };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const percent = [0, 35, 60, 85, 100][score];
  let label = "Weak";
  let tone = "bg-rose-500";

  if (score >= 4) {
    label = "Excellent";
    tone = "bg-emerald-500";
  } else if (score === 3) {
    label = "Strong";
    tone = "bg-lime-500";
  } else if (score === 2) {
    label = "Fair";
    tone = "bg-amber-500";
  }

  const helper =
    score >= 3
      ? "Looks ready for production."
      : "Use 8+ chars with numbers & symbols.";

  return { score, label, helper, percent, tone };
};

const isValidEmail = (value) => EMAIL_REGEX.test(value.trim());
const isValidPhone = (value) => PHONE_REGEX.test(value.replaceAll(" ", ""));

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gender: "prefer-not",
    email: "",
    phone: "",
    demographic: "student",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(formData.password),
    [formData.password]
  );

  const confirmPasswordMatches =
    !!formData.confirmPassword && formData.confirmPassword === formData.password;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setErrorMessage("");

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Tell us who you are.";
    }

    if (!isValidEmail(formData.email)) {
      nextErrors.email = "Use your work email (name@company.com).";
    }

    if (!isValidPhone(formData.phone)) {
      nextErrors.phone = "Add a valid phone with country code.";
    }

    if (!passwordStrength || passwordStrength.score < 2) {
      nextErrors.password = "Stronger password required.";
    }

    if (!confirmPasswordMatches) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      setTouchedFields({
        name: true,
        email: true,
        phone: true,
        gender: true,
        demographic: true,
        password: true,
        confirmPassword: true,
      });
      setErrorMessage("Please resolve the highlighted items.");
      return;
    }

    setFormErrors({});
    setErrorMessage("");

    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.msg || "An error occurred during signup.");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("Error signing up:", error);
      setErrorMessage("Failed to connect to server. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-12 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(52,211,153,0.16),transparent_42%)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur-2xl lg:flex-row">
          <aside className="flex flex-col gap-8 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent p-10 text-slate-100 lg:w-5/12">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/60 shadow-lg">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3l8 4v5c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 12l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              CyberSafe Enterprise Access
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Activate your frontline defense.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200/80">
                Create an account to launch AI-assisted guardrails, automate escalations, and orchestrate coverage for every teammate.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-200/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/30 text-sky-200">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Spin up custom playbooks by industry, regulatory posture, and device mix.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-200">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Centralize risk posture insights with live benchmarks and AI insights.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-purple-200">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Unlock executive dashboards with automated summaries and forecasting.
              </li>
            </ul>
          </aside>

          <div className="flex-1 bg-slate-900/40 p-8 sm:p-10">
            <div className="mx-auto w-full max-w-xl">
              <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">Step into CyberSafe</p>
                <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                  Create your secure workspace
                </h1>
                <p className="text-sm text-slate-300">
                  Provision access for you or your team. We safeguard every action with encrypted workflows and adaptive verification.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7" noValidate>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                      Full name
                    </label>
                    <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 focus-within:border-indigo-400/70 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <span className="flex h-11 w-12 items-center justify-center text-slate-400 transition group-focus-within:text-indigo-300">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="peer h-12 w-full bg-transparent pr-12 text-base text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="Jordan Carter"
                      />
                      {formData.name.trim() && !formErrors.name && (
                        <span className="pointer-events-none absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {touchedFields.name && formErrors.name && (
                      <p className="mt-2 text-xs font-medium text-rose-400">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                      Work email
                    </label>
                    <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 focus-within:border-indigo-400/70 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <span className="flex h-11 w-12 items-center justify-center text-slate-400 transition group-focus-within:text-indigo-300">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M4 6h16v12H4z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 8l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="peer h-12 w-full bg-transparent pr-12 text-base text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="you@cybersafe.com"
                      />
                      {isValidEmail(formData.email) && !formErrors.email && (
                        <span className="pointer-events-none absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {touchedFields.email && formErrors.email && (
                      <p className="mt-2 text-xs font-medium text-rose-400">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-200">
                      Mobile number
                    </label>
                    <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 focus-within:border-indigo-400/70 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <span className="flex h-11 w-12 items-center justify-center text-slate-400 transition group-focus-within:text-indigo-300">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        autoComplete="tel"
                        className="peer h-12 w-full bg-transparent pr-12 text-base text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="+1 415 555 0101"
                      />
                      {isValidPhone(formData.phone) && !formErrors.phone && (
                        <span className="pointer-events-none absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {touchedFields.phone && formErrors.phone && (
                      <p className="mt-2 text-xs font-medium text-rose-400">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="mb-2 block text-sm font-medium text-slate-200">
                      Gender (optional)
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white transition focus:border-indigo-400/70 focus:bg-white/10 focus:outline-none"
                      >
                        <option className="text-slate-900" value="female">
                          Female
                        </option>
                        <option className="text-slate-900" value="male">
                          Male
                        </option>
                        <option className="text-slate-900" value="non-binary">
                          Non-binary
                        </option>
                        <option className="text-slate-900" value="prefer-not">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 focus-within:border-indigo-400/70 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <span className="flex h-11 w-12 items-center justify-center text-slate-400 transition group-focus-within:text-indigo-300">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="5" y="11" width="14" height="10" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className="peer h-12 w-full bg-transparent pr-12 text-base text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {showPassword ? (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 3l18 18" strokeLinecap="round" />
                            <path d="M10.584 10.587a3 3 0 004.242 4.242" />
                            <path d="M9.88 5.07a8.945 8.945 0 012.12-.257C17 4.813 21 12 21 12a17.342 17.342 0 01-3.294 4.568" strokeLinecap="round" />
                            <path d="M6.713 6.707A17.54 17.54 0 003 12s2.8 4.8 7.05 7" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M1.5 12s4-7.188 10.5-7.188S22.5 12 22.5 12s-4 7.188-10.5 7.188S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3.5" />
                          </svg>
                        )}
                      </button>
                      {passwordStrength.score >= 3 && !formErrors.password && (
                        <span className="pointer-events-none absolute right-12 hidden h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 sm:flex">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                      <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full ${passwordStrength.tone}`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                      <span className="font-medium text-slate-200">{passwordStrength.label}</span>
                    </div>
                    {passwordStrength.helper && (
                      <p className="mt-2 text-xs text-slate-400">{passwordStrength.helper}</p>
                    )}
                    {touchedFields.password && formErrors.password && (
                      <p className="mt-2 text-xs font-medium text-rose-400">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
                      Confirm password
                    </label>
                    <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 focus-within:border-indigo-400/70 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <span className="flex h-11 w-12 items-center justify-center text-slate-400 transition group-focus-within:text-indigo-300">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M12 3l8 4v5c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className="peer h-12 w-full bg-transparent pr-12 text-base text-white placeholder:text-slate-500 focus:outline-none"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {showConfirmPassword ? (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 3l18 18" strokeLinecap="round" />
                            <path d="M10.584 10.587a3 3 0 004.242 4.242" />
                            <path d="M9.88 5.07a8.945 8.945 0 012.12-.257C17 4.813 21 12 21 12a17.342 17.342 0 01-3.294 4.568" strokeLinecap="round" />
                            <path d="M6.713 6.707A17.54 17.54 0 003 12s2.8 4.8 7.05 7" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M1.5 12s4-7.188 10.5-7.188S22.5 12 22.5 12s-4 7.188-10.5 7.188S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3.5" />
                          </svg>
                        )}
                      </button>
                      {confirmPasswordMatches && !formErrors.confirmPassword && (
                        <span className="pointer-events-none absolute right-4 hidden h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 sm:flex">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {touchedFields.confirmPassword && formErrors.confirmPassword && (
                      <p className="mt-2 text-xs font-medium text-rose-400">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="demographic" className="mb-3 block text-sm font-medium text-slate-200">
                    Tailor experience for
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "student", label: "Student analysts" },
                      { value: "professional", label: "IT professionals" },
                      { value: "senior-citizen", label: "Senior citizens" },
                      { value: "homemaker", label: "Home managers" },
                      { value: "rural-user", label: "Rural communities" },
                    ].map((option) => {
                      const active = formData.demographic === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange({ target: { name: "demographic", value: option.value } })}
                          className={`flex h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                            active
                              ? "border-indigo-400/70 bg-indigo-500/20 text-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.28)]"
                              : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <span>{option.label}</span>
                          {active && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMessage && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errorMessage}
                  </p>
                )}

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 text-base font-semibold text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition duration-300 hover:scale-[1.02] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
                    <span className="relative">Create account</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.15 0 5.94 1.08 8.16 2.85l6.09-6.09C34.5 2.98 29.64 1 24 1 14.89 1 6.85 6.92 3.3 15.06l7.5 5.82C12.73 14.5 17.89 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.5 24c0-1.57-.15-3.08-.44-4.5H24v9h12.75c-.55 2.97-2.1 5.49-4.47 7.24l7.2 5.58C43.8 37.02 46.5 31 46.5 24z" />
                        <path fill="#FBBC05" d="M10.8 28.02A14.5 14.5 0 019.5 24c0-1.39.24-2.73.67-3.96l-7.5-5.82A23.93 23.93 0 000 24c0 3.84.92 7.46 2.55 10.69l8.25-6.67z" />
                        <path fill="#34A853" d="M24 47c6.48 0 11.9-2.13 15.87-5.8l-7.2-5.58c-2 1.45-4.56 2.3-8.67 2.3-6.11 0-11.27-5-12.12-11.38l-8.25 6.67C6.85 41.08 14.89 47 24 47z" />
                      </svg>
                    </span>
                    Sign up with Google
                  </button>
                </div>
              </form>

              <div className="mt-10 space-y-4 text-sm text-slate-300">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <span className="h-[1px] w-12 bg-slate-700" /> Trust layer
                </p>
                <p className="text-sm">
                  Your onboarding data is encrypted in transit and at rest. We monitor 24/7 for SOC 2, ISO 27001, and regional data residency requirements.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-indigo-200">
                  <Link to="/privacy" className="underline-offset-4 transition hover:underline">
                    Privacy policy
                  </Link>
                  <Link to="/security" className="underline-offset-4 transition hover:underline">
                    Security practices
                  </Link>
                  <Link to="/support" className="underline-offset-4 transition hover:underline">
                    Support channel
                  </Link>
                </div>
              </div>

              <p className="mt-10 text-center text-sm text-slate-400">
                Already onboarded?{" "}
                <Link to="/login" className="font-semibold text-indigo-300 transition hover:text-indigo-200">
                  Log in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
