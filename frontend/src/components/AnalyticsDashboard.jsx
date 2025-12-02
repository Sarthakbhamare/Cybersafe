import React, { useState, useEffect } from "react";
import { 
  calculateSecurityScore, 
  getSecurityTier, 
  analyzeVulnerabilities, 
  calculateLearningTime,
  getImprovementTrends,
  getPeerComparison,
  getCategoryMastery,
  getWeeklyActivity
} from "../utils/analytics";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    destructive: "bg-red-100 text-red-800 border-red-200",
    default: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const securityScore = calculateSecurityScore();
    const tier = getSecurityTier(securityScore);
    const { vulnerabilities } = analyzeVulnerabilities();
    const learningTime = calculateLearningTime();
    const trends = getImprovementTrends();
    const peerComparison = getPeerComparison();
    const categoryMastery = getCategoryMastery();
    const weeklyActivity = getWeeklyActivity();

    setAnalytics({
      securityScore,
      tier,
      vulnerabilities,
      learningTime,
      trends,
      peerComparison,
      categoryMastery,
      weeklyActivity
    });
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { securityScore, tier, vulnerabilities, learningTime, trends, peerComparison, categoryMastery, weeklyActivity } = analytics;

  return (
    <div className="space-y-6">
      {/* Security Score Hero */}
      <Card className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
        <div className="text-center">
          <div className="text-6xl mb-4">{tier.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Score</h2>
          
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(securityScore / 100) * 553} 553`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={securityScore >= 75 ? "#8b5cf6" : securityScore >= 50 ? "#3b82f6" : "#f59e0b"} />
                  <stop offset="100%" stopColor={securityScore >= 75 ? "#ec4899" : securityScore >= 50 ? "#6366f1" : "#ef4444"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900">{securityScore}</div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
          </div>

          <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${tier.color} text-white font-bold text-lg mb-4`}>
            {tier.tier} Level
          </div>
          
          <p className="text-gray-700 max-w-md mx-auto">
            {securityScore >= 90 && "Outstanding! You're a cybersecurity expert. Keep up the excellent work!"}
            {securityScore >= 75 && securityScore < 90 && "Great job! You have strong cybersecurity awareness. A few more areas to master."}
            {securityScore >= 50 && securityScore < 75 && "Good progress! You're building solid security knowledge. Keep practicing!"}
            {securityScore >= 25 && securityScore < 50 && "You're on the right track. Focus on your vulnerable areas to improve quickly."}
            {securityScore < 25 && "Great that you've started! Complete more quizzes and simulations to boost your score."}
          </p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vulnerabilities Map */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>⚠️</span>
              <span>Your Vulnerabilities</span>
            </h3>
            {vulnerabilities.length === 0 && (
              <Badge variant="success">No Major Vulnerabilities</Badge>
            )}
          </div>

          {vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              {vulnerabilities.map((vuln, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-900">{vuln.category}</div>
                    <Badge variant="destructive">{vuln.risk} Risk</Badge>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Accuracy</span>
                      <span className="font-semibold">{vuln.accuracy}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${vuln.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <span>{vuln.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p>Excellent! No critical vulnerabilities detected.</p>
              <p className="text-sm mt-1">Keep practicing to maintain your strong defense.</p>
            </div>
          )}
        </Card>

        {/* Learning Time */}
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏱️</span>
            <span>Time Invested</span>
          </h3>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {learningTime.hours}h {learningTime.minutes}m
            </div>
            <div className="text-sm text-gray-600">Total Learning Time</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span className="text-sm font-medium text-gray-700">Quizzes</span>
              </div>
              <span className="font-bold text-indigo-600">{learningTime.breakdown.quizzes} min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <span className="text-sm font-medium text-gray-700">Simulations</span>
              </div>
              <span className="font-bold text-purple-600">{learningTime.breakdown.simulations} min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-sm font-medium text-gray-700">Reading</span>
              </div>
              <span className="font-bold text-green-600">{learningTime.breakdown.reading} min</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Improvement Trends */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📈</span>
          <span>Your Progress</span>
        </h3>

        {trends.trend !== 'insufficient_data' ? (
          <div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{trends.currentAccuracy}%</div>
                <div className="text-sm text-gray-600">Current Accuracy</div>
              </div>
              <div className="text-4xl">
                {trends.trend === 'improving' && '📈'}
                {trends.trend === 'stable' && '➡️'}
                {trends.trend === 'declining' && '📉'}
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${trends.change > 0 ? 'text-green-600' : trends.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {trends.change > 0 ? '+' : ''}{trends.change}%
                </div>
                <div className="text-sm text-gray-600">Change</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-4">
              <div className="font-semibold text-gray-900 mb-1">
                {trends.trend === 'improving' && '🎉 You\'re Improving!'}
                {trends.trend === 'stable' && '✅ Consistent Performance'}
                {trends.trend === 'declining' && '⚠️ Needs Attention'}
              </div>
              <div className="text-sm text-gray-700">
                {trends.trend === 'improving' && `Your accuracy has increased by ${trends.change}% over the recent weeks. Excellent progress!`}
                {trends.trend === 'stable' && 'Your performance is consistent. Try challenging yourself with harder questions to improve further.'}
                {trends.trend === 'declining' && `Your accuracy has dropped by ${Math.abs(trends.change)}%. Review your weak areas and practice more.`}
              </div>
            </div>

            {/* Weekly Trend Chart */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Weekly Performance</div>
              {trends.data.map((week, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 w-20">{week.date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 ${
                        week.accuracy >= 80 ? 'bg-green-500' : week.accuracy >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${week.accuracy}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">
                      {Math.round(week.accuracy)}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 w-16">{week.quizzes} quiz{week.quizzes !== 1 ? 'zes' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Complete more quizzes to see your progress trends.</p>
            <p className="text-sm mt-1">We need at least 2 weeks of data to show improvement patterns.</p>
          </div>
        )}
      </Card>

      {/* Peer Comparison */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>👥</span>
          <span>Peer Comparison</span>
        </h3>

        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-indigo-600 mb-2">
            Top {peerComparison.percentile}%
          </div>
          <div className="text-sm text-gray-600">You're performing better than {peerComparison.percentile}% of peers</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-200">
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">👤</div>
              <div className="font-bold text-gray-900">You</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Security Score</span>
                <span className="font-bold text-indigo-600">{peerComparison.user.securityScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-bold text-indigo-600">{peerComparison.user.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes</span>
                <span className="font-bold text-indigo-600">{peerComparison.user.quizzesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak</span>
                <span className="font-bold text-indigo-600">{peerComparison.user.streakDays} days</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border-2 border-gray-200">
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-bold text-gray-900">Peer Average</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Security Score</span>
                <span className="font-bold text-gray-700">{peerComparison.peer.securityScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-bold text-gray-700">{peerComparison.peer.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes</span>
                <span className="font-bold text-gray-700">{peerComparison.peer.quizzesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak</span>
                <span className="font-bold text-gray-700">{peerComparison.peer.streakDays} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> Peer data is anonymously aggregated from all CyberSafe users to protect privacy.
          </div>
        </div>
      </Card>

      {/* Category Mastery */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎯</span>
          <span>Category Mastery</span>
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryMastery.map((category, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{category.name}</div>
                    <Badge variant="secondary" className={`${category.color} text-white border-0 mt-1`}>
                      {category.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Mastery</span>
                  <span className="font-bold">{category.mastery}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${category.color}`}
                    style={{ width: `${category.mastery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Heatmap */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span>
          <span>Activity Heatmap</span>
        </h3>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {weeklyActivity.map((week, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-12 h-12 rounded-lg transition-all duration-300 ${
                    week.intensity === 0 ? 'bg-gray-100' :
                    week.intensity === 1 ? 'bg-green-200' :
                    week.intensity === 2 ? 'bg-green-400' :
                    'bg-green-600'
                  }`}
                  title={`${week.week}: ${week.quizzes} quizzes`}
                />
                <div className="text-xs text-gray-600 mt-1">{week.week.split(' ')[0]}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-4">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <div className="w-4 h-4 rounded bg-green-200" />
              <div className="w-4 h-4 rounded bg-green-400" />
              <div className="w-4 h-4 rounded bg-green-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
