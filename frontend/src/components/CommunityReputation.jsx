import React, { useState } from "react";
import { 
  detectIndicatorType, 
  searchLocalDatabase, 
  calculateReputationScore, 
  getThreatColor 
} from '../utils/threatDatabase';
import { checkIndicator } from '../utils/virusTotalService';

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>
    {children}
  </div>
);

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
      "bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400 shadow-sm hover:shadow-md",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-cyan-400",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-cyan-400",
    destructive:
      "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 shadow-sm hover:shadow-md",
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
    destructive: "bg-rose-50 text-rose-700 border-rose-200",
    default: "bg-cyan-50 text-cyan-700 border-cyan-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Tabs = ({ children, defaultValue, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

const TabsList = ({ children, className = "", activeTab, setActiveTab }) => (
  <div className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({
  children,
  value,
  className = "",
  activeTab,
  setActiveTab,
}) => (
  <button
    className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 ${
      activeTab === value
        ? "bg-cyan-500 text-white shadow-md"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    } ${className}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, className = "", activeTab }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

const ReportModal = ({ isOpen, onClose, indicator, onSubmit }) => {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      indicator,
      type: reportType,
      description,
      proofUrl,
    });
    onClose();
    setReportType("");
    setDescription("");
    setProofUrl("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Report Indicator
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Reporting:</span>
          <div className="font-mono text-sm text-gray-900 break-all mt-1">
            {indicator}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select type...</option>
              <option value="scam">Scam</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="phishing">Phishing</option>
              <option value="malware">Malware</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              placeholder="Additional details about this threat..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof URL (Optional)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://screenshot.com/proof"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!reportType}
            >
              🚨 Submit Report
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReputationCard = ({ indicator, reputation, onReport }) => {
  const getReputationBadge = (score) => {
    if (score >= 80) return { variant: "success", text: "Trusted", icon: "✅" };
    if (score >= 50) return { variant: "warning", text: "Caution", icon: "⚠️" };
    if (score >= 20)
      return { variant: "destructive", text: "Suspicious", icon: "⚠️" };
    return { variant: "destructive", text: "Dangerous", icon: "🚨" };
  };

  const badge = getReputationBadge(reputation.score);

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200/60">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{badge.icon}</span>
            <Badge variant={badge.variant}>
              {badge.text} ({reputation.score}/100)
            </Badge>
          </div>
          <div className="font-mono text-sm text-gray-900 break-all bg-gray-100 p-2 rounded">
            {indicator}
          </div>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReport(indicator)}
          className="ml-4"
        >
          🚨 Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border">
          <div className="text-xl font-bold text-gray-900">
            {reputation.total_reports}
          </div>
          <div className="text-xs text-gray-600">Total Reports</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border">
          <div className="text-xl font-bold text-gray-900">
            {reputation.unique_reporters}
          </div>
          <div className="text-xs text-gray-600">Reporters</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-gray-900">Recent Reports:</h4>
        <div className="space-y-1">
          {reputation.report_types.map((report, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700 capitalize">{report.type}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {report.count}
                </Badge>
                <span className="text-gray-500 text-xs">
                  {new Date(report.last_seen).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const TrendingThreats = () => {
  const threats = [
    {
      indicator: "free-netflix-trial.scam.com",
      score: 5,
      reports: 1247,
      trend: "up",
    },
    {
      indicator: "whatsapp-premium-offer.net",
      score: 12,
      reports: 892,
      trend: "up",
    },
    {
      indicator: "crypto-investment-guru.biz",
      score: 8,
      reports: 756,
      trend: "down",
    },
    {
      indicator: "+91-9876543210",
      score: 3,
      reports: 634,
      trend: "up",
    },
  ];

  return (
    <Card className="p-6 bg-white shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📈</span>
        <h3 className="font-semibold text-lg text-gray-900">
          Trending Threats
        </h3>
      </div>

      <div className="space-y-4">
        {threats.map((threat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100"
          >
            <div className="flex-1">
              <div className="font-mono text-sm text-gray-900 mb-1 break-all">
                {threat.indicator}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Risk: {threat.score}/100</Badge>
                <span className="text-xs text-gray-600">
                  {threat.reports} reports
                </span>
              </div>
            </div>
            <div className="ml-4 text-center">
              <div
                className={`text-lg ${
                  threat.trend === "up" ? "text-red-500" : "text-green-500"
                }`}
              >
                {threat.trend === "up" ? "📈" : "📉"}
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {threat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CommunityStats = () => {
  const stats = [
    { label: "Reports This Week", value: "2,847", change: "+12%" },
    { label: "Active Contributors", value: "15,230", change: "+8%" },
    { label: "Threats Identified", value: "45,672", change: "+15%" },
    { label: "Community Score", value: "94.2%", change: "+2%" },
  ];

  const icons = [
    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>,
    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="group border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 transition-colors group-hover:bg-cyan-100">
              {icons[index]}
            </div>
            <Badge variant="success" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {stat.change}
            </Badge>
          </div>
          <div className="mb-1 text-3xl font-bold text-slate-900">
            {stat.value}
          </div>
          <div className="text-sm text-slate-600">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
};

const CommunityReputationPage = () => {
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    indicator: "",
  });
  const [searchIndicator, setSearchIndicator] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);


  const sampleReputations = [
    {
      indicator: "suspicious-bank-alert.com",
      score: 15,
      total_reports: 234,
      unique_reporters: 89,
      report_types: [
        { type: "phishing", count: 156, last_seen: "2025-08-22T10:30:00Z" },
        { type: "scam", count: 78, last_seen: "2025-08-21T15:45:00Z" },
      ],
    },
    {
      indicator: "+91-8765432109",
      score: 8,
      total_reports: 187,
      unique_reporters: 92,
      report_types: [
        { type: "spam", count: 124, last_seen: "2025-08-23T09:15:00Z" },
        { type: "harassment", count: 63, last_seen: "2025-08-22T14:20:00Z" },
      ],
    },
    {
      indicator: "crypto-doubler-pro.net",
      score: 3,
      total_reports: 456,
      unique_reporters: 178,
      report_types: [
        { type: "scam", count: 289, last_seen: "2025-08-23T11:00:00Z" },
        { type: "phishing", count: 167, last_seen: "2025-08-22T16:30:00Z" },
      ],
    },
  ];

  const handleReport = (indicator) => {
    setReportModal({ isOpen: true, indicator });
  };

  const handleReportSubmit = (reportData) => {
    console.log("Report submitted:", reportData);
    alert(`Report submitted for ${reportData.indicator}`);
  };

  const handleCheckIndicator = async () => {
    if (!searchIndicator.trim()) {
      setSearchError('Please enter a URL, IP address, email, or phone number');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const type = detectIndicatorType(searchIndicator);
      
      if (type === 'unknown') {
        setSearchError('Unable to identify indicator type. Please enter a valid URL, IP, email, or phone number.');
        setSearchLoading(false);
        return;
      }

      const localResult = searchLocalDatabase(searchIndicator, type);
      
      if (localResult) {
        const reputationScore = calculateReputationScore(localResult.severity, localResult.reports);
        setSearchResult({
          ...localResult,
          reputationScore,
          source: 'Local Database',
          cached: true
        });
        setSearchLoading(false);
        return;
      }

      const vtResult = await checkIndicator(searchIndicator, type);
      
      if (vtResult) {
        const reputationScore = calculateReputationScore(vtResult.severity, vtResult.reports);
        setSearchResult({
          ...vtResult,
          reputationScore
        });
      } else {
        setSearchResult({
          indicator: searchIndicator,
          type: 'unknown',
          severity: 'safe',
          category: 'No Threats Detected',
          reports: 0,
          lastSeen: 'Never',
          description: 'This indicator has not been reported in our threat databases. However, always exercise caution with unfamiliar links, emails, or phone numbers.',
          tags: ['unreported'],
          reputationScore: 100,
          source: 'Not Found'
        });
      }
    } catch (err) {
      console.error('Check error:', err);
      setSearchError('An error occurred while checking this indicator. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getReputationColorClass = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReputationLabel = (score) => {
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Questionable';
    if (score >= 25) return 'Poor';
    return 'Dangerous';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 space-y-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <svg className="h-10 w-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
              Community Reputation Center
            </h1>
          </div>
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            Powered by community reports, our reputation system helps identify and track online threats. 
            One tap to report, collective intelligence to protect everyone.
          </p>
        </div>

        <CommunityStats />

        <Tabs defaultValue="search" className="space-y-8">
          <TabsList className="flex w-full gap-3">
            <TabsTrigger value="search" className="flex-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Reputation
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Reports
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending Threats
            </TabsTrigger>
            <TabsTrigger value="contribute" className="flex-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Contribute
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            <Card className="border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-slate-900">
                Check Indicator Reputation
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchIndicator}
                  onChange={(e) => setSearchIndicator(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !searchLoading && handleCheckIndicator()}
                  placeholder="Enter URL or IP address..."
                  className="flex-1 rounded-xl border-slate-300 p-4 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus-visible:outline-none"
                  disabled={searchLoading}
                />
                <Button className="px-8" onClick={handleCheckIndicator} disabled={searchLoading}>
                  {searchLoading ? (
                    <>
                      <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Try:</span>
                {[
                  { label: 'Phishing URL', value: 'http://hdfc-kyc-update.tk' },
                  { label: 'Malicious IP', value: '185.220.101.47' }
                ].map((example) => (
                  <button
                    key={example.value}
                    onClick={() => setSearchIndicator(example.value)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                    disabled={searchLoading}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Search our comprehensive threat intelligence database for URLs and IP addresses.
              </p>

              {searchError && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-red-800 text-sm">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{searchError}</p>
                  </div>
                </div>
              )}

              {searchResult && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={searchResult.severity === 'critical' || searchResult.severity === 'high' ? 'destructive' : searchResult.severity === 'medium' ? 'warning' : 'success'} className="text-xs px-2 py-0.5">
                      {searchResult.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-600">{searchResult.category}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 break-all bg-white px-2 py-1 rounded mb-3">{searchResult.indicator}</p>
                  
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-slate-900">{searchResult.reports.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Reports</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-slate-900 capitalize">{searchResult.type}</p>
                      <p className="text-xs text-slate-500">Status</p>
                    </div>
                    {searchResult.tags && searchResult.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {searchResult.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {!searchResult && !searchError && !searchLoading && (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {sampleReputations.map((reputation, index) => (
                  <ReputationCard
                    key={index}
                    indicator={reputation.indicator}
                    reputation={reputation}
                    onReport={handleReport}
                  />
                ))}
              </div>
            )}

            {(searchResult || searchError) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Example Community Reports</h3>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {sampleReputations.map((reputation, index) => (
                    <ReputationCard
                      key={index}
                      indicator={reputation.indicator}
                      reputation={reputation}
                      onReport={handleReport}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Latest Community Reports
                </h3>
                {sampleReputations.map((reputation, index) => (
                  <Card
                    key={index}
                    className="p-4 bg-white shadow-md border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-900 break-all mb-2">
                          {reputation.indicator}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">
                            {reputation.report_types[0].type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {reputation.total_reports} reports from{" "}
                            {reputation.unique_reporters} users
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last reported:{" "}
                          {new Date(
                            reputation.report_types[0].last_seen
                          ).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReport(reputation.indicator)}
                      >
                        🚨 Report
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div>
                <TrendingThreats />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <TrendingThreats />
              <Card className="p-6 bg-white shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🎯</span>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Threat Categories
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { type: "Phishing", count: 1847, percentage: 35 },
                    { type: "Scam", count: 1456, percentage: 28 },
                    { type: "Spam", count: 892, percentage: 17 },
                    { type: "Malware", count: 634, percentage: 12 },
                    { type: "Harassment", count: 423, percentage: 8 },
                  ].map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {category.type}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {category.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contribute" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl border border-indigo-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    Join Our Community
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Help protect millions by reporting threats you encounter.
                    Every report makes the internet safer.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-sm text-gray-700">
                        One-click reporting from any scan result
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-sm text-gray-700">
                        Build community reputation scores
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-sm text-gray-700">
                        Earn contributor badges and recognition
                      </span>
                    </div>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
                    🚀 Start Contributing
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Your Impact
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      47
                    </div>
                    <div className="text-sm text-green-700">
                      Reports Submitted
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      12,890
                    </div>
                    <div className="text-sm text-blue-700">
                      People Protected
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      Gold
                    </div>
                    <div className="text-sm text-purple-700">
                      Contributor Level
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600">🏆</span>
                    <span className="font-semibold text-yellow-800">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Threat Hunter - You've identified 25+ unique threats
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, indicator: "" })}
          indicator={reportModal.indicator}
          onSubmit={handleReportSubmit}
        />
      </div>
    </div>
  );
};

export default CommunityReputationPage;
