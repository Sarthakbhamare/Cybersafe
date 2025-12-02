import React, { useState } from "react";
import { trackSimulationComplete, addXP, XP_REWARDS } from "../utils/gamification";

const Card = ({ children, className = "" }) => (
  <div className={`border border-gray-200 rounded-xl ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", className = "", onClick, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
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

const PHISHING_EMAILS = [
  {
    id: "email_001",
    title: "Fake IT Department Security Alert",
    from: "IT Support <itsupport@company-security.com>",
    subject: "URGENT: Your account will be suspended",
    body: `Dear Employee,

We have detected suspicious activity on your account. Your password has been compromised and needs to be reset immediately to prevent account suspension.

Click here to verify your account within 24 hours: http://company-login-verify.com/reset

Failure to do so will result in permanent account suspension.

Regards,
IT Security Team
Company Inc.`,
    redFlags: [
      { id: "sender", text: "Suspicious sender domain", explanation: "Real company emails come from @company.com, not @company-security.com" },
      { id: "urgency", text: "Creates false urgency", explanation: "Phishing emails use urgency to make you act without thinking" },
      { id: "link", text: "Suspicious link domain", explanation: "The link goes to 'company-login-verify.com' instead of the official company website" },
      { id: "threat", text: "Threatens account suspension", explanation: "Legitimate IT teams don't threaten suspension via email" }
    ],
    difficulty: "easy"
  },
  {
    id: "email_002",
    title: "Fake Bank Account Verification",
    from: "HDFC Security <no-reply@hdfc-secure-verify.com>",
    subject: "Verify Your Account - Action Required",
    body: `Dear Valued Customer,

Due to recent security updates, we need you to verify your account information.

Your Account: XXXX-XXXX-1234
Status: Pending Verification

Please click the link below and enter your:
• Internet Banking User ID
• Password
• Debit Card Number & CVV

Verify Now: https://hdfc-secure-verify.com/login

This is mandatory to continue using your account.

Thank you,
HDFC Bank Security Team`,
    redFlags: [
      { id: "domain", text: "Fake domain name", explanation: "Real HDFC emails come from @hdfcbank.com, not @hdfc-secure-verify.com" },
      { id: "credentials", text: "Asks for password and CVV", explanation: "Banks NEVER ask for passwords, CVV, or full card details via email" },
      { id: "urgency2", text: "Mandatory action threat", explanation: "Phishing emails pressure you to act immediately" },
      { id: "generic", text: "Generic greeting", explanation: "Real banks use your actual name, not 'Valued Customer'" }
    ],
    difficulty: "medium"
  },
  {
    id: "email_003",
    title: "Prize/Lottery Scam",
    from: "Google Lottery <winner-notification@google-lottery-claim.com>",
    subject: "🎉 Congratulations! You've Won $500,000",
    body: `CONGRATULATIONS!!!

Your email address was randomly selected in the GOOGLE INTERNATIONAL LOTTERY and you have won $500,000 USD!

Winner Details:
Ticket Number: GTY-887-KL9
Winning Amount: $500,000.00
Batch: 2025/11/INT

To claim your prize, reply with:
1. Full Name
2. Phone Number
3. Home Address
4. Bank Account Details

Also pay processing fee of $250 via Western Union to claim your prize.

Act now! Claim expires in 48 hours.

Google Prize Committee`,
    redFlags: [
      { id: "toGood", text: "Too good to be true", explanation: "You can't win a lottery you never entered" },
      { id: "payment", text: "Asks for payment to claim prize", explanation: "Real lotteries never ask winners to pay fees upfront" },
      { id: "personal", text: "Requests sensitive personal info", explanation: "Asking for bank details and full personal info is a red flag" },
      { id: "fakeDomain", text: "Fake 'Google' domain", explanation: "Google doesn't run lotteries and would use @google.com" },
      { id: "urgency3", text: "Artificial deadline pressure", explanation: "48-hour expiry is used to rush your decision" }
    ],
    difficulty: "easy"
  },
  {
    id: "email_004",
    title: "Spear Phishing - CEO Fraud",
    from: "Rajesh Kumar (CEO) <rajesh.kumar@company.co.in>",
    subject: "Re: Urgent Wire Transfer - Confidential",
    body: `Hi,

I'm in a meeting with investors and need you to process an urgent wire transfer immediately.

Transfer Details:
Amount: ₹15,00,000
Account: 9876543210
IFSC: HDFC0001234
Beneficiary: Tech Solutions Pvt Ltd

This is time-sensitive for a business deal. Please complete within 1 hour and confirm.

Don't discuss this with anyone as it's confidential.

Thanks,
Rajesh Kumar
CEO, Company Inc.`,
    redFlags: [
      { id: "urgentWire", text: "Urgent money transfer request", explanation: "Scammers impersonate executives to rush financial transactions" },
      { id: "emailDomain2", text: "Slightly different email domain", explanation: "Real CEO email is @company.com but this is @company.co.in (note .co.in)" },
      { id: "secrecy", text: "Requests secrecy", explanation: "Legitimate business transactions don't require secrecy from colleagues" },
      { id: "noVerify", text: "No verification process", explanation: "Real companies have approval workflows for large transfers" },
      { id: "pressure", text: "Time pressure tactic", explanation: "1-hour deadline prevents you from verifying the request" }
    ],
    difficulty: "hard"
  },
  {
    id: "email_005",
    title: "Invoice Phishing with Malware",
    from: "Accounts Payable <billing@vendor-payments.net>",
    subject: "Invoice #INV-2025-1234 - Payment Overdue",
    body: `Dear Sir/Madam,

Your payment for Invoice #INV-2025-1234 is overdue by 15 days.

Invoice Amount: $2,450.00
Due Date: October 20, 2025
Late Fee: $245.00

Please download the attached invoice for details:
📎 Invoice_Q4_2025.pdf.exe (2.1 MB)

Make payment immediately to avoid legal action.

For queries, contact: +1-800-FAKE-NUM

Best Regards,
Vendor Billing Department`,
    redFlags: [
      { id: "attachment", text: "Suspicious .exe file", explanation: "Invoice_Q4_2025.pdf.exe is malware! PDFs don't have .exe extension" },
      { id: "vendorDomain", text: "Generic vendor domain", explanation: "Real vendors use their company domain, not 'vendor-payments.net'" },
      { id: "legalThreat", text: "Threatens legal action", explanation: "Legitimate vendors don't threaten legal action via email" },
      { id: "noDetails", text: "Vague company details", explanation: "No specific vendor name or legitimate contact information" },
      { id: "urgency4", text: "Overdue payment pressure", explanation: "Creates panic to make you click without thinking" }
    ],
    difficulty: "hard"
  }
];

const PhishingEmailSimulator = () => {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [foundRedFlags, setFoundRedFlags] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const currentEmail = PHISHING_EMAILS[currentEmailIndex];
  const allRedFlagsFound = foundRedFlags.length === currentEmail.redFlags.length;

  const handleRedFlagClick = (redFlag) => {
    if (!foundRedFlags.some(f => f.id === redFlag.id)) {
      const newFoundFlags = [...foundRedFlags, redFlag];
      setFoundRedFlags(newFoundFlags);
      
      // Award XP for finding red flag
      const xp = addXP(XP_REWARDS.SPOT_ALL_RED_FLAGS / currentEmail.redFlags.length, `Spotted: ${redFlag.text}`);
      setXpGained(prev => prev + xp.xpGained);
    }
  };

  const handleComplete = () => {
    if (allRedFlagsFound) {
      // Award completion XP
      const xp = trackSimulationComplete(currentEmail.id);
      if (xp) {
        setXpGained(prev => prev + xp.xpGained);
      }
      setCompleted(true);
    }
  };

  const handleNextEmail = () => {
    if (currentEmailIndex < PHISHING_EMAILS.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
      setFoundRedFlags([]);
      setShowHints(false);
      setCompleted(false);
    }
  };

  const handleReset = () => {
    setCurrentEmailIndex(0);
    setFoundRedFlags([]);
    setShowHints(false);
    setCompleted(false);
    setXpGained(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>📧</span>
              <span>Phishing Email Simulator</span>
            </h2>
            <p className="text-gray-600 mt-1">Click on suspicious elements to identify red flags</p>
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentEmailIndex + 1) / PHISHING_EMAILS.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentEmailIndex + 1}/{PHISHING_EMAILS.length}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email Display */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-xl overflow-hidden">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">{currentEmail.title}</h3>
                <Badge variant={
                  currentEmail.difficulty === 'hard' ? 'destructive' : 
                  currentEmail.difficulty === 'medium' ? 'default' : 'secondary'
                } className="capitalize">
                  {currentEmail.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-700 min-w-[60px]">From:</span>
                  <button
                    onClick={() => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('sender') || f.id.includes('domain') || f.id.includes('fakeDomain') || f.id.includes('emailDomain') || f.id.includes('vendorDomain')))}
                    className="text-gray-900 hover:bg-yellow-100 px-2 py-1 rounded transition-colors text-left flex-1"
                  >
                    {currentEmail.from}
                    {foundRedFlags.some(f => f.id.includes('sender') || f.id.includes('domain') || f.id.includes('fakeDomain') || f.id.includes('emailDomain') || f.id.includes('vendorDomain')) && 
                      <span className="ml-2 text-red-600">🚩</span>
                    }
                  </button>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-700 min-w-[60px]">Subject:</span>
                  <span className="text-gray-900">{currentEmail.subject}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-white">
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                {currentEmail.body.split('\n').map((line, index) => {
                  // Check if line contains clickable red flags
                  const isUrl = line.includes('http') || line.includes('Click here') || line.includes('Verify Now') || line.includes('📎');
                  const isUrgent = line.includes('URGENT') || line.includes('immediately') || line.includes('24 hours') || line.includes('48 hours') || line.includes('1 hour') || line.includes('mandatory') || line.includes('expires');
                  const isThreat = line.includes('suspension') || line.includes('legal action') || line.includes('overdue') || line.includes('Failure to do so');
                  const isPersonalInfo = line.includes('Password') || line.includes('CVV') || line.includes('Bank Account') || line.includes('Home Address') || line.includes('Account:');
                  const isPayment = line.includes('processing fee') || line.includes('Western Union') || line.includes('wire transfer');
                  const isGeneric = line.includes('Dear Employee') || line.includes('Valued Customer') || line.includes('Dear Sir/Madam');

                  let clickHandler = null;
                  let isClickable = false;

                  if (isUrl) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('link') || f.id.includes('attachment')));
                    isClickable = true;
                  } else if (isUrgent) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('urgency') || f.id.includes('pressure')));
                    isClickable = true;
                  } else if (isThreat) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('threat') || f.id.includes('legalThreat')));
                    isClickable = true;
                  } else if (isPersonalInfo) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('credentials') || f.id.includes('personal')));
                    isClickable = true;
                  } else if (isPayment) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('payment')));
                    isClickable = true;
                  } else if (isGeneric) {
                    clickHandler = () => handleRedFlagClick(currentEmail.redFlags.find(f => f.id.includes('generic')));
                    isClickable = true;
                  }

                  const hasFoundFlag = foundRedFlags.some(f => 
                    (isUrl && (f.id.includes('link') || f.id.includes('attachment'))) ||
                    (isUrgent && (f.id.includes('urgency') || f.id.includes('pressure'))) ||
                    (isThreat && (f.id.includes('threat') || f.id.includes('legalThreat'))) ||
                    (isPersonalInfo && (f.id.includes('credentials') || f.id.includes('personal'))) ||
                    (isPayment && f.id.includes('payment')) ||
                    (isGeneric && f.id.includes('generic'))
                  );

                  return (
                    <div
                      key={index}
                      onClick={clickHandler}
                      className={`${isClickable ? 'cursor-pointer hover:bg-yellow-50 px-2 py-1 rounded transition-colors' : ''} ${hasFoundFlag ? 'bg-red-50 border-l-4 border-red-500 pl-2' : ''}`}
                    >
                      {line}
                      {hasFoundFlag && <span className="ml-2 text-red-600 text-lg">🚩</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => setShowHints(!showHints)}
              variant="outline"
              className="flex-1"
            >
              {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
            </Button>
            {allRedFlagsFound && !completed && (
              <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                ✅ Complete Simulation (+{XP_REWARDS.COMPLETE_SIMULATION} XP)
              </Button>
            )}
            {completed && currentEmailIndex < PHISHING_EMAILS.length - 1 && (
              <Button onClick={handleNextEmail} className="flex-1">
                ➡️ Next Email
              </Button>
            )}
            {completed && currentEmailIndex === PHISHING_EMAILS.length - 1 && (
              <Button onClick={handleReset} className="flex-1">
                🔄 Start Over
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Red Flags & Hints */}
        <div className="space-y-4">
          {/* Progress */}
          <Card className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🚩</span>
              <span>Red Flags Found</span>
            </h4>
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-indigo-600">
                {foundRedFlags.length}/{currentEmail.redFlags.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {allRedFlagsFound ? '🎉 All found!' : 'Keep looking...'}
              </div>
            </div>
            <div className="bg-white rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(foundRedFlags.length / currentEmail.redFlags.length) * 100}%` }}
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
                {currentEmail.redFlags.filter(f => !foundRedFlags.some(found => found.id === f.id)).map((flag, index) => (
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
                <div className="text-xl font-bold text-green-800 mb-2">Excellent Work!</div>
                <div className="text-sm text-gray-700 mb-3">
                  You've successfully identified all phishing red flags!
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

export default PhishingEmailSimulator;
