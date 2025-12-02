import React from "react";

/**
 * LockMorph: Shield outline with lock appearing via stroke dash animation.
 * Enhanced with login-page gradient (indigo → cyan), glow and reduced-motion.
 * Props: variant ('light'|'dark'), intensity ('normal'|'bold'), speed (number), glow (bool)
 */
const LockMorph = ({ size = 72, label = "CyberSafe", variant = "light", intensity = "bold", speed = 1, glow = true }) => {
  const id = React.useId();
  const drawDur = `${(2.6 / Math.max(speed, 0.2)).toFixed(2)}s`;
  const dashDur = `${(2.4 / Math.max(speed, 0.2)).toFixed(2)}s`;
  const pulseDur = `${(3.0 / Math.max(speed, 0.2)).toFixed(2)}s`;
  const strokeW = intensity === "bold" ? 4.5 : 3.5;
  const lockRadius = intensity === "bold" ? 5.5 : 5;
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_6px_18px_rgba(99,102,241,0.28)]">
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
        {/* Shield path with draw animation */}
        <path
          d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z"
          fill={glow ? `url(#glow-${id})` : "none"}
          opacity={variant === "light" ? 0.16 : 0.24}
        />
        <path
          d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z"
          fill="none"
          stroke={`url(#grad-${id})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="420"
          strokeDashoffset="420"
          style={{ animation: `draw ${drawDur} ease infinite` }}
        />
        <g>
          <rect x="50" y="58" width="28" height="24" rx="6" fill={`url(#grad-${id})`} fillOpacity={variant === 'light' ? 0.16 : 0.22} stroke="#4F46E5" strokeWidth="3" strokeLinejoin="round" />
          <path
            d="M54 58v-6c0-6.5 5.3-12 12-12s12 5.5 12 12v6"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="120"
            strokeDashoffset="120"
            style={{ animation: `dash ${dashDur} ease infinite` }}
          />
          <circle cx="66" cy="70" r={lockRadius} fill="#06B6D4" style={{ animation: `lockpulse ${pulseDur} ease infinite` }} />
        </g>
        {/* Outer subtle ring for contrast on light backgrounds */}
        <circle cx="64" cy="64" r="54" stroke="#0f172a" strokeOpacity={variant === 'light' ? 0.06 : 0.12} strokeWidth="2" fill="none" />
      </svg>
      {label && <span className="font-semibold text-slate-900">{label}</span>}
      <style>
        {`@keyframes dash {0% {stroke-dashoffset: 120;} 40% {stroke-dashoffset: 0;} 55% {stroke-dashoffset: 0;} 100% {stroke-dashoffset: 120;}}
          @keyframes draw {0% {stroke-dashoffset: 420;} 45% {stroke-dashoffset: 0;} 60% {stroke-dashoffset: 0;} 100% {stroke-dashoffset: 420;}}
          @keyframes lockpulse {0%,70% {transform: scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0)); opacity:1;} 85% {transform: scale(1.25); filter: drop-shadow(0 0 8px rgba(99,102,241,0.6)); opacity:0.9;} 100% {transform: scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0)); opacity:1;}}
          @media (prefers-reduced-motion: reduce) { * {animation: none !important;} }`}
      </style>
    </div>
  );
};

export default LockMorph;
