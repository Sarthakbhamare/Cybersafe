import React, { useState } from "react";
import { Link } from "react-router-dom";

const SEVERITY_CONFIG = {
  critical: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    indicator: "bg-rose-500",
    hover: "hover:border-rose-200",
  },
  high: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    indicator: "bg-amber-500",
    hover: "hover:border-amber-200",
  },
  medium: {
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    indicator: "bg-cyan-500",
    hover: "hover:border-cyan-200",
  },
  low: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500",
    hover: "hover:border-emerald-200",
  },
};

const DEMOGRAPHIC_ICONS = {
  students: "🎓",
  professionals: "💼",
  rural: "🌾",
  seniors: "👴",
  homemakers: "🏠",
};

const AlertCard = ({ alert, onClick }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${severityConfig.hover} hover:shadow-lg focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2`}
    >
      {/* Severity Indicator Strip */}
      <div className={`absolute left-0 top-0 h-full w-1 ${severityConfig.indicator}`} />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 px-6 pt-5">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {DEMOGRAPHIC_ICONS[alert.demographic]}
          </span>
          <span
            className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityConfig.badge}`}
          >
            {alert.severity}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark alert"}
        >
          <svg
            className="h-5 w-5"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 px-6 pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {alert.location}
        </span>
        <span>•</span>
        <span>{alert.timeAgo}</span>
        <span>•</span>
        <span>{alert.readTime} read</span>
      </div>

      {/* Visual Icon */}
      <div className="relative mt-4 flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <span className="text-6xl opacity-80" aria-hidden="true">
          {alert.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6 pb-5 pt-4">
        <h3 className="mb-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-accent-600">
          <button
            onClick={() => onClick(alert)}
            className="after:absolute after:inset-0 focus:outline-none"
          >
            <span className="line-clamp-2">{alert.title}</span>
          </button>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {alert.summary}
        </p>

        {/* Key Points Preview */}
        <div className="mb-4 space-y-2 border-l-2 border-slate-200 pl-3">
          {alert.keyPoints.slice(0, 2).map((point, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-500" aria-hidden="true">
                •
              </span>
              <span className="text-xs text-slate-700 line-clamp-1">{point}</span>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {alert.views}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {alert.comments}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {alert.shares}
            </span>
          </div>

          <span className="flex items-center gap-1 text-xs font-medium text-accent-600 transition-all group-hover:gap-2">
            Read More
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};

// Skeleton Loading State
export const AlertCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-200" />
            <div className="h-6 w-16 rounded-lg bg-slate-200" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 px-6 pt-2">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-3 rounded-full bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>

        {/* Visual */}
        <div className="mt-4 h-40 bg-slate-100" />

        {/* Content */}
        <div className="px-6 pb-5 pt-4">
          <div className="mb-2 h-6 w-full rounded bg-slate-200" />
          <div className="mb-4 h-6 w-3/4 rounded bg-slate-200" />
          
          <div className="mb-4 space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
          </div>

          <div className="mb-4 space-y-2 border-l-2 border-slate-200 pl-3">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-4/5 rounded bg-slate-200" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex gap-4">
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
            </div>
            <div className="h-4 w-20 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
