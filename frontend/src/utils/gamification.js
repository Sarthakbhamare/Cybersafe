// Gamification System - XP, Levels, Achievements (User-scoped storage)
import { keyFor, ensureScopedMigration } from './userScopedStorage';

// XP Points Configuration
export const XP_REWARDS = {
  // Quiz Actions
  QUIZ_DAILY_COMPLETE: 50,
  QUIZ_PRACTICE_COMPLETE: 40,
  QUIZ_SPEED_COMPLETE: 60,
  QUIZ_SURVIVAL_COMPLETE: 70,
  QUIZ_PERFECT_SCORE: 100,
  CORRECT_ANSWER: 10,
  SPEED_BONUS: 20,
  
  // Learning Actions
  READ_THREAT_CARD: 10,
  COMPLETE_SIMULATION: 75,
  SPOT_ALL_RED_FLAGS: 50,
  
  // Social Actions
  SHARE_ACHIEVEMENT: 25,
  INVITE_FRIEND: 50,
  
  // Daily Actions
  DAILY_LOGIN: 10,
  FIRST_LOGIN_OF_DAY: 20,
  CONSECUTIVE_7_DAYS: 100,
  CONSECUTIVE_30_DAYS: 500,
};

// Level System Configuration
export const LEVELS = [
  { level: 1, name: 'Beginner', minXP: 0, maxXP: 99, color: 'from-gray-400 to-gray-500', badge: '🌱' },
  { level: 2, name: 'Learner', minXP: 100, maxXP: 299, color: 'from-blue-400 to-blue-500', badge: '📚' },
  { level: 3, name: 'Aware', minXP: 300, maxXP: 599, color: 'from-green-400 to-green-500', badge: '👀' },
  { level: 4, name: 'Skilled', minXP: 600, maxXP: 999, color: 'from-yellow-400 to-yellow-500', badge: '⚡' },
  { level: 5, name: 'Intermediate', minXP: 1000, maxXP: 1999, color: 'from-orange-400 to-orange-500', badge: '🎯' },
  { level: 6, name: 'Advanced', minXP: 2000, maxXP: 3499, color: 'from-purple-400 to-purple-500', badge: '🚀' },
  { level: 7, name: 'Expert', minXP: 3500, maxXP: 5499, color: 'from-pink-400 to-pink-500', badge: '💎' },
  { level: 8, name: 'Master', minXP: 5500, maxXP: 7999, color: 'from-red-400 to-red-500', badge: '👑' },
  { level: 9, name: 'Guardian', minXP: 8000, maxXP: 11999, color: 'from-indigo-400 to-indigo-500', badge: '🛡️' },
  { level: 10, name: 'Legend', minXP: 12000, maxXP: Infinity, color: 'from-yellow-300 via-orange-400 to-red-500', badge: '🏆' },
];

