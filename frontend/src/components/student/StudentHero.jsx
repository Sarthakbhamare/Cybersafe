import React from "react";
import { Link } from "react-router-dom";
import { COLORS, TYPOGRAPHY } from "../../design/studentPageTokens";

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    destructive: "bg-red-100 text-red-800 border-red-200",
    default: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const CertificationPreview = () => {
  return (
    <div className="relative">
      {/* Sample Certificate Preview */}
      <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="relative p-6 bg-gradient-to-br from-slate-50 via-white to-gray-50">
          {/* Decorative gradients */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">CyberSafe</div>
                  <div className="text-xs text-gray-500">Cybersecurity Training</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 font-medium">Certificate ID</div>
                <div className="font-mono text-xs font-bold text-gray-700">CS-XXXXX</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Certificate of Completion</div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                Cybersecurity<br />Professional
              </h3>
            </div>

            {/* Recipient */}
            <div className="text-center mb-4">
              <div className="text-xs text-gray-500 mb-1">This is to certify that</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Your Name
              </div>
            </div>

            {/* Description */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                has successfully completed the <strong>CyberSafe Certification Program</strong>,
                demonstrating comprehensive knowledge of cybersecurity fundamentals.
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-600">
                <div className="text-lg font-bold text-emerald-700">Pass</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Grade</div>
              </div>
              
              <div className="px-4 py-2 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="text-lg font-bold text-gray-900">85%</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Score</div>
              </div>
              
              <div className="px-4 py-2 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="text-lg font-bold text-gray-900">43/50</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Correct</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <div className="font-medium">Issued: Nov 2025</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-xs text-gray-400 font-bold">QR</div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div className="font-medium">Valid: 2 Years</div>
              </div>
            </div>

            {/* CTA Overlay */}
            <Link to="/certification-exam">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/90 via-purple-600/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center cursor-pointer">
                <div className="text-center text-white transform translate-y-8 hover:translate-y-0 transition-transform duration-300">
                  <div className="text-2xl font-bold mb-2">Earn Your Certificate</div>
                  <div className="text-sm mb-4">Take the certification exam now</div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold">
                    <span>Start Exam</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-xl">
        <span className="text-3xl">🎓</span>
      </div>
    </div>
  );
};

const StudentHero = () => {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${COLORS.primary.gradient}`}>
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="w-fit bg-white/10 text-white border-white/20"
            >
              🎓 For Students, By Students
            </Badge>
            
            <h1 className={TYPOGRAPHY.hero.title}>
              Stay Safe Online with{" "}
              <span className="text-yellow-300">CyberSafe</span>
            </h1>
            
            <p className={TYPOGRAPHY.hero.subtitle}>
              Interactive cybersecurity training designed for tech-savvy
              students. Learn to spot scams, avoid phishing attacks, and
              protect yourself from online threats through fun, engaging
              games.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#learning-section">
                <Button
                  size="lg"
                  className="text-indigo-600 hover:bg-gray-100 shadow-xl"
                >
                  🎯 Start Learning
                </Button>
              </a>
              <Link to="/api-tool">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 border-2"
                >
                  🔍 Try Threat Detector
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Beta</div>
                <div className="text-sm text-white/80">Early Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-sm text-white/80">Forever</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5+</div>
                <div className="text-sm text-white/80">Learning Modes</div>
              </div>
            </div>
          </div>

          <CertificationPreview />
        </div>
      </div>
    </section>
  );
};

export default StudentHero;
