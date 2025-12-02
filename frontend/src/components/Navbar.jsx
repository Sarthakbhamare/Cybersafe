// src/components/Navbar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getGamificationStats } from "../utils/gamification";
import { keyFor, ensureScopedMigration } from "../utils/userScopedStorage";
import { LockMorph } from "../logo";
// import GoogleTranslate from "./GoogleTranslate";

const NAV_LINKS = [
  { label: "Feed", to: "/cybersafe-feed" },
  { label: "Learning", to: "/student-dashboard" },
  { label: "Anonymous", to: "/anonymous" },
  { label: "Community", to: "/community-reputation" },
  { label: "Chatbot", to: "/chatbot" },
  { label: "Detector", to: "/api-tool" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpStats, setXpStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const demographic = localStorage.getItem("demographic");

    setIsLoggedIn(Boolean(token));
    setDashboardPath(token && demographic ? `/${demographic}-dashboard` : "/");
    
    // Update streak count (per user)
    ensureScopedMigration();
    const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
    setStreak(currentStreak);
    
    // Load gamification stats
    const stats = getGamificationStats();
    setXpStats(stats);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("demographic");
    setIsLoggedIn(false);
    navigate("/");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  if (isAuthPage) {
    return (
      <nav className="bg-slate-950 border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold text-white">
            CyberSafe
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400"
            >
              Sign Up
            </Link>
            {/* <GoogleTranslate /> */}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-md backdrop-blur-sm"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <LockMorph size={44} variant="light" intensity="bold" speed={1} label="" />
            <span className="hidden sm:inline leading-none">CyberSafe</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex ml-2">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-cyan-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-cyan-500 transition-all duration-300 ${
                      isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
            
            {streak > 0 && (
              <div className="ml-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 border border-orange-200">
                <span className="text-base">🔥</span>
                <span className="text-sm font-bold text-orange-600">{streak}</span>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoggedIn ? (
              <>
                {xpStats && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 border border-indigo-200 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{xpStats.currentLevel.badge}</span>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-indigo-700">{xpStats.currentLevel.name}</div>
                      <div className="text-xs text-gray-600">{xpStats.totalXP.toLocaleString()} XP</div>
                    </div>
                  </Link>
                )}
                <Link
                  to={dashboardPath}
                  className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
                >
                  Logout
                </button>
                {/* <GoogleTranslate /> */}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400"
                >
                  Sign Up
                </Link>
                {/* <GoogleTranslate /> */}
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isMenuOpen ? "max-h-screen border-t border-slate-200" : "max-h-0"
          }`}
        >
          <div className="bg-white px-6 py-4">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-cyan-50 text-cyan-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="rounded-lg bg-slate-900 px-4 py-3 text-center text-base font-semibold text-white"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border-2 border-slate-900 px-4 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg border border-slate-300 px-4 py-3 text-center text-base font-medium text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-cyan-500 px-4 py-3 text-center text-base font-semibold text-slate-950"
                  >
                    Get Protected
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;
