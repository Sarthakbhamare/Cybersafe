import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 md:py-32">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Value Prop Hierarchy */}
          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Stop Cyber Threats Before
              <span className="block text-cyan-600">They Stop You</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Real-time protection, community-powered intelligence, and AI-driven fraud detection—built for India's digital citizens.
            </p>
          </div>

          {/* Dual CTA Pattern */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:bg-cyan-600 hover:shadow-xl hover:shadow-cyan-500/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500"
            >
              Get Protected Now
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              to="/cybersafe-feed"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500"
            >
              See How It Works
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="mt-16 w-full border-t border-slate-200 pt-12">
            <p className="mb-6 text-sm font-medium uppercase tracking-wider text-slate-500">
              Trusted by communities across India
            </p>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                  <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50K+</div>
                  <div className="text-sm text-slate-600">Threats Blocked</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                  <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-600">Active Members</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                  <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Real-Time Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
