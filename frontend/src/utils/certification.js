// Certification System - Exam Generation and Certificate Management

import { QUESTION_BANK, getRandomQuestions } from './questionBank';
import { addXP } from './gamification';

// Certification Configuration
export const CERTIFICATION_CONFIG = {
  TOTAL_QUESTIONS: 50,
  PASSING_SCORE: 60, // 60% pass criteria
  TIME_LIMIT: 30 * 60, // 30 minutes in seconds
  MAX_ATTEMPTS: 3,
  CERTIFICATE_VALIDITY_YEARS: 2,
  XP_REWARD: 500, // Massive XP for certification
};

/**
 * Generate certification exam (50 questions from all categories)
 */
export const generateCertificationExam = () => {
  // Ensure balanced distribution across categories
  const categories = [...new Set(QUESTION_BANK.map(q => q.category))];
  const questionsPerCategory = Math.floor(CERTIFICATION_CONFIG.TOTAL_QUESTIONS / categories.length);
  
  let examQuestions = [];
  
  // Get questions from each category
  categories.forEach(category => {
    const categoryQuestions = QUESTION_BANK.filter(q => q.category === category);
    const selected = categoryQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionsPerCategory);
    examQuestions = [...examQuestions, ...selected];
  });
  
  // Fill remaining slots with random questions
  while (examQuestions.length < CERTIFICATION_CONFIG.TOTAL_QUESTIONS) {
    const remaining = QUESTION_BANK.filter(q => !examQuestions.includes(q));
    if (remaining.length === 0) break;
    examQuestions.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }
  
  // Shuffle final question order
  return examQuestions.sort(() => Math.random() - 0.5).slice(0, CERTIFICATION_CONFIG.TOTAL_QUESTIONS);
};

/**
 * Evaluate certification exam results
 */
export const evaluateCertificationExam = (answers, questions) => {
  let correctCount = 0;
  const detailedResults = [];
  
  questions.forEach((question, index) => {
    const userAnswer = answers[question.id]; // Use question ID, not index
    const correctAnswer = question.options.findIndex(opt => opt.correct);
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) correctCount++;
    
    detailedResults.push({
      questionId: question.id,
      category: question.category,
      difficulty: question.difficulty,
      isCorrect,
      userAnswer,
      correctAnswer
    });
  });
  
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= CERTIFICATION_CONFIG.PASSING_SCORE;
  
  // Category-wise breakdown
  const categoryBreakdown = {};
  detailedResults.forEach(result => {
    if (!categoryBreakdown[result.category]) {
      categoryBreakdown[result.category] = { correct: 0, total: 0, percentage: 0 };
    }
    categoryBreakdown[result.category].total++;
    if (result.isCorrect) categoryBreakdown[result.category].correct++;
  });
  
  // Calculate percentages
  Object.keys(categoryBreakdown).forEach(category => {
    const data = categoryBreakdown[category];
    data.percentage = Math.round((data.correct / data.total) * 100);
  });
  
  return {
    passed,
    score,
    correctCount,
    totalQuestions: questions.length,
    categoryBreakdown,
    detailedResults
  };
};

/**
 * Generate unique certificate ID
 */
export const generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `CS-${timestamp}-${random}`.toUpperCase();
};

/**
 * Save certification result
 */
const keyFor = (base) => {
  const uid = (typeof localStorage !== 'undefined' && (localStorage.getItem('userId') || localStorage.getItem('userEmail'))) || 'anon';
  return `${base}_${uid}`;
};

