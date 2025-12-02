import React, { useState, useEffect } from "react";

const SAFETY_TIPS = [
  {
    id: 1,
    tip: "Never share your OTP with anyone - not even bank staff",
    category: "Banking",
    icon: "🏦",
    color: "from-blue-50 to-cyan-50 border-blue-200"
  },
  {
    id: 2,
    tip: "Always check the URL before entering personal info",
    category: "Website Safety",
    icon: "🔒",
    color: "from-green-50 to-emerald-50 border-green-200"
  },
  {
    id: 3,
    tip: "If it sounds too good to be true, it probably is",
    category: "Job Scams",
    icon: "💼",
    color: "from-yellow-50 to-orange-50 border-yellow-200"
  },
  {
    id: 4,
    tip: "Never give personal details in DMs from strangers",
    category: "Social Media",
    icon: "📱",
    color: "from-purple-50 to-pink-50 border-purple-200"
  },
  {
    id: 5,
    tip: "Use official app stores for downloads only",
    category: "App Safety",
    icon: "📲",
    color: "from-indigo-50 to-blue-50 border-indigo-200"
  },
  {
    id: 6,
    tip: "Enable 2FA on all your accounts",
    category: "Account Security",
    icon: "🔐",
    color: "from-red-50 to-pink-50 border-red-200"
  },
  {
    id: 7,
    tip: "Don't click suspicious links, even from friends",
    category: "Phishing",
    icon: "🎣",
    color: "from-orange-50 to-yellow-50 border-orange-200"
  },
  {
    id: 8,
    tip: "Verify banking detail changes through official channels",
    category: "Corporate",
    icon: "🏢",
    color: "from-teal-50 to-cyan-50 border-teal-200"
  },
  {
    id: 9,
    tip: "Government never sends urgent SMS with links",
    category: "Government",
    icon: "🏛️",
    color: "from-slate-50 to-gray-50 border-slate-200"
  },
  {
    id: 10,
    tip: "Check if it's 'Pay' or 'Request' before scanning QR codes",
    category: "UPI",
    icon: "💰",
    color: "from-lime-50 to-green-50 border-lime-200"
  },
];

const FloatingTipWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
    
    // Clear any old dismissal flag to ensure widget shows
    localStorage.removeItem('tipWidgetDismissed');
    
    // Auto-cycle tips every 30 seconds
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    // Only hide for current session, not permanently
    setIsVisible(false);
  };

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
  };

  const handlePrev = () => {
    setCurrentTipIndex((prev) => (prev - 1 + SAFETY_TIPS.length) % SAFETY_TIPS.length);
  };

  // Don't show if user is not logged in
  if (!isLoggedIn || !isVisible) return null;

  const currentTip = SAFETY_TIPS[currentTipIndex];

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-white shadow-2xl hover:shadow-xl transition-all hover:scale-105"
        >
          <span className="text-xl">{currentTip.icon}</span>
          <span className="text-sm font-semibold">Safety Tip</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-slide-up">
      <div className={`rounded-2xl bg-gradient-to-br ${currentTip.color} border-2 shadow-2xl backdrop-blur-sm overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentTip.icon}</span>
            <span className="text-sm font-bold text-gray-800">💡 Safety Tip</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white/60 text-gray-700">
              {currentTip.category}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-800 leading-relaxed mb-4">
            {currentTip.tip}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/70 hover:bg-white transition-all shadow-sm"
              title="Previous tip"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-1">
              {SAFETY_TIPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentTipIndex
                      ? "w-6 bg-gray-700"
                      : "w-1.5 bg-gray-400 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/70 hover:bg-white transition-all shadow-sm"
              title="Next tip"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-600">
              Tip {currentTipIndex + 1} of {SAFETY_TIPS.length}
            </span>
          </div>
        </div>

        {/* Footer action */}
        <div className="p-3 bg-white/40 border-t border-gray-200/50">
          <button
            onClick={() => localStorage.setItem('tipWidgetDismissed', 'false')}
            className="w-full text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ✓ Mark as learned
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingTipWidget;
