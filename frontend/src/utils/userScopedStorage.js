// Centralized user-scoped storage helpers

export const userScopeId = () => {
  try {
    return (
      localStorage.getItem('userId') ||
      localStorage.getItem('userEmail') ||
      'anon'
    );
  } catch (_) {
    return 'anon';
  }
};

export const keyFor = (key) => `${key}_${userScopeId()}`;

const LEGACY_KEYS = [
  'totalXP',
  'xpHistory',
  'earnedAchievements',
  'earnedBadges',
  'quizHistory',
  'currentStreak',
  'loginStreak',
  'lastLoginDate',
  'lastCompletedDate',
  'todayScore',
  'threatsReadList',
  'threatsRead',
  'completedSimulations',
  'simulationsCompleted',
  'totalShares',
  'shareHistory',
  'earlyMorningQuizzes',
  'lateNightQuizzes',
  'perfectScores',
  'speedQuizzes',
  'survivalQuestions',
  'leaderboard'
];

export const ensureScopedMigration = () => {
  try {
    const uid = userScopeId();
    LEGACY_KEYS.forEach((k) => {
      const scopedK = `${k}_${uid}`;
      const hasScoped = localStorage.getItem(scopedK) !== null;
      const legacyVal = localStorage.getItem(k);
      if (!hasScoped && legacyVal !== null) {
        localStorage.setItem(scopedK, legacyVal);
        // Move instead of copy so old global values do not leak to other users.
        localStorage.removeItem(k);
      }
    });
  } catch (_) {}
};

export const getScopedJSON = (key, fallback = []) => {
  ensureScopedMigration();
  try {
    const raw = localStorage.getItem(keyFor(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
};

export const setScopedJSON = (key, value) => {
  try {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch (_) {}
};

export const getScopedNumber = (key, fallback = 0) => {
  ensureScopedMigration();
  try {
    return parseInt(localStorage.getItem(keyFor(key)) || fallback.toString());
  } catch (_) {
    return fallback;
  }
};

export const setScopedNumber = (key, value) => {
  try {
    localStorage.setItem(keyFor(key), value.toString());
  } catch (_) {}
};
