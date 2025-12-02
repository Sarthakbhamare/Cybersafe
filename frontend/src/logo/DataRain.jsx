import React from "react";

/**
 * DataRain: Shield with falling binary characters representing data flow & filtering.
 */
const DataRain = ({ size = 64, label = "CyberSafe" }) => {
  const id = React.useId();
  const rows = 14;
  const cols = 10;
  const chars = Array.from({ length: rows * cols }).map(() => (Math.random() > 0.5 ? "1" : "0"));
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`shieldGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00648D" />
            <stop offset="100%" stopColor="#0090BF" />
          </linearGradient>
          <clipPath id={`clip-${id}`}>
            <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" />
          </clipPath>
          <mask id={`fade-${id}`}>
            <rect x="0" y="0" width="128" height="128" fill="url(#shieldGrad)" />
          </mask>
        </defs>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill={`url(#shieldGrad-${id})`} />
        <g clipPath={`url(#clip-${id})`}>
          <g fontFamily="monospace" fontSize="7" fill="#ffffff" fillOpacity="0.65">
            {chars.map((ch, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = 30 + col * 6.2;
              const yStart = 40 + row * 6;
              const delay = (col * 0.12 + row * 0.05).toFixed(2);
              return (
                <text
                  key={i}
                  x={x}
                  y={yStart}
                  className="animate-[datafall_3.8s_linear_infinite]"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {ch}
                </text>
              );
            })}
          </g>
          <rect x="0" y="0" width="128" height="128" fill="url(#shieldGrad)" opacity="0.05" />
        </g>
        <path d="M64 18l36 16v20c0 28-19 45-36 52-17-7-36-24-36-52V34l36-16z" fill="none" stroke="#003C57" strokeWidth="2" strokeOpacity="0.5" />
      </svg>
      {label && <span className="font-semibold text-slate-900">{label}</span>}
      <style>
        {`@keyframes datafall {0% { transform: translateY(-10px); opacity: 0;} 10% { opacity: 0.8;} 90% {opacity: 0.8;} 100% { transform: translateY(70px); opacity: 0;}}`}
      </style>
    </div>
  );
};
export default DataRain;
