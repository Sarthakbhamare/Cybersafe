// Advanced Analytics Engine for Security Score and Insights

import { QUESTION_BANK } from './questionBank';
import { keyFor, ensureScopedMigration } from './userScopedStorage';

// Category weights for security score calculation
const CATEGORY_WEIGHTS = {
  social_media: 15,
  banking: 20,
  upi: 15,
  phishing: 20,
  job_scams: 10,
  shopping: 5,
  bills: 5,
  phone_scams: 10,
  // Others contribute to remaining percentage
};

/**
 * Calculate user's overall security score (0-100)
 */
export const calculateSecurityScore = () => {
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  
  if (quizHistory.length === 0) return 0;
  
  // Base score from overall accuracy
  const totalQuestions = quizHistory.reduce((sum, q) => sum + q.total, 0);
  const correctAnswers = quizHistory.reduce((sum, q) => sum + q.score, 0);
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  // Consistency bonus (more quizzes = better)
  const consistencyBonus = Math.min(quizHistory.length * 0.5, 10);
  
  // Streak bonus
  const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
  const streakBonus = Math.min(currentStreak * 0.5, 10);
  
  // Simulation completion bonus
  const simulationsCompleted = JSON.parse(localStorage.getItem(keyFor('completedSimulations')) || '[]').length;
  const simulationBonus = Math.min(simulationsCompleted * 2, 10);
  
  // Perfect scores bonus
  const perfectScores = parseInt(localStorage.getItem(keyFor('perfectScores')) || '0');
  const perfectBonus = Math.min(perfectScores * 1, 5);
  
  // Calculate final score
  let securityScore = (accuracy * 0.65) + consistencyBonus + streakBonus + simulationBonus + perfectBonus;
  
  return Math.min(Math.round(securityScore), 100);
};

/**
 * Get score tier (Beginner, Intermediate, Advanced, Expert)
 */
export const getSecurityTier = (score) => {
  if (score >= 90) return { tier: 'Expert', color: 'from-purple-500 to-pink-500', emoji: '👑' };
  if (score >= 75) return { tier: 'Advanced', color: 'from-blue-500 to-indigo-500', emoji: '🚀' };
  if (score >= 50) return { tier: 'Intermediate', color: 'from-green-500 to-emerald-500', emoji: '📚' };
  if (score >= 25) return { tier: 'Developing', color: 'from-yellow-500 to-orange-500', emoji: '🌱' };
  return { tier: 'Beginner', color: 'from-gray-400 to-gray-500', emoji: '🎯' };
};

/**
 * Analyze vulnerabilities by category
 */
export const analyzeVulnerabilities = () => {
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  
  // Get all questions attempted
  const attemptedQuestions = [];
  quizHistory.forEach(quiz => {
    // This is a simplified version - in production, you'd store individual question results
    attemptedQuestions.push({
      correct: quiz.score,
      total: quiz.total
    });
  });
  
  // Analyze by category using question bank
  const categoryStats = {};
  
  // Group questions by category from question bank
  QUESTION_BANK.forEach(question => {
    const category = question.category || 'general';
    if (!categoryStats[category]) {
      categoryStats[category] = {
        total: 0,
        correct: 0,
        accuracy: 0,
        isVulnerable: false
      };
    }
    categoryStats[category].total++;
  });
  
  // Calculate accuracy per category (estimated from overall performance)
  const overallAccuracy = quizHistory.length > 0
    ? (quizHistory.reduce((sum, q) => sum + q.score, 0) / quizHistory.reduce((sum, q) => sum + q.total, 0)) * 100
    : 0;
  
  // Assign vulnerability scores
  Object.keys(categoryStats).forEach(category => {
    const variance = (Math.random() * 20) - 10; // Simulate variance
    categoryStats[category].accuracy = Math.max(0, Math.min(100, overallAccuracy + variance));
    categoryStats[category].isVulnerable = categoryStats[category].accuracy < 60;
  });
  
  // Find top 3 vulnerabilities
  const vulnerabilities = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.isVulnerable)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 3)
    .map(([category, stats]) => ({
      category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      accuracy: Math.round(stats.accuracy),
      risk: stats.accuracy < 40 ? 'Critical' : stats.accuracy < 50 ? 'High' : 'Medium',
      recommendation: getRecommendation(category)
    }));
  
  return { categoryStats, vulnerabilities };
};

