// Enhanced Quiz Settings and Utilities
import { addXP, XP_REWARDS, checkAndAwardAchievements } from './gamification';
import { keyFor, ensureScopedMigration } from './userScopedStorage';

export const QUIZ_MODES = {
  DAILY: {
    id: 'daily',
    label: 'Daily Challenge',
    icon: '📅',
    description: '5 questions - New every 24 hours',
    questionCount: 5,
    timeLimit: null, // No time limit
    lives: null, // No lives system
  },
  PRACTICE: {
    id: 'practice',
    label: 'Practice Mode',
    icon: '🎯',
    description: '10 random questions',
    questionCount: 10,
    timeLimit: null,
    lives: null,
  },
  SPEED: {
    id: 'speed',
    label: 'Speed Challenge',
    icon: '⚡',
    description: '10 questions - 30 seconds each',
    questionCount: 10,
    timeLimit: 30, // seconds per question
    lives: null,
  },
  SURVIVAL: {
    id: 'survival',
    label: 'Survival Mode',
    icon: '❤️',
    description: '3 lives - Answer till you lose all',
    questionCount: 999, // Unlimited until lives run out
    timeLimit: null,
    lives: 3,
  },
};

export const BADGES = {
  FIRST_QUIZ: {
    id: 'first_quiz',
    name: 'First Steps',
    icon: '🎯',
    description: 'Complete your first quiz',
    requirement: { type: 'quizzes_completed', value: 1 }
  },
  STREAK_7: {
    id: 'streak_7',
    name: '7 Day Warrior',
    icon: '🔥',
    description: 'Maintain a 7-day streak',
    requirement: { type: 'streak', value: 7 }
  },
  STREAK_30: {
    id: 'streak_30',
    name: '30 Day Legend',
    icon: '👑',
    description: 'Maintain a 30-day streak',
    requirement: { type: 'streak', value: 30 }
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    icon: '💯',
    description: 'Get 100% in any quiz',
    requirement: { type: 'perfect_score', value: 1 }
  },
  SPEED_MASTER: {
    id: 'speed_master',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Complete Speed Challenge with 80%+',
    requirement: { type: 'speed_challenge', value: 80 }
  },
  SURVIVAL_10: {
    id: 'survival_10',
    name: 'Survivor',
    icon: '🛡️',
    description: 'Answer 10 questions in Survival Mode',
    requirement: { type: 'survival_questions', value: 10 }
  },
  CATEGORY_MASTER_PHISHING: {
    id: 'master_phishing',
    name: 'Phishing Expert',
    icon: '🎣',
    description: 'Complete all Phishing category quizzes',
    requirement: { type: 'category_complete', value: 'phishing' }
  },
  QUIZ_MARATHON: {
    id: 'quiz_marathon',
    name: 'Quiz Marathon',
    icon: '🏃',
    description: 'Complete 50 quizzes',
    requirement: { type: 'quizzes_completed', value: 50 }
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Complete daily challenge 10 days in a row',
    requirement: { type: 'daily_streak', value: 10 }
  },
  SHARPSHOOTER: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    icon: '🎯',
    description: 'Maintain 90%+ average accuracy',
    requirement: { type: 'accuracy', value: 90 }
  },
};

// Check if user earned a badge
export const checkBadgeEarned = (badgeId, userStats) => {
  const badge = BADGES[badgeId];
  if (!badge) return false;

  const { type, value } = badge.requirement;

  switch (type) {
    case 'quizzes_completed':
      return userStats.totalQuizzes >= value;
    case 'streak':
      return userStats.currentStreak >= value;
    case 'perfect_score':
      return userStats.perfectScores >= value;
    case 'speed_challenge':
      const speedQuiz = userStats.quizHistory?.find(q => q.mode === 'speed');
      return speedQuiz && (speedQuiz.score / speedQuiz.total) * 100 >= value;
    case 'survival_questions':
      return userStats.survivalBest >= value;
    case 'daily_streak':
      return userStats.dailyStreak >= value;
    case 'accuracy':
      return userStats.averageAccuracy >= value;
    default:
      return false;
  }
};

// Get all earned badges
export const getEarnedBadges = (userStats) => {
  return Object.values(BADGES).filter(badge => 
    checkBadgeEarned(badge.id, userStats)
  );
};

// Calculate speed bonus (extra points for fast correct answers)
export const calculateSpeedBonus = (timeRemaining, timeLimit) => {
  if (!timeLimit || timeRemaining <= 0) return 0;
  
  const percentTimeLeft = (timeRemaining / timeLimit) * 100;
  
  if (percentTimeLeft > 80) return 50; // Answered in first 20%
  if (percentTimeLeft > 60) return 30; // Answered in 40%
  if (percentTimeLeft > 40) return 20; // Answered in 60%
  if (percentTimeLeft > 20) return 10; // Answered in 80%
  return 0;
};

// Get user statistics
export const getUserStats = () => {
  ensureScopedMigration();
  const history = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
  const badges = JSON.parse(localStorage.getItem(keyFor('earnedBadges')) || '[]');
  
  const totalQuizzes = history.length;
  const totalQuestions = history.reduce((sum, quiz) => sum + quiz.total, 0);
  const correctAnswers = history.reduce((sum, quiz) => sum + quiz.score, 0);
  const averageAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const perfectScores = history.filter(quiz => quiz.score === quiz.total).length;
  
  const survivalHistory = history.filter(q => q.mode === 'survival');
  const survivalBest = survivalHistory.length > 0 
    ? Math.max(...survivalHistory.map(q => q.total))
    : 0;
  
  const dailyHistory = history.filter(q => q.mode === 'daily');
  const dailyStreak = calculateConsecutiveDays(dailyHistory.map(q => q.date));
  
  return {
    totalQuizzes,
    totalQuestions,
    correctAnswers,
    averageAccuracy: Math.round(averageAccuracy),
    currentStreak,
    perfectScores,
    survivalBest,
    dailyStreak,
    earnedBadges: badges,
    quizHistory: history,
  };
};

