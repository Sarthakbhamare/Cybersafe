import React from "react";

/**
 * NetworkPulse: Nodes and links inside a shield that pulse in sequence.
 * Enhanced with login gradient and ring sweep for premium feel.
 */
const NetworkPulse = ({ size = 72, label = "CyberSafe" }) => {
  const id = React.useId();
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_6px_18px_rgba(99,102,241,0.35)]">
        <defs>
          <linearGradient id={`g-${id}`} x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="45%" stopColor="#6366F1" />
            <stop offset="75%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <clipPath id={`clip-${id}`}>
            <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" />
          </clipPath>
        </defs>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill={`url(#g-${id})`} />
        <g clipPath={`url(#clip-${id})`}>
          <g stroke="#ffffff" strokeOpacity="0.5">
            <path d="M44 54 L64 68 L84 54 L64 86 Z" fill="none" />
            <path d="M44 54 L84 54" />
            <path d="M64 68 L64 86" />
          </g>
          {[{x:44,y:54,d:0},{x:64,y:68,d:0.2},{x:84,y:54,d:0.4},{x:64,y:86,d:0.6}].map((n,i)=> (
            <circle key={i} cx={n.x} cy={n.y} r="5" fill="#ffffff" className="animate-[nodepulse_2s_ease_infinite]" style={{animationDelay:`${n.d}s`}} />
          ))}
          {/* sweeping ring */}
          <circle cx="64" cy="68" r="40" fill="none" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" className="animate-[sweep_4.8s_linear_infinite]" />
        </g>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill="none" stroke="#1e1b4b" strokeOpacity="0.55" strokeWidth="2.2" />
      </svg>
      {label && <span className="font-semibold text-slate-900">{label}</span>}
      <style>
        {`@keyframes nodepulse {0% {transform: scale(1); opacity: 0.8;} 50% {transform: scale(1.35); opacity: 1;} 100% {transform: scale(1); opacity: 0.8;}}
          @keyframes sweep {0% {stroke-dasharray: 0 260; stroke-dashoffset: 0;} 50% {stroke-dasharray: 130 130; stroke-dashoffset: -130;} 100% {stroke-dasharray: 0 260; stroke-dashoffset: -260;}}
          @media (prefers-reduced-motion: reduce) { .animate-[nodepulse_2s_ease_infinite], .animate-[sweep_4.8s_linear_infinite] {animation: none !important;} }`}
      </style>
    </div>
  );
};
export default NetworkPulse;
