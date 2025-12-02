import React, { useState, useEffect } from "react";
import EnhancedQuizGame from "../components/EnhancedQuizGame";
import { Link } from "react-router-dom";
import { trackThreatRead } from "../utils/gamification";
import { getCertificationStatus, CERTIFICATION_CONFIG } from "../utils/certification";
import StudentHero from "../components/student/StudentHero";
import ThreatCard from "../components/student/ThreatCard";
import QuickTips from "../components/student/QuickTips";
import { keyFor, ensureScopedMigration } from "../utils/userScopedStorage";

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
  <div
    className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}
  >
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
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      activeTab === value
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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

const ThreatCardWrapper = ({ title, description, examples, type, severity }) => {
  const [hasRead, setHasRead] = useState(false);
  
  const handleExpand = () => {
    if (!hasRead) {
      const threatId = `${type}_${title.toLowerCase().replace(/\s+/g, '_')}`;
      trackThreatRead(threatId);
      setHasRead(true);
    }
  };

  return (
    <ThreatCard
      title={title}
      description={description}
      examples={examples}
      type={type}
      severity={severity}
      onRead={handleExpand}
    />
  );
};

const SpotTheFakeGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameMode, setGameMode] = useState("daily"); // 'daily' or 'practice'

  useEffect(() => {
    // Load daily challenge questions
    if (gameMode === "daily") {
      const dailyQuestions = getDailyQuestions(5);
      setQuestions(dailyQuestions);
      
      // Check if user already completed today's challenge
      ensureScopedMigration();
      const today = new Date().toDateString();
      const completedToday = localStorage.getItem(keyFor('lastCompletedDate'));
      if (completedToday === today) {
        const savedScore = localStorage.getItem(keyFor('todayScore'));
        if (savedScore) {
          setShowResult(true);
          setScore(parseInt(savedScore));
        }
      }
    } else {
      // Practice mode - random questions
      const practiceQuestions = getRandomQuestions(10);
      setQuestions(practiceQuestions);
    }
  }, [gameMode]);

  const handleAnswer = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    const isCorrect = questions[currentQuestion].options[optionIndex].correct;

    setTimeout(() => {
      const newScore = isCorrect ? score + 1 : score;
      setScore(newScore);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Save daily challenge completion
        if (gameMode === "daily") {
          const today = new Date().toDateString();
          localStorage.setItem(keyFor('lastCompletedDate'), today);
          localStorage.setItem(keyFor('todayScore'), newScore.toString());
          
          // Update streak
          updateStreak();
          
          // Save to progress history
          const history = JSON.parse(localStorage.getItem(keyFor('quizHistory')) || '[]');
          history.push({
            date: today,
            score: newScore,
            total: questions.length,
            mode: gameMode
          });
          localStorage.setItem(keyFor('quizHistory'), JSON.stringify(history));
        }
        
        setShowResult(true);
      }
    }, 1500);
  };

  const updateStreak = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastCompleted = localStorage.getItem(keyFor('lastCompletedDate'));
    const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
    
    if (lastCompleted === yesterday.toDateString()) {
      // Consecutive day
      localStorage.setItem(keyFor('currentStreak'), (currentStreak + 1).toString());
    } else if (lastCompleted === today.toDateString()) {
      // Already completed today
      // Keep streak
    } else {
      // Streak broken
      localStorage.setItem(keyFor('currentStreak'), '1');
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    
    // Load new questions based on mode
    if (gameMode === "daily") {
      setQuestions(getDailyQuestions(5));
    } else {
      setQuestions(getRandomQuestions(10));
    }
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl border border-indigo-100">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading questions...</p>
      </Card>
    );
  }

  if (showResult) {
    const today = new Date().toDateString();
    const completedToday = localStorage.getItem(keyFor('lastCompletedDate')) === today;
    const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');

    return (
      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl border border-indigo-100">
        <div className="text-6xl mb-4">
          {score >= questions.length * 0.8 ? "🎉" : score >= questions.length * 0.5 ? "🙂" : "😅"}
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          {score >= questions.length * 0.8
            ? "Excellent Work!"
            : score >= questions.length * 0.5
            ? "Good Job!"
            : "Keep Learning!"}
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          You got {score} out of {questions.length} questions correct!
        </p>
        
        {gameMode === "daily" && completedToday && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-lg font-bold text-green-800">{currentStreak} Day Streak!</span>
            </div>
            <p className="text-sm text-green-700">Come back tomorrow to keep your streak alive!</p>
          </div>
        )}

        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="font-medium text-black">Your Score:</span>
            <span className="text-indigo-600 font-bold text-lg">
              {score}/{questions.length}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="font-medium text-black">Success Rate:</span>
            <span className="text-green-600 font-bold text-lg">
              {Math.round((score / questions.length) * 100)}%
            </span>
          </div>
          {gameMode === "daily" && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
              <span className="font-medium text-black">Mode:</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">Daily Challenge</Badge>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {gameMode === "daily" ? (
            <Button
              onClick={() => switchMode("practice")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              🎯 Try Practice Mode ({QUESTION_BANK.length} Questions)
            </Button>
          ) : (
            <>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              >
                🎯 Try Again
              </Button>
              <Button
                onClick={() => switchMode("daily")}
                variant="outline"
              >
                📅 Back to Daily Challenge
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="p-8 bg-gradient-to-br from-white to-indigo-50/30 shadow-xl border border-indigo-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => switchMode("daily")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              gameMode === "daily"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📅 Daily (5Q)
          </button>
          <button
            onClick={() => switchMode("practice")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              gameMode === "practice"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🎯 Practice ({QUESTION_BANK.length}Q)
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Score:</span>
          <Badge variant="default" className="bg-green-100 text-green-800">
            {score}/{questions.length}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
          Question {currentQuestion + 1} of {questions.length}
        </Badge>
        {question.difficulty && (
          <Badge 
            variant={question.difficulty === "hard" ? "destructive" : question.difficulty === "medium" ? "default" : "secondary"}
            className="capitalize"
          >
            {question.difficulty}
          </Badge>
        )}
      </div>

      <h3 className="text-xl font-bold mb-6 text-gray-900">
        {question.question}
      </h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let buttonClass =
            "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";

          if (selectedAnswer === null) {
            buttonClass +=
              "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 bg-white text-black";
          } else if (selectedAnswer === index) {
            if (option.correct) {
              buttonClass += "border-green-500 bg-green-50 text-green-800";
            } else {
              buttonClass += "border-red-500 bg-red-50 text-red-800";
            }
          } else if (option.correct && selectedAnswer !== null) {
            buttonClass += "border-green-500 bg-green-50 text-green-800";
          } else {
            buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
          }

          return (
            <button
              key={index}
              onClick={() => selectedAnswer === null && handleAnswer(index)}
              className={buttonClass}
              disabled={selectedAnswer !== null}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium">{option.text}</span>
                {selectedAnswer !== null && option.correct && (
                  <span className="ml-auto text-green-600 text-xl">✓</span>
                )}
                {selectedAnswer === index && !option.correct && (
                  <span className="ml-auto text-red-600 text-xl">✗</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>
    </Card>
  );
};

// Certification Card Component
const CertificationCard = () => {
  const { isCertified, certificate, attempts, canRetake, attemptsRemaining, status } = getCertificationStatus();
  
  if (isCertified) {
    return (
      <Card className="p-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-300 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-8xl">🎓</div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <h3 className="text-3xl font-bold text-gray-900">CyberSafe Certified</h3>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-gray-700 mb-3 text-lg">
              Congratulations! You've earned your certification with a score of <strong>{certificate.score}%</strong>
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Badge variant="default" className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                Certificate ID: {certificate.id}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                Valid until: {new Date(certificate.expiryDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          <div>
            <Link to="/my-certificate">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                View Certificate 🎓
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="text-8xl">🎓</div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">CyberSafe Certification</h3>
          <p className="text-gray-700 mb-4 text-lg">
            Earn a professional certification by passing our comprehensive cybersecurity exam.
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span>📝</span>
              <span><strong>{CERTIFICATION_CONFIG.TOTAL_QUESTIONS}</strong> comprehensive questions</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span>✅</span>
              <span><strong>{CERTIFICATION_CONFIG.PASSING_SCORE}%</strong> passing score required</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span>⏱️</span>
              <span><strong>{CERTIFICATION_CONFIG.TIME_LIMIT / 60}</strong> minutes to complete</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span>🏆</span>
              <span>Earn <strong>+{CERTIFICATION_CONFIG.XP_REWARD} XP</strong> on certification</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span>💼</span>
              <span>LinkedIn-shareable certificate</span>
            </div>
          </div>
          {attempts && attempts.length > 0 && (
            <div className="mb-4 p-3 bg-white/70 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Previous Attempts:</strong> {attempts.length}/{CERTIFICATION_CONFIG.MAX_ATTEMPTS}
                {attempts.length > 0 && (
                  <span className="ml-2">
                    • Best Score: <strong>{Math.max(...attempts.map(a => a.score))}%</strong>
                  </span>
                )}
              </div>
            </div>
          )}
          {!canRetake && status === 'max_attempts_reached' && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-700">
                ⚠️ You've reached the maximum number of attempts ({CERTIFICATION_CONFIG.MAX_ATTEMPTS}). Please contact support to reset.
              </div>
            </div>
          )}
        </div>
        <div>
          {canRetake ? (
            <Link 
              to="/certification-exam"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {attempts && attempts.length > 0 ? 'Try Again 💪' : 'Start Exam 🎯'}
            </Link>
          ) : (
            <Button size="lg" disabled className="opacity-50 cursor-not-allowed">
              Exam Unavailable
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Main StudentPage Component
const StudentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <StudentHero />

      <section id="learning-section" className="container mx-auto px-4 py-16 max-w-7xl scroll-mt-20">
        <Tabs defaultValue="game" className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Choose Your Learning Path
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Interactive challenges designed for your busy student life. Quick,
              effective, and actually fun!
            </p>
          </div>

          <TabsList className="grid w-full grid-cols-3 gap-4 p-2 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="game"
              className="flex items-center justify-center gap-2 py-3 px-6 w-full"
            >
              🎯 Spot the Fake
            </TabsTrigger>
            
            <TabsTrigger
              value="simulations"
              className="flex items-center justify-center gap-2 py-3 px-6 w-full"
            >
              🎮 Interactive Sims
            </TabsTrigger>

            <TabsTrigger
              value="threats"
              className="flex items-center justify-center gap-2 py-3 px-6 w-full"
            >
              🛡️ Know Your Threats
            </TabsTrigger>

          </TabsList>

          <TabsContent value="game" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <EnhancedQuizGame />
            </div>
          </TabsContent>
          
          <TabsContent value="simulations" className="space-y-8">
            {/* Certification Card */}
            <CertificationCard />
            
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/phishing-simulator">
                <Card className="p-8 bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📧</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Phishing Email Simulator</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Spot red flags in realistic phishing emails. Click on suspicious elements to learn what makes them dangerous.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Badge variant="default" className="bg-purple-100 text-purple-800">+75 XP</Badge>
                      <Badge variant="secondary">5 Scenarios</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Start Simulation</span>
                      <span>→</span>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/sms-simulator">
                <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📱</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">SMS Scam Simulator</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Experience real SMS scams in a safe environment. Learn to identify threats before they reach your phone.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Badge variant="default" className="bg-purple-100 text-purple-800">+75 XP</Badge>
                      <Badge variant="secondary">6 Scenarios</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Start Simulation</span>
                      <span>→</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <div className="text-center p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">More Simulations Coming Soon!</h4>
              <p className="text-gray-600">Website comparison tool, voice call scams, crypto fraud detection, and social engineering scenarios</p>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ThreatCardWrapper
                  title="Social Media Phishing"
                  description="Fake login pages and suspicious DMs targeting your social accounts"
                  examples={[
                    "Fake Instagram login pages with misspelled URLs",
                    "Messages claiming your account will be deleted",
                    "Suspicious friend requests from fake profiles",
                  ]}
                  type="social"
                  severity="high"
                />
                <ThreatCardWrapper
                  title="Job & Internship Scams"
                  description="Too-good-to-be-true job offers designed to steal your money or data"
                  examples={[
                    "Earn ₹2000 daily by liking YouTube videos",
                    "Pay registration fees for guaranteed jobs",
                    "Internships requiring upfront payments",
                  ]}
                  type="job"
                  severity="high"
                />
                <ThreatCardWrapper
                  title="Gaming & App Fraud"
                  description="Malicious apps and in-game purchase scams targeting gamers"
                  examples={[
                    "Free game credits from unknown sources",
                    "Modded APKs with hidden malware",
                    "Fake gaming tournaments with entry fees",
                  ]}
                  type="gaming"
                  severity="medium"
                />
              </div>
              <div>
                <QuickTips />
              </div>
            </div>
          </TabsContent>


        </Tabs>
      </section>
    </div>
  );
};

export default StudentPage;
