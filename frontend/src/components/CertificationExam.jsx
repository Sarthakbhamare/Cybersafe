import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  generateCertificationExam,
  evaluateCertificationExam,
  saveCertificationResult,
  CERTIFICATION_CONFIG
} from "../utils/certification";
import { addXP } from "../utils/gamification";

const CertificationExam = () => {
  const navigate = useNavigate();
  const [examState, setExamState] = useState('loading'); // loading, instructions, exam, submitted
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(CERTIFICATION_CONFIG.TIME_LIMIT);
  const [results, setResults] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    try {
      console.log('Generating certification exam...');
      const exam = generateCertificationExam();
      console.log('Exam generated:', exam.length, 'questions');
      if (exam && exam.length > 0) {
        setQuestions(exam);
        setExamState('instructions');
      } else {
        console.error('No questions generated');
        setExamState('error');
      }
    } catch (error) {
      console.error('Error generating exam:', error);
      setExamState('error');
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (examState !== 'exam' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamState('exam');
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNavigateQuestion = (index) => {
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const handleSubmitClick = () => {
    const answeredCount = getAnsweredCount();
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) {
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    submitExam();
  };

  const handleAutoSubmit = () => {
    submitExam();
  };

  const submitExam = () => {
    const timeTaken = CERTIFICATION_CONFIG.TIME_LIMIT - timeRemaining;
    const evaluation = evaluateCertificationExam(answers, questions);
    const saveResult = saveCertificationResult(evaluation, timeTaken);
    
    setResults({
      ...evaluation,
      ...saveResult,
      timeTaken
    });
    setExamState('submitted');
  };

  const handleViewCertificate = () => {
    navigate('/my-certificate');
  };

  const handleTryAgain = () => {
    navigate('/student-dashboard');
  };

  const currentQuestion = questions[currentIndex];

  if (examState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Unavailable</h2>
          <p className="text-gray-700 mb-6">
            We couldn't load the certification exam. Please try again later.
          </p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (examState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-gray-700">Preparing your certification exam...</p>
        </div>
      </div>
    );
  }

  if (examState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎓</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">CyberSafe Certification Exam</h1>
              <p className="text-gray-600">Test your cybersecurity knowledge and earn your certificate</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-2">📋 Exam Format</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• <strong>{CERTIFICATION_CONFIG.TOTAL_QUESTIONS}</strong> multiple-choice questions</li>
                  <li>• Questions cover all cybersecurity categories</li>
                  <li>• Each question has 4 options (A, B, C, D)</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2">✅ Passing Criteria</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Minimum <strong>{CERTIFICATION_CONFIG.PASSING_SCORE}%</strong> score required ({Math.ceil(CERTIFICATION_CONFIG.TOTAL_QUESTIONS * CERTIFICATION_CONFIG.PASSING_SCORE / 100)}/{CERTIFICATION_CONFIG.TOTAL_QUESTIONS} correct answers)</li>
                  <li>• Certificate valid for <strong>{CERTIFICATION_CONFIG.CERTIFICATE_VALIDITY_YEARS} years</strong></li>
                  <li>• Earn <strong>+{CERTIFICATION_CONFIG.XP_REWARD} XP</strong> on certification</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2">⏱️ Time Limit</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• You have <strong>{CERTIFICATION_CONFIG.TIME_LIMIT / 60} minutes</strong> to complete the exam</li>
                  <li>• Timer starts when you begin</li>
                  <li>• Exam auto-submits when time runs out</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold text-gray-900 mb-2">📝 Important Notes</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• You can navigate between questions freely</li>
                  <li>• Maximum <strong>{CERTIFICATION_CONFIG.MAX_ATTEMPTS} attempts</strong> allowed</li>
                  <li>• Review all answers before submitting</li>
                  <li>• Once submitted, answers cannot be changed</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/student-dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                ← Go Back
              </button>
              <button
                onClick={handleStartExam}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start Exam →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'submitted') {
    const passed = results.passed;
    const gradeColor = results.score >= 90 ? 'text-purple-600' : results.score >= 80 ? 'text-blue-600' : 'text-green-600';
    const grade = results.score >= 90 ? 'Distinction' : results.score >= 80 ? 'Merit' : 'Pass';

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{passed ? '🎉' : '😔'}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {passed ? 'Congratulations!' : 'Not Quite There Yet'}
              </h1>
              <p className="text-xl text-gray-600">
                {passed ? `You've earned your CyberSafe Certification!` : 'Keep learning and try again'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl text-center border border-indigo-200">
                <div className="text-4xl font-bold text-indigo-600 mb-1">{results.score}%</div>
                <div className="text-sm text-gray-600">Your Score</div>
                {passed && <div className={`text-sm font-bold ${gradeColor} mt-1`}>{grade}</div>}
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-1">{results.correctCount}/{CERTIFICATION_CONFIG.TOTAL_QUESTIONS}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-1">{formatTime(results.timeTaken)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            {passed && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mb-8 border-2 border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <div className="font-bold text-green-800 text-lg">Certification Earned!</div>
                    <div className="text-sm text-green-700">You've passed with {results.score}% score</div>
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  • Certificate ID: <span className="font-mono font-bold">{results.certificate?.id}</span><br />
                  • Valid until: <strong>{new Date(results.certificate?.expiryDate).toLocaleDateString()}</strong><br />
                  • XP Earned: <strong>+{CERTIFICATION_CONFIG.XP_REWARD} XP</strong> 🎊
                </div>
              </div>
            )}

            {!passed && (
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl mb-8 border-2 border-yellow-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💪</span>
                  <div>
                    <div className="font-bold text-orange-800 text-lg">Keep Practicing!</div>
                    <div className="text-sm text-orange-700">You need {CERTIFICATION_CONFIG.PASSING_SCORE}% to pass ({Math.ceil(CERTIFICATION_CONFIG.TOTAL_QUESTIONS * CERTIFICATION_CONFIG.PASSING_SCORE / 100)}/{CERTIFICATION_CONFIG.TOTAL_QUESTIONS} correct)</div>
                  </div>
                </div>
                <div className="text-sm text-orange-700">
                  You scored {results.score}%, just {CERTIFICATION_CONFIG.PASSING_SCORE - results.score}% away from passing. Review your weak areas and try again!
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(results.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">{data.correct}/{data.total} correct</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          data.percentage >= 80 ? 'bg-green-500' : data.percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{data.percentage}% accuracy</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {passed ? (
                <>
                  <button
                    onClick={handleTryAgain}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={handleViewCertificate}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    View Certificate 🎓
                  </button>
                </>
              ) : (
                <button
                  onClick={handleTryAgain}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Try Again 💪
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exam UI - Safety check for questions
  if (examState === 'exam' && (!questions || questions.length === 0 || !currentQuestion)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-700 mb-6">
            The exam questions couldn't be loaded. Please go back and try again.
          </p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Exam UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-600">Time Left</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentIndex + 1}/{questions.length}</div>
                <div className="text-xs text-gray-600">Question</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getAnsweredCount()}/{questions.length}</div>
                <div className="text-xs text-gray-600">Answered</div>
              </div>
            </div>

            <button
              onClick={handleSubmitClick}
              disabled={getAnsweredCount() === 0}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Question Navigator</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => handleNavigateQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                      index === currentIndex
                        ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                        : answers[q.id] !== undefined
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {currentQuestion.category}
                  </span>
                  <span className="text-sm text-gray-600">Question {currentIndex + 1} of {questions.length}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h2>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = ['A', 'B', 'C', 'D'][index];
                  const isSelected = answers[currentQuestion.id] === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {optionLabel}
                        </div>
                        <span className="text-gray-900">{option.text || option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Exam?</h3>
              <p className="text-gray-600">
                Are you sure you want to submit your exam? You have answered <strong>{getAnsweredCount()}/{questions.length}</strong> questions.
              </p>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationExam;