// Achievement Badges
export const ACHIEVEMENTS = {
  // Quiz Achievements
  FIRST_QUIZ: {
    id: 'first_quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    xpReward: 50,
    requirement: { type: 'quizzes_completed', value: 1 }
  },
  QUIZ_10: {
    id: 'quiz_10',
    name: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    icon: '📝',
    xpReward: 100,
    requirement: { type: 'quizzes_completed', value: 10 }
  },
  QUIZ_50: {
    id: 'quiz_50',
    name: 'Quiz Master',
    description: 'Complete 50 quizzes',
    icon: '🏅',
    xpReward: 500,
    requirement: { type: 'quizzes_completed', value: 50 }
  },
  QUIZ_100: {
    id: 'quiz_100',
    name: 'Century Club',
    description: 'Complete 100 quizzes',
    icon: '💯',
    xpReward: 1000,
    requirement: { type: 'quizzes_completed', value: 100 }
  },
  
  // Accuracy Achievements
  CORRECT_10: {
    id: 'correct_10',
    name: 'Sharp Mind',
    description: 'Answer 10 questions correctly',
    icon: '🎓',
    xpReward: 75,
    requirement: { type: 'correct_answers', value: 10 }
  },
  CORRECT_50: {
    id: 'correct_50',
    name: 'Knowledge Seeker',
    description: 'Answer 50 questions correctly',
    icon: '📖',
    xpReward: 200,
    requirement: { type: 'correct_answers', value: 50 }
  },
  CORRECT_100: {
    id: 'correct_100',
    name: 'Cyber Expert',
    description: 'Answer 100 questions correctly',
    icon: '🧠',
    xpReward: 500,
    requirement: { type: 'correct_answers', value: 100 }
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get 100% in any quiz',
    icon: '💯',
    xpReward: 150,
    requirement: { type: 'perfect_score', value: 1 }
  },
  PERFECT_5: {
    id: 'perfect_5',
    name: 'Flawless',
    description: 'Get 5 perfect scores',
    icon: '✨',
    xpReward: 500,
    requirement: { type: 'perfect_score', value: 5 }
  },
  
  // Streak Achievements
  STREAK_3: {
    id: 'streak_3',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xpReward: 50,
    requirement: { type: 'streak', value: 3 }
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '📅',
    xpReward: 150,
    requirement: { type: 'streak', value: 7 }
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 1000,
    requirement: { type: 'streak', value: 30 }
  },
  
  // Speed Achievements
  SPEED_MASTER: {
    id: 'speed_master',
    name: 'Speed Demon',
    description: 'Complete a speed quiz with 80%+ time remaining',
    icon: '⚡',
    xpReward: 200,
    requirement: { type: 'speed_bonus', value: 80 }
  },
  SPEED_10: {
    id: 'speed_10',
    name: 'Lightning Fast',
    description: 'Complete 10 speed challenges',
    icon: '🏃',
    xpReward: 300,
    requirement: { type: 'speed_quizzes', value: 10 }
  },
  
  // Survival Achievements
  SURVIVAL_10: {
    id: 'survival_10',
    name: 'Survivor',
    description: 'Answer 10 questions in survival mode',
    icon: '🛡️',
    xpReward: 150,
    requirement: { type: 'survival_questions', value: 10 }
  },
  SURVIVAL_25: {
    id: 'survival_25',
    name: 'Unstoppable',
    description: 'Answer 25 questions in survival mode',
    icon: '💪',
    xpReward: 400,
    requirement: { type: 'survival_questions', value: 25 }
  },
  
  // Time-based Achievements
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 quizzes before 9 AM',
    icon: '🌅',
    xpReward: 200,
    requirement: { type: 'early_morning_quizzes', value: 10 }
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 quizzes after 10 PM',
    icon: '🦉',
    xpReward: 200,
    requirement: { type: 'late_night_quizzes', value: 10 }
  },
  
  // Learning Achievements
  THREAT_READER: {
    id: 'threat_reader',
    name: 'Knowledge Hunter',
    description: 'Read 20 threat cards',
    icon: '📚',
    xpReward: 100,
    requirement: { type: 'threats_read', value: 20 }
  },
  SIMULATION_MASTER: {
    id: 'simulation_master',
    name: 'Simulation Expert',
    description: 'Complete 10 interactive simulations',
    icon: '🎮',
    xpReward: 500,
    requirement: { type: 'simulations_completed', value: 10 }
  },
  
  // Social Achievements
  SOCIAL_SHARER: {
    id: 'social_sharer',
    name: 'Social Guardian',
    description: 'Share your achievements 5 times',
    icon: '📢',
    xpReward: 150,
    requirement: { type: 'shares', value: 5 }
  },
  
  // Accuracy Rate Achievements
  SHARPSHOOTER: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Maintain 90%+ accuracy over 20 quizzes',
    icon: '🎯',
    xpReward: 500,
    requirement: { type: 'accuracy_rate', value: 90 }
  },
  
  // Category Mastery
  CATEGORY_MASTER: {
    id: 'category_master',
    name: 'Category Master',
    description: 'Get 100% in all quiz categories',
    icon: '🌟',
    xpReward: 750,
    requirement: { type: 'category_mastery', value: 1 }
  },
};

// Daily Login Rewards
export const DAILY_REWARDS = [
  { day: 1, xp: 10, bonus: null },
  { day: 2, xp: 15, bonus: null },
  { day: 3, xp: 20, bonus: '🎁 +3 Day Streak' },
  { day: 4, xp: 25, bonus: null },
  { day: 5, xp: 30, bonus: null },
  { day: 6, xp: 40, bonus: null },
  { day: 7, xp: 100, bonus: '🏆 Week Complete! +100 XP Bonus' },
];

/**
 * Get user's current level info based on total XP
 */
export const getCurrentLevel = (totalXP) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

/**
 * Get next level info
 */
export const getNextLevel = (totalXP) => {
  const currentLevel = getCurrentLevel(totalXP);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;
};

/**
 * Calculate progress to next level (0-100)
 */
export const getLevelProgress = (totalXP) => {
  const currentLevel = getCurrentLevel(totalXP);
  const nextLevel = getNextLevel(totalXP);
  
  if (!nextLevel) return 100; // Max level reached
  
  const currentLevelXP = totalXP - currentLevel.minXP;
  const xpNeededForNextLevel = nextLevel.minXP - currentLevel.minXP;
  
  return Math.round((currentLevelXP / xpNeededForNextLevel) * 100);
};

