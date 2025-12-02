import React, { useState, useEffect, useCallback } from "react";
import { getDailyQuestions, QUESTION_BANK, getRandomQuestions } from "../utils/questionBank";
import { QUIZ_MODES, calculateSpeedBonus, saveQuizResult, getUserStats } from "../utils/quizUtils";
import { keyFor, ensureScopedMigration } from "../utils/userScopedStorage";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} onClick={onClick} disabled={disabled} {...props}>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const EnhancedQuizGame = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [lives, setLives] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  
  useEffect(() => {
    if (!selectedMode || !questions.length) return;
    
    const mode = QUIZ_MODES[selectedMode];
    if (!mode.timeLimit) return;
    
    setTimeRemaining(mode.timeLimit);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - treat as wrong answer
          handleTimeOut();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion, selectedMode, questions.length]);
  
  const handleTimeOut = () => {
    const mode = QUIZ_MODES[selectedMode];
    
    if (mode.lives !== null) {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives === 0) {
        endQuiz();
        return;
      }
    }
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeRemaining(mode.timeLimit);
    } else {
      endQuiz();
    }
  };
  
  const startQuiz = (modeKey) => {
    const mode = QUIZ_MODES[modeKey];
    setSelectedMode(modeKey);
    
    // Load questions based on mode
    let loadedQuestions = [];
    if (modeKey === 'daily') {
      // Check if already completed today
      const today = new Date().toDateString();
      const completedToday = localStorage.getItem(keyFor('lastCompletedDate'));
      if (completedToday === today) {
        const savedScore = localStorage.getItem(keyFor('todayScore'));
        if (savedScore) {
          setQuestions(getDailyQuestions(mode.questionCount));
          setShowResult(true);
          setScore(parseInt(savedScore));
          return;
        }
      }
      loadedQuestions = getDailyQuestions(mode.questionCount);
    } else if (modeKey === 'survival') {
      loadedQuestions = getRandomQuestions(50); // Pool of 50 questions for survival
    } else {
      loadedQuestions = getRandomQuestions(mode.questionCount);
    }
    
    setQuestions(loadedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setTimeBonus(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setLives(mode.lives);
    setTimeRemaining(mode.timeLimit);
  };
  
  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(optionIndex);
    const isCorrect = questions[currentQuestion].options[optionIndex].correct;
    const mode = QUIZ_MODES[selectedMode];
    
    let bonus = 0;
    if (isCorrect) {
      // Calculate speed bonus if timed mode
      if (mode.timeLimit && timeRemaining) {
        bonus = calculateSpeedBonus(timeRemaining, mode.timeLimit);
        setTimeBonus((prev) => prev + bonus);
      }
    } else {
      // Wrong answer
      if (mode.lives !== null) {
        const newLives = lives - 1;
        setLives(newLives);
        
        if (newLives === 0) {
          setTimeout(() => endQuiz(), 1500);
          return;
        }
      }
    }
    
    setTimeout(() => {
      if (isCorrect) setScore(score + 1);
      
      // Check if quiz should continue
      if (mode.lives !== null && lives <= 1 && !isCorrect) {
        // Game over in survival mode
        endQuiz();
        return;
      }
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeRemaining(mode.timeLimit);
      } else {
        endQuiz();
      }
    }, 1500);
  };
  
  const endQuiz = () => {
    const mode = QUIZ_MODES[selectedMode];
    const totalQuestions = mode.lives !== null ? currentQuestion + 1 : questions.length;
    
    // Save quiz result
    const result = saveQuizResult({
      mode: selectedMode,
      score,
      total: totalQuestions,
      timeBonus,
      lives: mode.lives !== null ? lives : null,
    });
    
    setNewBadges(result.newBadges || []);
    
    // Update streak for daily mode
    if (selectedMode === 'daily') {
      const today = new Date().toDateString();
      localStorage.setItem(keyFor('lastCompletedDate'), today);
      localStorage.setItem(keyFor('todayScore'), score.toString());
      
      updateStreak();
    }
    
    setShowResult(true);
  };
  
  const updateStreak = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastCompleted = localStorage.getItem(keyFor('lastCompletedDate'));
    const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
    
    if (lastCompleted === yesterday.toDateString()) {
      localStorage.setItem(keyFor('currentStreak'), (currentStreak + 1).toString());
    } else if (lastCompleted === today.toDateString()) {
      // Already completed today, keep streak
    } else {
      localStorage.setItem(keyFor('currentStreak'), '1');
    }
  };
  
  const resetQuiz = () => {
    setSelectedMode(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setTimeBonus(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setLives(null);
    setTimeRemaining(null);
    setNewBadges([]);
  };
  
  // Mode selection screen
  if (!selectedMode) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-indigo-50/30 shadow-xl border border-indigo-100">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Choose Your Challenge</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {Object.entries(QUIZ_MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => startQuiz(key)}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                {key === 'speed' && (
                  <Badge variant="destructive" className="bg-orange-100 text-orange-800">⚡ Timed</Badge>
                )}
                {key === 'survival' && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">❤️ Lives</Badge>
                )}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{mode.label}</h4>
              <p className="text-sm text-gray-600">{mode.description}</p>
            </button>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Complete quizzes to earn badges and climb the leaderboard!</p>
        </div>
      </Card>
    );
  }
  
  // Result screen
  if (showResult) {
    const mode = QUIZ_MODES[selectedMode];
    const totalQuestions = mode.lives !== null ? currentQuestion + 1 : questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const today = new Date().toDateString();
    const completedToday = localStorage.getItem(keyFor('lastCompletedDate')) === today;
    const currentStreak = parseInt(localStorage.getItem(keyFor('currentStreak')) || '0');
    
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl border border-indigo-100">
        <div className="text-6xl mb-4">
          {percentage >= 80 ? "🎉" : percentage >= 50 ? "🙂" : "😅"}
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          {percentage >= 80 ? "Excellent Work!" : percentage >= 50 ? "Good Job!" : "Keep Learning!"}
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          You got {score} out of {totalQuestions} questions correct!
        </p>
        
        {/* New Badges */}
        {newBadges.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg animate-bounce">
            <h4 className="font-bold text-yellow-800 mb-2">🏆 New Badge Unlocked!</h4>
            <div className="flex justify-center gap-3">
              {newBadges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-semibold text-yellow-900">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Streak Display */}
        {selectedMode === 'daily' && completedToday && currentStreak > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <span className="text-2xl font-bold text-orange-600">{currentStreak} Day Streak!</span>
            </div>
            <p className="text-sm text-orange-700">Come back tomorrow to keep your streak alive!</p>
          </div>
        )}
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="font-medium text-black">Your Score:</span>
            <span className="text-indigo-600 font-bold text-lg">{score}/{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="font-medium text-black">Success Rate:</span>
            <span className="text-green-600 font-bold text-lg">{percentage}%</span>
          </div>
          {timeBonus > 0 && (
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200">
              <span className="font-medium text-orange-800">⚡ Speed Bonus:</span>
              <span className="text-orange-600 font-bold text-lg">+{timeBonus} pts</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={resetQuiz} variant="outline">
            ← Choose Another Mode
          </Button>
          <Button onClick={() => startQuiz(selectedMode)} className="bg-gradient-to-r from-indigo-600 to-blue-600">
            🎯 Try Again
          </Button>
        </div>
      </Card>
    );
  }
  
  // Quiz screen
  if (questions.length === 0) {
    return <Card className="p-8 text-center"><div className="text-4xl mb-4">⏳</div><p className="text-gray-600">Loading questions...</p></Card>;
  }
  
  const question = questions[currentQuestion];
  const mode = QUIZ_MODES[selectedMode];
  const totalToShow = mode.lives !== null ? "∞" : questions.length;
  
  return (
    <Card className="p-8 bg-gradient-to-br from-white to-indigo-50/30 shadow-xl border border-indigo-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-base px-4 py-2">
          {mode.icon} {mode.label}
        </Badge>
        <div className="flex items-center gap-3">
          {/* Lives Display */}
          {mode.lives !== null && (
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="text-2xl">
                  {i < lives ? "❤️" : "🖤"}
                </span>
              ))}
            </div>
          )}
          
          {/* Timer Display */}
          {mode.timeLimit && timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              timeRemaining <= 10 ? "bg-red-100 text-red-800 animate-pulse" : "bg-blue-100 text-blue-800"
            }`}>
              <span className="text-lg">⏱️</span>
              <span className="font-bold text-lg">{timeRemaining}s</span>
            </div>
          )}
          
          {/* Score */}
          <Badge variant="default" className="bg-green-100 text-green-800 text-base px-3 py-1.5">
            Score: {score}
          </Badge>
        </div>
      </div>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {totalToShow}</span>
          {question.difficulty && (
            <Badge variant={question.difficulty === "hard" ? "destructive" : question.difficulty === "medium" ? "default" : "secondary"} className="capitalize">
              {question.difficulty}
            </Badge>
          )}
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / (mode.lives !== null ? 10 : questions.length)) * 100}%` }} />
        </div>
      </div>
      
      {/* Question */}
      <h3 className="text-xl font-bold mb-6 text-gray-900">{question.question}</h3>
      
      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
          
          if (selectedAnswer === null) {
            buttonClass += "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 bg-white text-black";
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
            <button key={index} onClick={() => handleAnswer(index)} className={buttonClass} disabled={selectedAnswer !== null}>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium">{option.text}</span>
                {selectedAnswer !== null && option.correct && <span className="ml-auto text-green-600 text-xl">✓</span>}
                {selectedAnswer === index && !option.correct && <span className="ml-auto text-red-600 text-xl">✗</span>}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Explanation */}
      {selectedAnswer !== null && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-slide-up">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedQuizGame;
