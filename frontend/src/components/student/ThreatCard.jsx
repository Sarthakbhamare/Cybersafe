import React from "react";
import { SURFACE_CLASSES, BADGE_VARIANTS, TYPOGRAPHY } from "../../design/studentPageTokens";

const Badge = ({ children, variant = "default", className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const ThreatCard = ({ title, description, examples, type, severity, onRead }) => {
  const iconMap = {
    social: "📱",
    job: "💼",
    gaming: "🎮",
    general: "🛡️",
  };

  const severityColors = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  };

  const icon = iconMap[type] || iconMap.general;

  return (
    <div
      className={`${SURFACE_CLASSES.card} bg-gradient-to-br from-white to-gray-50/50 p-6`}
      onClick={onRead}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm text-2xl">
            {icon}
          </div>
          <div>
            <h3 className={TYPOGRAPHY.card.title}>{title}</h3>
            <Badge variant={severityColors[severity]} className="mt-2">
              {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk
            </Badge>
          </div>
        </div>
      </div>

      <p className={`${TYPOGRAPHY.card.body} mb-5`}>{description}</p>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></span>
          Common Examples:
        </h4>
        <ul className="space-y-2.5 ml-3">
          {examples.map((example, index) => (
            <li
              key={index}
              className="text-sm text-gray-700 flex items-start gap-3 group"
            >
              <span className="text-red-500 text-xs mt-1.5 font-bold group-hover:text-red-600 transition-colors">
                •
              </span>
              <span className="leading-relaxed group-hover:text-gray-900 transition-colors">
                {example}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThreatCard;
