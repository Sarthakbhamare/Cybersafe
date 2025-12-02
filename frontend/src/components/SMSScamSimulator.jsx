import React, { useState, useEffect } from "react";
import { trackSimulationComplete, addXP, XP_REWARDS } from "../utils/gamification";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", className = "", onClick, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md",
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
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

// Celebratory particle animation component
const ConfettiParticle = ({ x, y, color, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none animate-ping"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '8px',
        height: '8px',
        backgroundColor: color,
        borderRadius: '50%',
        animation: 'confetti 1s ease-out forwards'
      }}
    />
  );
};

const SMS_SCAMS = [
  {
    id: "sms_001",
    sender: "AD-HDFCBK",
    message: "Your HDFC Bank account will be blocked in 24hrs. Update KYC now: http://hdfc-kyc-update.tk/verify",
    time: "2:34 PM",
    redFlags: [
      { id: "urgency", text: "Creates false urgency (24hrs)", explanation: "Scammers use time pressure to make you act without thinking" },
      { id: "suspicious_url", text: "Suspicious short domain (.tk)", explanation: "Real banks use official domains like hdfcbank.com, not .tk domains" },
      { id: "kyc_threat", text: "Threats about account blocking", explanation: "Banks never threaten to block accounts via SMS - they send official notices" }
    ],
    difficulty: "easy",
    type: "Banking Scam"
  },
  {
    id: "sms_002",
    sender: "+91-XXXXX-87634",
    message: "Hi! I'm Priya from HR. CEO needs you to buy Amazon gift cards (₹50,000) urgently for client gifts. I'll reimburse today. Send codes to this number.",
    time: "11:23 AM",
    redFlags: [
      { id: "gift_card", text: "Gift card payment request", explanation: "Gift cards are untraceable - scammers love them. Real companies never pay via gift cards" },
      { id: "impersonation", text: "Impersonates authority (HR/CEO)", explanation: "Scammers pretend to be executives to pressure employees" },
      { id: "urgency2", text: "Urgency without verification", explanation: "Legitimate requests have proper approval workflows" },
      { id: "unknown_number", text: "Unknown/masked phone number", explanation: "Real HR uses company contacts, not random mobile numbers" }
    ],
    difficulty: "medium",
    type: "CEO Fraud"
  },
  {
    id: "sms_003",
    sender: "VD-DTCSBX",
    message: "Congratulations! You won ₹25 lakhs in KBC lottery. To claim, pay processing fee ₹5000 to Account: 9876543210, IFSC: SBIN0012345. Valid for 48hrs only!",
    time: "4:15 PM",
    redFlags: [
      { id: "prize_scam", text: "Lottery you never entered", explanation: "You can't win a prize/lottery you didn't participate in" },
      { id: "upfront_fee", text: "Payment required to claim", explanation: "Real lotteries never ask winners to pay fees upfront" },
      { id: "deadline", text: "Artificial 48hr deadline", explanation: "Creates urgency to prevent you from verifying" },
      { id: "kbc_fake", text: "KBC impersonation", explanation: "KBC (Kaun Banega Crorepati) doesn't run random SMS lotteries" }
    ],
    difficulty: "easy",
    type: "Prize/Lottery Scam"
  },
  {
    id: "sms_004",
    sender: "+91-98765-43210",
    message: "Mom, my phone broke! This is my new number. Need ₹15,000 urgently for hospital bill. Can you UPI to 9876543210@paytm? Will explain later, emergency!",
    time: "9:47 PM",
    redFlags: [
      { id: "family_impersonation", text: "Impersonates family member", explanation: "Scammers pretend to be relatives in emergency. Always call the actual person to verify" },
      { id: "emergency_pressure", text: "False emergency pressure", explanation: "Creates panic to bypass your normal verification instinct" },
      { id: "new_number", text: "Claims 'new number'", explanation: "Convenient excuse why you can't call them back to verify" },
      { id: "money_urgency", text: "Immediate money request", explanation: "Rushed payment prevents verification of the emergency" }
    ],
    difficulty: "medium",
    type: "Family Emergency Scam"
  },
  {
    id: "sms_005",
    sender: "TM-AMAZIN",
    message: "Your Amazon order #45678 has been dispatched. Track: bit.ly/amzn-track-2025 If not ordered, call +91-8000012345 immediately to cancel (₹12,499 will be charged)",
    time: "1:20 PM",
    redFlags: [
      { id: "fake_order", text: "Order you didn't place", explanation: "Creates panic about unwanted charge to make you click/call" },
      { id: "shortened_url", text: "Suspicious shortened URL", explanation: "Real Amazon uses amazon.in links, not bit.ly shortened URLs" },
      { id: "fake_number", text: "Customer care number in SMS", explanation: "Real Amazon never provides customer care numbers via SMS" },
      { id: "tm_sender", text: "Fake sender ID (TM-AMAZIN)", explanation: "Real Amazon sender ID is 'AMAZON', not variations like 'AMAZIN'" }
    ],
    difficulty: "hard",
    type: "Delivery/Order Scam"
  },
  {
    id: "sms_006",
    sender: "+1-800-XXX-XXXX",
    message: "ALERT: Suspicious activity detected on your Credit Card ending 4567. ₹89,450 charged at Dubai Mall. If not you, verify here: http://card-security-verify.com OTP: 9834",
    time: "6:52 AM",
    redFlags: [
      { id: "otp_included", text: "Includes OTP in message", explanation: "Real banks NEVER send verification links with OTP in same message" },
      { id: "foreign_location", text: "Mentions foreign location", explanation: "Creates believability - Dubai is common in scam scripts" },
      { id: "verify_url", text: "Suspicious verification URL", explanation: "Real banks don't send verification links via SMS for fraud alerts" },
      { id: "international_number", text: "International sender number", explanation: "Indian banks use Indian sender IDs, not US (+1) numbers" }
    ],
    difficulty: "hard",
    type: "Credit Card Fraud Alert Scam"
  }
];

