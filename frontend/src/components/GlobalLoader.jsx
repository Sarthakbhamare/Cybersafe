import React from "react";
import { LockMorph } from "../logo";

const GlobalLoader = ({
  message = "Securing your experience…",
  subMessage = "Please wait a moment",
  showBar = true,
  size = 96,
}) => {
  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-white/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-md px-6">
        {showBar && (
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="absolute left-0 top-0 h-full w-1/3 origin-left rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400"
              style={{ animation: "bar 1.2s ease-in-out infinite" }}
            />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center text-center">
          <LockMorph size={size} label="" variant="light" intensity="bold" speed={1} />
          <p className="mt-6 text-base font-semibold text-slate-800" role="status" aria-live="polite">
            {message}
          </p>
          <p className="mt-1 text-sm text-slate-600">{subMessage}</p>
          <div className="sr-only" aria-hidden>
            Loading
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bar {
          0% { transform: translateX(-120%) scaleX(0.4); }
          50% { transform: translateX(20%) scaleX(1); }
          100% { transform: translateX(220%) scaleX(0.6); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoader;