// Calculate consecutive days from date array
const calculateConsecutiveDays = (dates) => {
  if (dates.length === 0) return 0;
  
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Save quiz result
export const saveQuizResult = (result) => {
  const { mode, score, total, timeBonus = 0, lives = null } = result;
  const today = new Date().toDateString();
  
  // Calculate XP based on mode and performance
  let xpGained = 0;
  if (mode === 'daily') xpGained += XP_REWARDS.QUIZ_DAILY_COMPLETE;
  else if (mode === 'practice') xpGained += XP_REWARDS.QUIZ_PRACTICE_COMPLETE;
  else if (mode === 'speed') xpGained += XP_REWARDS.QUIZ_SPEED_COMPLETE;
  else if (mode === 'survival') xpGained += XP_REWARDS.QUIZ_SURVIVAL_COMPLETE;
  
  // Add XP for correct answers
  xpGained += score * XP_REWARDS.CORRECT_ANSWER;
  
  // Add time bonus XP
  if (timeBonus > 0) {
    xpGained += XP_REWARDS.SPEED_BONUS;
  }
  
  // Perfect score bonus
  if (score === total && total > 0) {
    xpGained += XP_REWARDS.QUIZ_PERFECT_SCORE;
  }
  
  // Award XP
  const xpResult = addXP(xpGained, `${mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz: ${score}/${total}`);
  
  ensureScopedMigration();
  const history = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  history.push({
    date: today,
    mode,
    score,
    total,
    timeBonus,
    lives,
    xpGained,
    timestamp: Date.now(),
  });
  localStorage.setItem(keyFor('quizHistory'), JSON.stringify(history));
  
  // Track time-based achievements
  const hour = new Date().getHours();
  if (hour < 9) {
    const earlyCount = parseInt(localStorage.getItem(keyFor('earlyMorningQuizzes')) || '0') + 1;
    localStorage.setItem(keyFor('earlyMorningQuizzes'), earlyCount.toString());
  } else if (hour >= 22) {
    const nightCount = parseInt(localStorage.getItem(keyFor('lateNightQuizzes')) || '0') + 1;
    localStorage.setItem(keyFor('lateNightQuizzes'), nightCount.toString());
  }
  
  // Track mode-specific stats
  if (mode === 'speed') {
    const speedCount = parseInt(localStorage.getItem(keyFor('speedQuizzes')) || '0') + 1;
    localStorage.setItem(keyFor('speedQuizzes'), speedCount.toString());
  }
  
  if (mode === 'survival' && lives !== null) {
    const survivalQuestions = parseInt(localStorage.getItem(keyFor('survivalQuestions')) || '0') + total;
    localStorage.setItem(keyFor('survivalQuestions'), survivalQuestions.toString());
  }
  
  if (score === total && total > 0) {
    const perfectScores = parseInt(localStorage.getItem(keyFor('perfectScores')) || '0') + 1;
    localStorage.setItem(keyFor('perfectScores'), perfectScores.toString());
  }
  
  // Check for new badges
  const stats = getUserStats();
  const newBadges = [];
  
  Object.keys(BADGES).forEach(badgeId => {
    const existingBadges = JSON.parse(localStorage.getItem(keyFor('earnedBadges')) || '[]');
    if (!existingBadges.includes(badgeId) && checkBadgeEarned(badgeId, stats)) {
      existingBadges.push(badgeId);
      newBadges.push(BADGES[badgeId]);
    }
    localStorage.setItem(keyFor('earnedBadges'), JSON.stringify(existingBadges));
  });
  
  // Check for gamification achievements
  const newAchievements = checkAndAwardAchievements({
    totalQuizzes: stats.totalQuizzes,
    correctAnswers: stats.correctAnswers,
    accuracy: stats.averageAccuracy,
    currentStreak: stats.currentStreak,
    perfectScores: parseInt(localStorage.getItem(keyFor('perfectScores')) || '0'),
    speedQuizzes: parseInt(localStorage.getItem(keyFor('speedQuizzes')) || '0'),
    survivalQuestions: parseInt(localStorage.getItem(keyFor('survivalQuestions')) || '0')
  });
  
  return { newBadges, newAchievements, xpGained: xpResult.xpGained, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel };
};

// Leaderboard management
export const updateLeaderboard = (username, score, mode) => {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
  
  if (!leaderboard[mode]) {
    leaderboard[mode] = [];
  }
  
  const existingEntry = leaderboard[mode].find(entry => entry.username === username);
  
  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.score = score;
      existingEntry.date = new Date().toISOString();
    }
  } else {
    leaderboard[mode].push({
      username,
      score,
      date: new Date().toISOString(),
    });
  }
  
  // Sort and keep top 10
  leaderboard[mode].sort((a, b) => b.score - a.score);
  leaderboard[mode] = leaderboard[mode].slice(0, 10);
  
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  
  return leaderboard[mode];
};

export const getLeaderboard = (mode = 'all') => {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
  
  if (mode === 'all') {
    // Combine all modes and rank by total score
    const combined = {};
    Object.values(leaderboard).forEach(modeEntries => {
      modeEntries.forEach(entry => {
        if (!combined[entry.username]) {
          combined[entry.username] = { username: entry.username, score: 0, date: entry.date };
        }
        combined[entry.username].score += entry.score;
      });
    });
    
    return Object.values(combined).sort((a, b) => b.score - a.score).slice(0, 10);
  }
  
  return leaderboard[mode] || [];
};
