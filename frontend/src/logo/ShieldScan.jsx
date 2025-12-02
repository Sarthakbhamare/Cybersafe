import React from "react";

/**
 * ShieldScan: Premium animated shield logo with enhanced radar + gradient shimmer.
 * Colors aligned to login page (indigo → cyan spectrum) and subtle pulse.
 */
const ShieldScan = ({ size = 72, label = "CyberSafe" }) => {
  const id = React.useId();
  return (
    <div className="inline-flex items-center gap-3 select-none" role="img" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_6px_18px_rgba(99,102,241,0.35)]"
      >
        <defs>
          <linearGradient id={`gradA-${id}`} x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="45%" stopColor="#6366F1" />
            <stop offset="75%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="55%" r="65%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#6366F1" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip-${id}`}>
            <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" />
          </clipPath>
          <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          </filter>
        </defs>

        {/* Shield base with animated shimmer */}
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill={`url(#gradA-${id})`} />
        <rect x="-20" y="-10" width="70" height="160" fill="#ffffff" opacity="0.18" clipPath={`url(#clip-${id})`} style={{ mixBlendMode: 'overlay', transform: 'rotate(25deg)', transformOrigin: '64px 64px', animation: 'shimmer 5.4s linear infinite'}} />

        {/* Inner glow */}
        <circle cx="64" cy="72" r="44" fill={`url(#glow-${id})`} />

        {/* Grid lines */}
        <g opacity="0.16" stroke="#ffffff" strokeWidth="1">
          <path d="M24 72h80" />
          <path d="M64 32v80" />
          <path d="M36 48l56 50" />
          <path d="M92 48L36 96" />
        </g>

        {/* Radar sweep */}
        <g clipPath={`url(#clip-${id})`}>
          <circle cx="64" cy="72" r="46" fill="none" stroke="#ffffff" strokeOpacity="0.18" />
          <g style={{ transformOrigin: "64px 72px" }} className="animate-[spin_4.6s_linear_infinite]">
            <path d="M64 72L110 72A46 46 0 0 1 64 118z" fill="#ffffff" opacity="0.10" filter={`url(#blur-${id})`} />
            <path d="M64 72L104 60A46 46 0 0 1 64 118z" fill="#ffffff" opacity="0.07" />
          </g>

          {/* Blips */}
          <g fill="#ffffff">
            <circle className="animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]" cx="86" cy="64" r="3" />
            <circle className="animate-[ping_3.6s_cubic-bezier(0,0,0.2,1)_0.6s_infinite]" cx="50" cy="88" r="3" />
            <circle className="animate-[ping_4.6s_cubic-bezier(0,0,0.2,1)_1s_infinite]" cx="74" cy="96" r="3" />
          </g>
        </g>

        {/* Outline */}
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill="none" stroke="#1e1b4b" strokeOpacity="0.6" strokeWidth="2.4" />
        {/* Outer ring pulse */}
        <circle cx="64" cy="72" r="54" stroke="#6366F1" strokeWidth="1" strokeDasharray="6 10" fill="none" className="animate-[pulseRing_5.5s_linear_infinite]" />
      </svg>
      {label && (
        <span className="font-semibold tracking-tight text-slate-900">
          {label}
        </span>
      )}
      <style>{`@keyframes shimmer {0% { transform: rotate(25deg) translateX(-20px);} 50% {transform: rotate(25deg) translateX(40px);} 100% { transform: rotate(25deg) translateX(-20px);} }
        @keyframes pulseRing {0% {opacity:0.05; transform: scale(0.92);} 40% {opacity:0.25; transform: scale(1);} 60% {opacity:0.15;} 100% {opacity:0.05; transform: scale(0.92);} }
        @media (prefers-reduced-motion: reduce) { .animate-[spin_4.6s_linear_infinite], .animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite], .animate-[ping_3.6s_cubic-bezier(0,0,0.2,1)_0.6s_infinite], .animate-[ping_4.6s_cubic-bezier(0,0,0.2,1)_1s_infinite], .animate-[pulseRing_5.5s_linear_infinite] {animation: none !important;} }`}</style>
    </div>
  );
};

export default ShieldScan;
