import React from "react";

/**
 * WordmarkSweep: Animated CyberSafe wordmark with gradient sweep underline.
 * Enhanced with login gradient (indigo → cyan), sheen highlight, and reduced-motion safety.
 */
const WordmarkSweep = ({ size = 28, label = "CyberSafe" }) => {
  const id = React.useId();
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label={label}>
      <svg width={size * 6.5} height={size * 2.2} viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_6px_18px_rgba(99,102,241,0.15)]">
        <defs>
          <linearGradient id={`grad-${id}`} x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="45%" stopColor="#6366F1" />
            <stop offset="75%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id={`sheen-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text x="20" y="90" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="72" fill="#0f172a">Cyber</text>
        <text x="250" y="90" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="72" fill="#0f172a">Safe</text>
        <rect x="20" y="105" width="0" height="8" rx="4" fill={`url(#grad-${id})`} className="animate-[sweep_2.4s_ease_infinite]"/>
        {/* sheen across letters */}
        <rect x="0" y="0" width="140" height="120" fill={`url(#sheen-${id})`} opacity="0.35" style={{ transform: 'skewX(-20deg)', animation: 'sheen 3.6s ease-in-out infinite' }} />
      </svg>
      <style>
        {`@keyframes sweep {0% {width: 0;} 40% {width: 480px;} 60% {width: 480px;} 100% {width: 0;}}
          @keyframes sheen {0% {transform: translateX(-60px) skewX(-20deg);} 50% {transform: translateX(520px) skewX(-20deg);} 100% {transform: translateX(520px) skewX(-20deg);} }
          @media (prefers-reduced-motion: reduce) { .animate-[sweep_2.4s_ease_infinite] {animation: none !important;} }`}
      </style>
    </div>
  );
};
export default WordmarkSweep;