export const saveCertificationResult = (result, timeTaken) => {
  // Migrate legacy keys to user-scoped if needed
  try {
    const legacyCert = localStorage.getItem('certificate');
    const legacyAttempts = localStorage.getItem('certificationAttempts');
    const uid = localStorage.getItem('userId') || localStorage.getItem('userEmail');
    if (uid && (legacyCert || legacyAttempts)) {
      if (legacyCert && !localStorage.getItem(keyFor('certificate'))) {
        localStorage.setItem(keyFor('certificate'), legacyCert);
        localStorage.removeItem('certificate');
      }
      if (legacyAttempts && !localStorage.getItem(keyFor('certificationAttempts'))) {
        localStorage.setItem(keyFor('certificationAttempts'), legacyAttempts);
        localStorage.removeItem('certificationAttempts');
      }
    }
  } catch (_) {}

  const attempts = JSON.parse(localStorage.getItem(keyFor('certificationAttempts')) || '[]');
  
  const attemptData = {
    attemptNumber: attempts.length + 1,
    date: new Date().toISOString(),
    score: result.score,
    passed: result.passed,
    timeTaken, // in seconds
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    categoryBreakdown: result.categoryBreakdown
  };
  
  attempts.push(attemptData);
  localStorage.setItem(keyFor('certificationAttempts'), JSON.stringify(attempts));
  
  // Only issue a certificate when passed and not already issued
  const certKey = keyFor('certificate');
  if (result.passed && !localStorage.getItem(certKey)) {
    const certId = generateCertificateId();
    
    // Get user name from localStorage, with fallback
    let holderName = localStorage.getItem('userName');
    if (!holderName || holderName === 'undefined' || holderName === 'null') {
      holderName = 'CyberSafe User';
    }
    
    const certificate = {
      id: certId,
      holderName: holderName,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + CERTIFICATION_CONFIG.CERTIFICATE_VALIDITY_YEARS * 365 * 24 * 60 * 60 * 1000).toISOString(),
      score: result.score,
      attemptNumber: attempts.length,
      verificationUrl: `https://cybersafe.app/verify/${certId}`
    };

    localStorage.setItem(certKey, JSON.stringify(certificate));

    // Award XP for pass
    addXP(CERTIFICATION_CONFIG.XP_REWARD, 'Earned CyberSafe Certification');

    return { success: true, certificate };
  }

  return { success: result.passed, attemptData };
};

/**
 * Get certification status
 */
export const getCertificationStatus = () => {
  const certificate = JSON.parse(localStorage.getItem(keyFor('certificate')) || 'null');
  const attempts = JSON.parse(localStorage.getItem(keyFor('certificationAttempts')) || '[]');
  
  if (certificate) {
    const expiryDate = new Date(certificate.expiryDate);
    const isExpired = expiryDate < new Date();
    
    return {
      isCertified: !isExpired,
      certificate,
      attempts,
      canRetake: isExpired,
      status: isExpired ? 'expired' : 'certified'
    };
  }
  
  return {
    isCertified: false,
    certificate: null,
    attempts,
    canRetake: attempts.length < CERTIFICATION_CONFIG.MAX_ATTEMPTS,
    attemptsRemaining: Math.max(0, CERTIFICATION_CONFIG.MAX_ATTEMPTS - attempts.length),
    status: attempts.length >= CERTIFICATION_CONFIG.MAX_ATTEMPTS ? 'max_attempts_reached' : 'not_attempted'
  };
};

/**
 * Get best attempt
 */
export const getBestAttempt = () => {
  const attempts = JSON.parse(localStorage.getItem(keyFor('certificationAttempts')) || '[]');
  
  if (attempts.length === 0) return null;
  
  return attempts.reduce((best, current) => 
    current.score > best.score ? current : best
  );
};

/**
 * Generate certificate data for display/download
 */
export const getCertificateData = () => {
  const certificate = JSON.parse(localStorage.getItem(keyFor('certificate')) || 'null');
  const attempts = JSON.parse(localStorage.getItem(keyFor('certificationAttempts')) || '[]');
  
  if (!certificate) return null;

  const currentAttempt = attempts.find(a => a.attemptNumber === certificate.attemptNumber) || {};
  
  return {
    ...certificate,
    formattedIssueDate: new Date(certificate.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    formattedExpiryDate: new Date(certificate.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    grade: certificate.score >= 90 ? 'Distinction' : certificate.score >= 80 ? 'Merit' : 'Pass',
    correctCount: currentAttempt.correctCount || Math.round((certificate.score / 100) * CERTIFICATION_CONFIG.TOTAL_QUESTIONS),
    totalQuestions: CERTIFICATION_CONFIG.TOTAL_QUESTIONS,
    linkedInShareText: `🎓 Excited to share that I've earned my CyberSafe Certification with a score of ${certificate.score}%!

I've successfully completed comprehensive training in:
✅ Cybersecurity principles
✅ Threat identification & analysis
✅ Digital safety practices
✅ Online vulnerability protection

This certification demonstrates my commitment to staying safe in our digital world and protecting against evolving cyber threats.

#CyberSecurity #CyberSafe #DigitalSafety #Certification #ProfessionalDevelopment`,
    linkedInShareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.verificationUrl)}`,
    verificationUrl: certificate.verificationUrl
  };
};

/**
 * Reset certification (for testing or re-certification after expiry)
 */
export const resetCertification = () => {
  try {
    const uid = localStorage.getItem('userId') || localStorage.getItem('userEmail') || 'anon';
    localStorage.removeItem(`certificate_${uid}`);
    localStorage.removeItem(`certificationAttempts_${uid}`);
  } catch (_) {}
  localStorage.removeItem('currentExam');
  localStorage.removeItem('examStartTime');
};