const SMSScamSimulator = () => {
  const [currentSMSIndex, setCurrentSMSIndex] = useState(0);
  const [foundRedFlags, setFoundRedFlags] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [particles, setParticles] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [ripples, setRipples] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for realism
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getBatteryLevel = () => {
    const hour = currentTime.getHours();
    return Math.max(20, 100 - (hour * 3)); // Simulated battery drain
  };

  const currentSMS = SMS_SCAMS[currentSMSIndex];
  const allRedFlagsFound = foundRedFlags.length === currentSMS.redFlags.length;

  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

  const createConfetti = (x, y) => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  const handleRedFlagClick = (redFlag, e) => {
    if (!foundRedFlags.some(f => f.id === redFlag.id)) {
      createRipple(e);
      
      // Create confetti at click position
      const rect = e.currentTarget.getBoundingClientRect();
      createConfetti(e.clientX, e.clientY);
      
      const newFoundFlags = [...foundRedFlags, redFlag];
      setFoundRedFlags(newFoundFlags);
      
      // Show tooltip with explanation
      setActiveTooltip({ flag: redFlag, x: e.clientX, y: e.clientY });
      setTimeout(() => setActiveTooltip(null), 3000);
      
      const xp = addXP(XP_REWARDS.SPOT_ALL_RED_FLAGS / currentSMS.redFlags.length, `Spotted: ${redFlag.text}`);
      setXpGained(prev => prev + xp.xpGained);
    }
  };

  const handleComplete = () => {
    if (allRedFlagsFound) {
      const xp = trackSimulationComplete(currentSMS.id);
      if (xp) {
        setXpGained(prev => prev + xp.xpGained);
      }
      setCompleted(true);
    }
  };

  const handleNextSMS = () => {
    if (currentSMSIndex < SMS_SCAMS.length - 1) {
      setCurrentSMSIndex(currentSMSIndex + 1);
      setFoundRedFlags([]);
      setShowHints(false);
      setCompleted(false);
    }
  };

  const handleReset = () => {
    setCurrentSMSIndex(0);
    setFoundRedFlags([]);
    setShowHints(false);
    setCompleted(false);
    setXpGained(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Add confetti particles */}
      {particles.map(particle => (
        <ConfettiParticle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          onComplete={() => setParticles(prev => prev.filter(p => p.id !== particle.id))}
        />
      ))}

      {/* Tooltip for explanations */}
      {activeTooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl max-w-xs animate-fade-in"
          style={{
            left: `${Math.min(activeTooltip.x, window.innerWidth - 300)}px`,
            top: `${activeTooltip.y + 20}px`,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div className="font-bold text-sm mb-1 text-emerald-400">✓ {activeTooltip.flag.text}</div>
          <div className="text-xs text-gray-300">{activeTooltip.flag.explanation}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>📱</span>
              <span>SMS Scam Simulator</span>
            </h2>
            <p className="text-gray-600 mt-1">Tap suspicious elements to identify scam indicators</p>
          </div>
          <div className="text-right">
            <Badge variant="default" className="bg-purple-100 text-purple-800 text-base px-4 py-2">
              +{xpGained} XP Earned
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSMSIndex + 1) / SMS_SCAMS.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentSMSIndex + 1}/{SMS_SCAMS.length}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Phone Mockup */}
        <div className="lg:col-span-2">
          <div className="max-w-md mx-auto">
            {/* Phone Frame with realistic bezel */}
            <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-[3.5rem] p-3 shadow-2xl ring-1 ring-gray-700">
              {/* Phone Screen */}
              <div className="bg-gray-900 rounded-[3rem] overflow-hidden relative">
                {/* Modern Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black w-40 h-7 rounded-b-3xl z-10 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="absolute right-6 w-2 h-2 bg-gray-700 rounded-full"></div>
                </div>

                {/* Enhanced Status Bar */}
                <div className="bg-white px-6 pt-8 pb-2 flex items-center justify-between text-xs relative z-0">
                  <span className="font-semibold text-gray-900">{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-2.5 bg-gray-900 rounded-sm"></div>
                      <div className="w-1 h-3 bg-gray-900 rounded-sm"></div>
                      <div className="w-1 h-3.5 bg-gray-900 rounded-sm"></div>
                      <div className="w-1 h-4 bg-gray-900 rounded-sm"></div>
                      <span className="text-[10px] ml-0.5 text-gray-700">Jio</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <div className="flex items-center gap-0.5">
                      <div className={`w-5 h-5 rounded ${getBatteryLevel() > 20 ? 'text-gray-900' : 'text-red-600'}`}>
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="7" width="18" height="10" rx="2" fill="currentColor" opacity={getBatteryLevel() / 100} />
                          <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-700">{getBatteryLevel()}%</span>
                    </div>
                  </div>
                </div>

                {/* SMS Header with ripple effects */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white relative overflow-hidden">
                  {ripples.map(ripple => (
                    <div
                      key={ripple.id}
                      className="absolute rounded-full bg-white opacity-30 animate-ripple"
                      style={{
                        left: `${ripple.x}px`,
                        top: `${ripple.y}px`,
                        width: '20px',
                        height: '20px',
                        transform: 'translate(-50%, -50%)',
                        animation: 'ripple 0.6s ease-out'
                      }}
                    />
                  ))}
                  <div className="flex items-center gap-3 relative z-10">
                    <button className="text-2xl hover:bg-white/20 rounded-full p-1 transition-all">←</button>
                    <div className="flex-1">
                      <button
                        onClick={(e) => {
                          const senderFlag = currentSMS.redFlags.find(f => 
                            f.id.includes('sender') || f.id.includes('tm_') || f.id.includes('unknown_number') || f.id.includes('international_number')
                          );
                          if (senderFlag) handleRedFlagClick(senderFlag, e);
                        }}
                        className="font-semibold hover:bg-white/20 px-2 py-1 rounded transition-all duration-200 w-full text-left transform hover:scale-105"
                      >
                        {currentSMS.sender}
                        {foundRedFlags.some(f => f.id.includes('sender') || f.id.includes('tm_') || f.id.includes('unknown_number') || f.id.includes('international_number')) && 
                          <span className="ml-2 animate-bounce inline-block">🚩</span>
                        }
                      </button>
                      <div className="text-xs opacity-90 flex items-center gap-2">
                        <span>{currentSMS.type}</span>
                        <span className="text-[10px] opacity-75">• Online</span>
                      </div>
                    </div>
                    <button className="text-2xl hover:bg-white/20 rounded-full p-1 transition-all">⋮</button>
                  </div>
                </div>

                {/* SMS Body */}
                <div className="bg-gray-100 min-h-[500px] p-6">
                  {/* Message Bubble */}
                  <div className="mb-4">
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%] inline-block">
                      <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {currentSMS.message.split(/(\bhttps?:\/\/\S+|\bbit\.ly\/\S+|\b\d{10}@\w+|\b₹[\d,]+(?:\s+(?:lakhs?|crores?))?\b|\bOTP:\s*\d+|\b\+?\d{1,3}[-\s]?\d{4,5}[-\s]?\d{4,5}|\b\d+hrs?\b|\bblocked?\b|\bKYC\b|\burgent\w*\b|\bemergency\b|\bimmediately\b|\bCEO\b|\bHR\b|\bgift\s+cards?\b|\bAmazon\b|\breimburse\b|\bPriya\b|\bCongratulations?\b|\bwon\b|\blottery\b|\bKBC\b|\bclaim\b|\bprocessing\s+fee\b|\bMom\b|\bhospital\b|\bnew\s+number\b|\border\b|\bdispatched\b|\bcancel\b|\bcharged\b|\bALERT\b|\bSuspicious\s+activity\b|\bDubai\b|\bverify\b|\bAMAZIN\b)/gi).map((part, index) => {
                          const isURL = /^(https?:\/\/|bit\.ly\/)/.test(part);
                          const isUPI = /\d{10}@\w+/.test(part);
                          const isAmount = /₹[\d,]+/.test(part);
                          const isOTP = /OTP:\s*\d+/.test(part);
                          const isPhone = /\+?\d{1,3}[-\s]?\d{4,5}[-\s]?\d{4,5}/.test(part);

                          let clickHandler = null;
                          let isClickable = false;

                          if (isURL) {
                            clickHandler = (e) => {
                              const flag = currentSMS.redFlags.find(f => 
                                f.id.includes('url') || f.id.includes('shortened') || f.id.includes('verify')
                              );
                              if (flag) handleRedFlagClick(flag, e);
                            };
                            isClickable = true;
                          } else if (isUPI || isAmount || isOTP || isPhone) {
                            clickHandler = (e) => {
                              const flag = currentSMS.redFlags.find(f => 
                                (isUPI && f.id.includes('gift_card')) ||
                                (isAmount && (f.id.includes('upfront_fee') || f.id.includes('fake_order'))) ||
                                (isOTP && f.id.includes('otp')) ||
                                (isPhone && f.id.includes('fake_number'))
                              );
                              if (flag) handleRedFlagClick(flag, e);
                            };
                            isClickable = true;
                          }

                          const hasFoundFlag = foundRedFlags.some(f =>
                            (isURL && (f.id.includes('url') || f.id.includes('shortened') || f.id.includes('verify'))) ||
                            (isUPI && f.id.includes('gift_card')) ||
                            (isAmount && (f.id.includes('upfront_fee') || f.id.includes('fake_order'))) ||
                            (isOTP && f.id.includes('otp')) ||
                            (isPhone && f.id.includes('fake_number'))
                          );

                          if (isClickable) {
                            return (
                              <span
                                key={index}
                                onClick={(e) => clickHandler(e)}
                                className={`cursor-pointer hover:bg-yellow-100 px-1 rounded transition-all duration-200 transform hover:scale-105 ${
                                  hasFoundFlag ? 'bg-emerald-100 font-semibold text-emerald-800 ring-2 ring-emerald-300' : isURL || isUPI || isPhone ? 'text-blue-600 underline decoration-2' : 'font-semibold'
                                }`}
                              >
                                {part}
                                {hasFoundFlag && <span className="ml-1 animate-bounce inline-block">🚩</span>}
                              </span>
                            );
                          }

                          // Check for keywords
                          const hasKeyword = /urgent|emergency|immediately|block|expired|verify|claim|won|congratulations|suspicious|24hrs|blocked|KYC|Update|CEO|HR|gift\s+cards?|Amazon|reimburse|Priya|lottery|prize|hospital|mom|family|new\s+number|order|dispatched|cancel|charged|OTP|ALERT|Dubai|processing\s+fee|48hrs/i.test(part);
                          if (hasKeyword) {
                            // Determine which flag this keyword should trigger
                            let keywordFlag = null;
                            
                            // KYC-specific keywords trigger kyc_threat flag
                            if (/KYC|Update.*KYC/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'kyc_threat');
                            }
                            // CEO/HR impersonation
                            else if (/CEO|HR|Priya/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'impersonation');
                            }
                            // Family impersonation
                            else if (/mom|hospital/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'family_impersonation');
                            }
                            // New number flag
                            else if (/new\s+number/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'new_number');
                            }
                            // Gift card scam
                            else if (/gift\s+cards?|Amazon|reimburse/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'gift_card');
                            }
                            // Urgency keywords
                            else if (/urgent|emergency|immediately|24hrs|48hrs|blocked?/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => 
                                f.id.includes('urgency') || f.id.includes('emergency') || f.id.includes('deadline') || f.id.includes('money_urgency')
                              );
                            }
                            // Prize/lottery
                            else if (/won|congratulations|lottery|prize|claim|KBC/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'prize_scam' || f.id === 'kbc_fake');
                            }
                            // Upfront fee
                            else if (/processing\s+fee/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'upfront_fee');
                            }
                            // Fake order
                            else if (/order|dispatched|cancel/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'fake_order');
                            }
                            // OTP included
                            else if (/OTP/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'otp_included');
                            }
                            // Foreign location
                            else if (/Dubai|ALERT|suspicious\s+activity/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'foreign_location');
                            }
                            // Verify URL flag
                            else if (/verify/i.test(part)) {
                              keywordFlag = currentSMS.redFlags.find(f => f.id === 'verify_url');
                            }
                            // Other keywords
                            else {
                              keywordFlag = currentSMS.redFlags.find(f => 
                                f.id.includes('fake_order') || f.id.includes('verify')
                              );
                            }
                            
                            const keywordFound = foundRedFlags.some(f => f.id === keywordFlag?.id);

                            return (
                              <span
                                key={index}
                                onClick={(e) => keywordFlag && handleRedFlagClick(keywordFlag, e)}
                                className={`cursor-pointer hover:bg-yellow-100 px-1 rounded transition-all duration-200 transform hover:scale-105 ${keywordFound ? 'bg-emerald-100 font-semibold ring-2 ring-emerald-300' : ''}`}
                              >
                                {part}
                                {keywordFound && <span className="ml-1 animate-bounce inline-block">🚩</span>}
                              </span>
                            );
                          }

                          return <span key={index}>{part}</span>;
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-right">{currentSMS.time}</div>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                  <button className="text-2xl">😊</button>
                  <input
                    type="text"
                    placeholder="Type a message"
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
                    disabled
                  />
                  <button className="text-2xl">📎</button>
                  <button className="text-green-500 text-2xl">🎤</button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <Button onClick={() => setShowHints(!showHints)} variant="outline" className="flex-1">
                {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
              </Button>
              {allRedFlagsFound && !completed && (
                <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                  ✅ Complete (+{XP_REWARDS.COMPLETE_SIMULATION} XP)
                </Button>
              )}
              {completed && currentSMSIndex < SMS_SCAMS.length - 1 && (
                <Button onClick={handleNextSMS} className="flex-1">
                  ➡️ Next SMS
                </Button>
              )}
              {completed && currentSMSIndex === SMS_SCAMS.length - 1 && (
                <Button onClick={handleReset} className="flex-1">
                  🔄 Start Over
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress */}
          <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🚩</span>
              <span>Red Flags Found</span>
            </h4>
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-green-600">
                {foundRedFlags.length}/{currentSMS.redFlags.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {allRedFlagsFound ? '🎉 All found!' : 'Keep tapping...'}
              </div>
            </div>
            <div className="bg-white rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(foundRedFlags.length / currentSMS.redFlags.length) * 100}%` }}
              />
            </div>
          </Card>

          {/* Found Red Flags */}
          {foundRedFlags.length > 0 && (
            <Card className="p-5 bg-white shadow-lg">
              <h4 className="font-bold text-gray-900 mb-3">✅ Identified Threats</h4>
              <div className="space-y-3">
                {foundRedFlags.map((flag, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-semibold text-red-800 text-sm mb-1">{flag.text}</div>
                    <div className="text-xs text-gray-700">{flag.explanation}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Hints */}
          {showHints && (
            <Card className="p-5 bg-yellow-50 border-yellow-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Hints</span>
              </h4>
              <div className="space-y-2 text-sm">
                {currentSMS.redFlags.filter(f => !foundRedFlags.some(found => found.id === f.id)).map((flag, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-gray-700">Look for: {flag.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Completion Message */}
          {completed && (
            <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
              <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <div className="text-xl font-bold text-green-800 mb-2">Well Done!</div>
                <div className="text-sm text-gray-700 mb-3">
                  You've identified all SMS scam red flags!
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 text-base px-4 py-2">
                  +{XP_REWARDS.COMPLETE_SIMULATION} XP
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMSScamSimulator;
