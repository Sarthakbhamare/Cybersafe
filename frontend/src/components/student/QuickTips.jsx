import React from "react";
import { SURFACE_CLASSES, TYPOGRAPHY } from "../../design/studentPageTokens";

const TIPS_DATA = [
  {
    id: 1,
    tip: "Always check the URL before entering personal info",
    category: "Website Safety",
  },
  {
    id: 2,
    tip: "If it sounds too good to be true, it probably is",
    category: "Job Scams",
  },
  {
    id: 3,
    tip: "Never give personal details in DMs from strangers",
    category: "Social Media",
  },
  {
    id: 4,
    tip: "Use official app stores for downloads only",
    category: "App Safety",
  },
  {
    id: 5,
    tip: "Enable 2FA on all your accounts",
    category: "Account Security",
  },
  {
    id: 6,
    tip: "Don't click suspicious links, even from friends",
    category: "Phishing",
  },
];

const QuickTips = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200/60">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="font-semibold text-lg text-gray-900">
          Quick Safety Tips
        </h3>
      </div>

      <div className="grid gap-3">
        {TIPS_DATA.map((tip) => (
          <div
            key={tip.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100/50 hover:shadow-md transition-all duration-200"
          >
            <span className="text-green-500 text-lg mt-0.5 font-bold">✓</span>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1 text-gray-800">
                {tip.tip}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">
                {tip.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickTips;
