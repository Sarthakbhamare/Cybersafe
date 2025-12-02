import React from "react";

/**
 * OrbitShield: Central shield with orbiting particle.
 * Enhanced with login gradient (indigo → cyan) and glow pulse.
 */
const OrbitShield = ({ size = 72, label = "CyberSafe" }) => {
  const id = React.useId();
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="overflow-visible drop-shadow-[0_6px_18px_rgba(99,102,241,0.35)]">
        <defs>
          <linearGradient id={`grad-${id}`} x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="45%" stopColor="#6366F1" />
            <stop offset="75%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="55%" r="65%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill={`url(#grad-${id})`} />
        <circle cx="64" cy="64" r="46" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />
        <g style={{ transformOrigin: '64px 64px' }} className="animate-[spin_5.6s_linear_infinite]">
          <circle cx="64" cy="18" r="6" fill="#ffffff" className="animate-[orbitpulse_3s_ease_infinite]" />
          <circle cx="64" cy="18" r="12" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
        </g>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill="none" stroke="#1e1b4b" strokeOpacity="0.55" strokeWidth="2.2" />
        <circle cx="64" cy="64" r="54" stroke="#6366F1" strokeWidth="1" strokeDasharray="6 10" fill="none" className="animate-[pulseRing_6s_linear_infinite]" />
        <circle cx="64" cy="64" r="44" fill={`url(#glow-${id})`} opacity="0.18" />
      </svg>
      {label && <span className="font-semibold text-slate-900">{label}</span>}
      <style>{`@keyframes orbitpulse {0%,70% {transform: scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0));} 85% {transform: scale(1.25); filter: drop-shadow(0 0 8px rgba(99,102,241,0.6));} 100% {transform: scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0));}}
        @keyframes pulseRing {0% {opacity:0.06; transform: scale(0.94);} 40% {opacity:0.25; transform: scale(1);} 60% {opacity:0.15;} 100% {opacity:0.06; transform: scale(0.94);} }
        @media (prefers-reduced-motion: reduce) { .animate-[spin_5.6s_linear_infinite], .animate-[pulseRing_6s_linear_infinite], .animate-[orbitpulse_3s_ease_infinite] {animation: none !important;} }`}</style>
    </div>
  );
};
export default OrbitShield;