/**
 * Add XP to user's total and return level up info
 */
export const addXP = (xpAmount, reason = '') => {
  ensureScopedMigration();
  const currentXP = parseInt(localStorage.getItem(keyFor('totalXP')) || '0');
  const currentLevel = getCurrentLevel(currentXP);
  const newXP = currentXP + xpAmount;
  const newLevel = getCurrentLevel(newXP);
  
  // Save new XP
  localStorage.setItem(keyFor('totalXP'), newXP.toString());
  
  // Track XP history
  const xpHistory = JSON.parse(localStorage.getItem(keyFor('xpHistory')) || '[]');
  xpHistory.push({
    amount: xpAmount,
    reason,
    timestamp: new Date().toISOString(),
    totalXP: newXP
  });
  localStorage.setItem(keyFor('xpHistory'), JSON.stringify(xpHistory));
  
  // Check for level up
  const leveledUp = newLevel.level > currentLevel.level;
  
  return {
    xpGained: xpAmount,
    newTotalXP: newXP,
    leveledUp,
    oldLevel: currentLevel,
    newLevel,
    reason
  };
};

/**
 * Get user's gamification stats
 */
export const getGamificationStats = () => {
  ensureScopedMigration();
  const totalXP = parseInt(localStorage.getItem(keyFor('totalXP')) || '0');
  const currentLevel = getCurrentLevel(totalXP);
  const nextLevel = getNextLevel(totalXP);
  const progress = getLevelProgress(totalXP);
  
  // Get all earned achievements
  const earnedAchievements = JSON.parse(localStorage.getItem(keyFor('earnedAchievements')) || '[]');
  
  // Get quiz history for stats
  const quizHistory = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
  const totalQuizzes = quizHistory.length;
  const correctAnswers = quizHistory.reduce((sum, q) => sum + q.score, 0);
  const totalQuestions = quizHistory.reduce((sum, q) => sum + q.total, 0);
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Get streak info
  const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
  
  // Get daily login streak
  const loginStreak = parseInt(localStorage.getItem(keyFor('loginStreak')) || '0');
  const lastLoginDate = localStorage.getItem(keyFor('lastLoginDate'));
  
  return {
    totalXP,
    currentLevel,
    nextLevel,
    progress,
    xpToNextLevel: nextLevel ? nextLevel.minXP - totalXP : 0,
    achievements: earnedAchievements,
    achievementCount: earnedAchievements.length,
    totalAchievements: Object.keys(ACHIEVEMENTS).length,
    stats: {
      totalQuizzes,
      correctAnswers,
      totalQuestions,
      accuracy,
      currentStreak,
      loginStreak,
      lastLoginDate
    }
  };
};

/**
 * Check and award new achievements
 */
export const checkAndAwardAchievements = (userStats) => {
  ensureScopedMigration();
  const earnedAchievements = JSON.parse(localStorage.getItem(keyFor('earnedAchievements')) || '[]');
  const earnedIds = earnedAchievements.map(a => a.id);
  const newAchievements = [];
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (earnedIds.includes(achievement.id)) return; // Already earned
    
    let requirementMet = false;
    
    switch (achievement.requirement.type) {
      case 'quizzes_completed':
        requirementMet = userStats.totalQuizzes >= achievement.requirement.value;
        break;
      case 'correct_answers':
        requirementMet = userStats.correctAnswers >= achievement.requirement.value;
        break;
      case 'perfect_score':
        const perfectScores = userStats.perfectScores || 0;
        requirementMet = perfectScores >= achievement.requirement.value;
        break;
      case 'streak':
        requirementMet = userStats.currentStreak >= achievement.requirement.value;
        break;
      case 'accuracy_rate':
        requirementMet = userStats.totalQuizzes >= 20 && userStats.accuracy >= achievement.requirement.value;
        break;
      case 'speed_quizzes':
        const speedQuizzes = userStats.speedQuizzes || 0;
        requirementMet = speedQuizzes >= achievement.requirement.value;
        break;
      case 'survival_questions':
        const survivalQuestions = userStats.survivalQuestions || 0;
        requirementMet = survivalQuestions >= achievement.requirement.value;
        break;
      case 'threats_read':
        const threatsRead = parseInt(localStorage.getItem(keyFor('threatsRead')) || '0');
        requirementMet = threatsRead >= achievement.requirement.value;
        break;
      case 'simulations_completed':
        const simulationsCompleted = parseInt(localStorage.getItem(keyFor('simulationsCompleted')) || '0');
        requirementMet = simulationsCompleted >= achievement.requirement.value;
        break;
      case 'shares':
        const shares = parseInt(localStorage.getItem(keyFor('totalShares')) || '0');
        requirementMet = shares >= achievement.requirement.value;
        break;
      case 'early_morning_quizzes':
        const earlyQuizzes = parseInt(localStorage.getItem(keyFor('earlyMorningQuizzes')) || '0');
        requirementMet = earlyQuizzes >= achievement.requirement.value;
        break;
      case 'late_night_quizzes':
        const nightQuizzes = parseInt(localStorage.getItem(keyFor('lateNightQuizzes')) || '0');
        requirementMet = nightQuizzes >= achievement.requirement.value;
        break;
    }
    
    if (requirementMet) {
      newAchievements.push(achievement);
      earnedAchievements.push({
        ...achievement,
        earnedAt: new Date().toISOString()
      });
      
      // Award XP for achievement
      addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
    }
  });
  
  // Save updated achievements
  localStorage.setItem(keyFor('earnedAchievements'), JSON.stringify(earnedAchievements));
  
  return newAchievements;
};

