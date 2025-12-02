import React, { useState, useEffect } from "react";
import { getGamificationStats, getCurrentLevel, getLevelProgress, ACHIEVEMENTS } from "../utils/gamification";
import { getUserStats } from "../utils/quizUtils";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    destructive: "bg-red-100 text-red-800 border-red-200",
    default: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ProfilePage = () => {
  const [stats, setStats] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const gamificationStats = getGamificationStats();
    const userQuizStats = getUserStats();
    setStats(gamificationStats);
    setQuizStats(userQuizStats);
  }, []);

  if (!stats || !quizStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const { currentLevel, nextLevel, progress, totalXP, xpToNextLevel, achievements, achievementCount, totalAchievements } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Hero Section with Level Info */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-5xl border-4 border-white/30">
                    {currentLevel.badge}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Cyber Guardian</h2>
                  <Badge className="bg-white/20 text-white border-white/30">{currentLevel.name}</Badge>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {currentLevel.level}</span>
                      {nextLevel && <span>Level {nextLevel.level}</span>}
                    </div>
                    <div className="bg-white/20 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${currentLevel.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/80 text-center">
                      {totalXP.toLocaleString()} XP
                      {nextLevel && ` • ${xpToNextLevel.toLocaleString()} XP to next level`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{stats.stats.currentStreak}</div>
                      <div className="text-xs text-white/80">🔥 Day Streak</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{achievementCount}/{totalAchievements}</div>
                      <div className="text-xs text-white/80">🏆 Achievements</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-3xl font-bold mb-1">{stats.stats.totalQuizzes}</div>
                <div className="text-sm text-white/80">Quizzes Completed</div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold mb-1">{stats.stats.accuracy}%</div>
                <div className="text-sm text-white/80">Success Rate</div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold mb-1">{stats.stats.correctAnswers}</div>
                <div className="text-sm text-white/80">Correct Answers</div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-3xl font-bold mb-1">{quizStats.speedChallenges || 0}</div>
                <div className="text-sm text-white/80">Speed Challenges</div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">🛡️</div>
                <div className="text-3xl font-bold mb-1">{quizStats.survivalBest || 0}</div>
                <div className="text-sm text-white/80">Best Survival Run</div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
                <div className="text-4xl mb-2">💯</div>
                <div className="text-3xl font-bold mb-1">{quizStats.perfectScores || 0}</div>
                <div className="text-sm text-white/80">Perfect Scores</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'analytics', 'achievements', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === tab
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'analytics' && '📈 Analytics'}
              {tab === 'achievements' && '🏆 Achievements'}
              {tab === 'history' && '� History'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span>
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                {quizStats.recentQuizzes && quizStats.recentQuizzes.length > 0 ? (
                  quizStats.recentQuizzes.slice(0, 5).map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {quiz.mode === 'daily' && '📅'}
                          {quiz.mode === 'practice' && '🎯'}
                          {quiz.mode === 'speed' && '⚡'}
                          {quiz.mode === 'survival' && '🛡️'}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{quiz.mode} Challenge</div>
                          <div className="text-xs text-gray-600">{new Date(quiz.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">{quiz.score}/{quiz.total}</div>
                        <div className="text-xs text-gray-600">{Math.round((quiz.score / quiz.total) * 100)}%</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No quiz history yet. Start your first challenge!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Level Progress Details */}
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎖️</span>
                <span>Level Progress</span>
              </h3>
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-6xl mb-3">{currentLevel.badge}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{currentLevel.name}</div>
                  <Badge variant="secondary">Level {currentLevel.level}</Badge>
                </div>

                {nextLevel && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Next: {nextLevel.name}</span>
                      <span className="text-4xl">{nextLevel.badge}</span>
                    </div>
                    <div className="bg-white rounded-full h-4 mb-2">
                      <div
                        className={`h-4 rounded-full bg-gradient-to-r ${nextLevel.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      {xpToNextLevel.toLocaleString()} XP needed • {progress}% complete
                    </div>
                  </div>
                )}

                {/* XP Sources */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Earn XP By:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Daily Quiz</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">+50 XP</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Speed Challenge</span>
                      <Badge variant="default" className="bg-orange-100 text-orange-800">+60 XP</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Survival Mode</span>
                      <Badge variant="default" className="bg-red-100 text-red-800">+70 XP</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interactive Simulation</span>
                      <Badge variant="default" className="bg-purple-100 text-purple-800">+75 XP</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Perfect Score</span>
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">+100 XP</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && <AnalyticsDashboard />}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div>
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Achievement Progress</h3>
                  <p className="text-sm text-gray-600">Unlock all {totalAchievements} achievements to become a legend!</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">{achievementCount}/{totalAchievements}</div>
                  <div className="text-xs text-gray-600">{Math.round((achievementCount / totalAchievements) * 100)}% Complete</div>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(achievementCount / totalAchievements) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(ACHIEVEMENTS).map((achievement) => {
                const earned = achievements.some(a => a.id === achievement.id);
                return (
                  <Card
                    key={achievement.id}
                    className={`p-5 transition-all duration-300 ${
                      earned
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                        : 'bg-white opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-5xl ${earned ? 'animate-bounce' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                          {earned && <span className="text-green-600 text-xl">✓</span>}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={earned ? "default" : "secondary"} className={earned ? "bg-yellow-100 text-yellow-800" : ""}>
                            +{achievement.xpReward} XP
                          </Badge>
                          {earned && (
                            <span className="text-xs text-gray-500">
                              {new Date(achievements.find(a => a.id === achievement.id)?.earnedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📈</span>
              <span>Quiz History</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mode</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">XP Gained</th>
                  </tr>
                </thead>
                <tbody>
                  {quizStats.recentQuizzes && quizStats.recentQuizzes.length > 0 ? (
                    quizStats.recentQuizzes.map((quiz, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(quiz.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {quiz.mode === 'daily' && '📅'}
                            {quiz.mode === 'practice' && '🎯'}
                            {quiz.mode === 'speed' && '⚡'}
                            {quiz.mode === 'survival' && '🛡️'}
                            {' '}{quiz.mode}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900">
                          {quiz.score}/{quiz.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-semibold ${
                            (quiz.score / quiz.total) >= 0.8 ? 'text-green-600' :
                            (quiz.score / quiz.total) >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {Math.round((quiz.score / quiz.total) * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="default" className="bg-indigo-100 text-indigo-800">
                            +{quiz.xpGained || 40} XP
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>No quiz history yet. Start playing to see your progress!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
