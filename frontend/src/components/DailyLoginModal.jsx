import React, { useState, useEffect } from "react";
import { processDailyLogin } from "../utils/gamification";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", className = "", onClick }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-6 py-3";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const DailyLoginModal = () => {
  const [show, setShow] = useState(false);
  const [loginData, setLoginData] = useState(null);

  useEffect(() => {
    // Check if should show daily login modal
    const result = processDailyLogin();
    
    if (!result.alreadyLoggedIn) {
      setLoginData(result);
      setShow(true);
    }
  }, []);

  if (!show || !loginData) return null;

  const { loginStreak, streakDay, reward, xpGained, leveledUp, newLevel } = loginData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <Card className="max-w-md mx-4 bg-white shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-center text-white">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
          <p className="text-white/90">Day {streakDay} of your journey</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* XP Reward */}
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
            <div className="text-5xl font-bold text-orange-600 mb-2">
              +{xpGained} XP
            </div>
            <div className="text-sm text-gray-700">Daily Login Bonus</div>
          </div>

          {/* Streak Display */}
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🔥</span>
              <span className="text-3xl font-bold text-orange-600">{loginStreak} Days</span>
            </div>
            <div className="text-sm text-gray-700">Login Streak</div>
          </div>

          {/* Streak Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Day {streakDay} of 7</span>
              <span>{streakDay === 7 ? '🎁 Bonus Ready!' : 'Keep going!'}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(streakDay / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Special Bonus */}
          {reward.bonus && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <div className="text-sm font-semibold text-purple-800">{reward.bonus}</div>
            </div>
          )}

          {/* Level Up Notification */}
          {leveledUp && newLevel && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg text-center animate-bounce">
              <div className="text-4xl mb-2">{newLevel.badge}</div>
              <div className="font-bold text-green-800 text-lg mb-1">Level Up!</div>
              <div className="text-sm text-gray-700">You're now a <span className="font-semibold">{newLevel.name}</span></div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="text-center text-sm text-gray-600">
            {streakDay === 7 ? (
              <p className="font-semibold text-green-700">🎊 Week complete! Amazing dedication!</p>
            ) : streakDay >= 3 ? (
              <p>Keep your streak alive! Come back tomorrow 💪</p>
            ) : (
              <p>Great start! Daily practice makes you cyber-safe 🛡️</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Button onClick={() => setShow(false)} className="w-full">
            Start Learning 🚀
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DailyLoginModal;