/**
 * Process daily login and award rewards
 */
export const processDailyLogin = () => {
  ensureScopedMigration();
  const today = new Date().toDateString();
  const lastLoginDate = localStorage.getItem(keyFor('lastLoginDate'));
  const loginStreak = parseInt(localStorage.getItem(keyFor('loginStreak')) || '0');
  
  if (lastLoginDate === today) {
    return { alreadyLoggedIn: true, loginStreak };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newStreak = 1;
  if (lastLoginDate === yesterdayStr) {
    // Consecutive day
    newStreak = loginStreak + 1;
  }
  
  // Reset after 7 days
  const streakDay = ((newStreak - 1) % 7) + 1;
  const reward = DAILY_REWARDS[streakDay - 1];
  
  // Award login XP
  const xpResult = addXP(reward.xp, 'Daily Login Reward');
  
  // Award streak bonus for day 7
  if (streakDay === 7) {
    addXP(100, '7-Day Login Streak Bonus');
  }
  
  localStorage.setItem(keyFor('lastLoginDate'), today);
  localStorage.setItem(keyFor('loginStreak'), newStreak.toString());
  
  return {
    alreadyLoggedIn: false,
    loginStreak: newStreak,
    streakDay,
    reward,
    xpGained: reward.xp + (streakDay === 7 ? 100 : 0),
    ...xpResult
  };
};

/**
 * Track threat card read
 */
export const trackThreatRead = (threatId) => {
  ensureScopedMigration();
  const threatsRead = JSON.parse(localStorage.getItem(keyFor('threatsReadList')) || '[]');
  if (!threatsRead.includes(threatId)) {
    threatsRead.push(threatId);
    localStorage.setItem(keyFor('threatsReadList'), JSON.stringify(threatsRead));
    localStorage.setItem(keyFor('threatsRead'), threatsRead.length.toString());
    
    return addXP(XP_REWARDS.READ_THREAT_CARD, 'Read Threat Card');
  }
  return null;
};

/**
 * Track simulation completion
 */
export const trackSimulationComplete = (simulationId) => {
  ensureScopedMigration();
  const completedSimulations = JSON.parse(localStorage.getItem(keyFor('completedSimulations')) || '[]');
  if (!completedSimulations.includes(simulationId)) {
    completedSimulations.push(simulationId);
    localStorage.setItem(keyFor('completedSimulations'), JSON.stringify(completedSimulations));
    localStorage.setItem(keyFor('simulationsCompleted'), completedSimulations.length.toString());
    
    return addXP(XP_REWARDS.COMPLETE_SIMULATION, `Completed ${simulationId} Simulation`);
  }
  return null;
};

/**
 * Track social share
 */
export const trackShare = (platform) => {
  ensureScopedMigration();
  const totalShares = parseInt(localStorage.getItem(keyFor('totalShares')) || '0') + 1;
  localStorage.setItem(keyFor('totalShares'), totalShares.toString());
  
  const shareHistory = JSON.parse(localStorage.getItem(keyFor('shareHistory')) || '[]');
  shareHistory.push({
    platform,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(keyFor('shareHistory'), JSON.stringify(shareHistory));
  
  return addXP(XP_REWARDS.SHARE_ACHIEVEMENT, `Shared on ${platform}`);
};