/**
 * Get recommendation for vulnerable category
 */
const getRecommendation = (category) => {
  const recommendations = {
    social_media: 'Practice identifying fake profiles and phishing DMs',
    banking: 'Learn to verify bank communications and spot fake URLs',
    upi: 'Master UPI scam patterns and QR code safety',
    phishing: 'Complete the Phishing Email Simulator',
    job_scams: 'Study job scam red flags and verification methods',
    shopping: 'Learn to identify fake shopping sites and offers',
    phone_scams: 'Complete the SMS Scam Simulator',
    general: 'Review all threat categories for comprehensive protection'
  };
  return recommendations[category] || 'Practice more quizzes in this category';
};

/**
 * Calculate time spent learning
 */
export const calculateLearningTime = () => {
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const completedSimulations = JSON.parse(localStorage.getItem(keyFor('completedSimulations')) || '[]');
  const threatsRead = parseInt(localStorage.getItem(keyFor('threatsRead')) || '0');
  
  // Estimate time (in minutes)
  const quizTime = quizHistory.length * 3; // ~3 min per quiz
  const simulationTime = completedSimulations.length * 10; // ~10 min per simulation
  const readingTime = threatsRead * 2; // ~2 min per threat card
  
  const totalMinutes = quizTime + simulationTime + readingTime;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    totalMinutes,
    hours,
    minutes,
    breakdown: {
      quizzes: quizTime,
      simulations: simulationTime,
      reading: readingTime
    }
  };
};

/**
 * Get improvement trends over time
 */
export const getImprovementTrends = () => {
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  
  if (quizHistory.length < 2) {
    return {
      trend: 'insufficient_data',
      change: 0,
      data: []
    };
  }
  
  // Group by week
  const weeklyData = {};
  quizHistory.forEach(quiz => {
    const date = new Date(quiz.timestamp || quiz.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        date: weekKey,
        quizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0
      };
    }
    
    weeklyData[weekKey].quizzes++;
    weeklyData[weekKey].totalQuestions += quiz.total;
    weeklyData[weekKey].correctAnswers += quiz.score;
  });
  
  // Calculate accuracy per week
  const trends = Object.values(weeklyData).map(week => {
    week.accuracy = (week.correctAnswers / week.totalQuestions) * 100;
    return week;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate trend direction
  if (trends.length >= 2) {
    const firstWeek = trends[0].accuracy;
    const lastWeek = trends[trends.length - 1].accuracy;
    const change = lastWeek - firstWeek;
    
    return {
      trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      change: Math.round(change),
      data: trends,
      currentAccuracy: Math.round(lastWeek),
      previousAccuracy: Math.round(firstWeek)
    };
  }
  
  return {
    trend: 'insufficient_data',
    change: 0,
    data: trends
  };
};

/**
 * Get peer comparison data (simulated - in production, this would come from backend)
 */
export const getPeerComparison = () => {
  const userScore = calculateSecurityScore();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const userAccuracy = quizHistory.length > 0
    ? (quizHistory.reduce((sum, q) => sum + q.score, 0) / quizHistory.reduce((sum, q) => sum + q.total, 0)) * 100
    : 0;
  
  // Simulated peer data (in production, aggregate from all users anonymously)
  const peerAverage = {
    securityScore: 62, // Average peer score
    accuracy: 68, // Average peer accuracy
    quizzesCompleted: 15,
    streakDays: 4,
    simulationsCompleted: 2
  };
  
  // Calculate percentile (where user stands among peers)
  const percentile = userScore > peerAverage.securityScore
    ? Math.min(50 + ((userScore - peerAverage.securityScore) / (100 - peerAverage.securityScore)) * 50, 99)
    : Math.max(((userScore / peerAverage.securityScore)) * 50, 1);
  
  return {
    user: {
      securityScore: userScore,
      accuracy: Math.round(userAccuracy),
      quizzesCompleted: quizHistory.length,
      streakDays: parseInt(localStorage.getItem(keyFor('currentStreak')) || '0'),
      simulationsCompleted: JSON.parse(localStorage.getItem(keyFor('completedSimulations')) || '[]').length
    },
    peer: peerAverage,
    percentile: Math.round(percentile),
    comparison: {
      score: userScore - peerAverage.securityScore,
      accuracy: Math.round(userAccuracy) - peerAverage.accuracy,
      quizzes: quizHistory.length - peerAverage.quizzesCompleted,
      streak: parseInt(localStorage.getItem(keyFor('currentStreak')) || '0') - peerAverage.streakDays,
      simulations: JSON.parse(localStorage.getItem(keyFor('completedSimulations')) || '[]').length - peerAverage.simulationsCompleted
    }
  };
};

/**
 * Get category mastery breakdown
 */
export const getCategoryMastery = () => {
  const categories = [
    { name: 'Social Media', key: 'social_media', icon: '📱' },
    { name: 'Banking', key: 'banking', icon: '🏦' },
    { name: 'UPI Payments', key: 'upi', icon: '💳' },
    { name: 'Phishing', key: 'phishing', icon: '🎣' },
    { name: 'Job Scams', key: 'job_scams', icon: '💼' },
    { name: 'Shopping', key: 'shopping', icon: '🛒' },
    { name: 'Phone/SMS', key: 'phone_scams', icon: '📱' }
  ];
  
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const overallAccuracy = quizHistory.length > 0
    ? (quizHistory.reduce((sum, q) => sum + q.score, 0) / quizHistory.reduce((sum, q) => sum + q.total, 0)) * 100
    : 0;
  
  // Simulate category-specific mastery (in production, track per-question results)
  return categories.map(category => {
    const variance = (Math.random() * 30) - 15;
    const mastery = Math.max(0, Math.min(100, overallAccuracy + variance));
    
    return {
      ...category,
      mastery: Math.round(mastery),
      status: mastery >= 80 ? 'Master' : mastery >= 60 ? 'Proficient' : mastery >= 40 ? 'Learning' : 'Beginner',
      color: mastery >= 80 ? 'bg-green-500' : mastery >= 60 ? 'bg-blue-500' : mastery >= 40 ? 'bg-yellow-500' : 'bg-red-500'
    };
  });
};

/**
 * Get comprehensive analytics summary
 */
export const getAnalyticsSummary = () => {
  const securityScore = calculateSecurityScore();
  const tier = getSecurityTier(securityScore);
  const vulnerabilities = analyzeVulnerabilities();
  const learningTime = calculateLearningTime();
  const trends = getImprovementTrends();
  const peerComparison = getPeerComparison();
  const categoryMastery = getCategoryMastery();
  
  return {
    securityScore,
    tier,
    vulnerabilities: vulnerabilities.vulnerabilities,
    categoryStats: vulnerabilities.categoryStats,
    learningTime,
    trends,
    peerComparison,
    categoryMastery
  };
};

/**
 * Get weekly activity data for heatmap
 */
export const getWeeklyActivity = () => {
  ensureScopedMigration();
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const last12Weeks = [];
  const now = new Date();
  
  // Generate last 12 weeks
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekQuizzes = quizHistory.filter(quiz => {
      const quizDate = new Date(quiz.timestamp || quiz.date);
      return quizDate >= weekStart && quizDate <= weekEnd;
    });
    
    last12Weeks.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quizzes: weekQuizzes.length,
      intensity: weekQuizzes.length === 0 ? 0 : weekQuizzes.length < 3 ? 1 : weekQuizzes.length < 7 ? 2 : 3
    });
  }
  
  return last12Weeks;
};
