// Comprehensive threat intelligence database
// This serves as a local cache and educational resource

export const THREAT_DATABASE = {
  // Malicious URLs
  urls: [
    {
      indicator: "http://hdfc-kyc-update.tk",
      type: "phishing",
      severity: "critical",
      category: "Banking Phishing",
      reports: 1247,
      lastSeen: "2025-11-04",
      description: "Fake HDFC Bank KYC update page designed to steal banking credentials",
      tags: ["phishing", "banking", "credential-theft"]
    },
    {
      indicator: "https://secure-paypal-verify.xyz",
      type: "phishing",
      severity: "critical",
      category: "Payment Phishing",
      reports: 892,
      lastSeen: "2025-11-03",
      description: "Fraudulent PayPal login page harvesting payment information",
      tags: ["phishing", "paypal", "payment-fraud"]
    },
    {
      indicator: "http://amazon-prize.ml",
      type: "phishing",
      severity: "high",
      category: "Prize Scam",
      reports: 634,
      lastSeen: "2025-11-05",
      description: "Fake Amazon prize/gift card scam collecting personal information",
      tags: ["phishing", "prize-scam", "amazon-impersonation"]
    },
    {
      indicator: "https://bit.ly/3xK9mNp",
      type: "malicious",
      severity: "critical",
      category: "Malware Distribution",
      reports: 2103,
      lastSeen: "2025-11-04",
      description: "Shortened URL redirecting to malware download site",
      tags: ["malware", "url-shortener", "trojan"]
    },
    {
      indicator: "http://gov-tax-refund.tk",
      type: "phishing",
      severity: "high",
      category: "Government Impersonation",
      reports: 567,
      lastSeen: "2025-11-02",
      description: "Fake government tax refund page stealing SSN and banking details",
      tags: ["phishing", "government", "tax-fraud"]
    },
    {
      indicator: "https://netflix-payment-update.ga",
      type: "phishing",
      severity: "high",
      category: "Streaming Service Phishing",
      reports: 445,
      lastSeen: "2025-11-05",
      description: "Fraudulent Netflix payment update page harvesting credit cards",
      tags: ["phishing", "netflix", "subscription-scam"]
    },
    {
      indicator: "http://whatsapp-verify.cf",
      type: "phishing",
      severity: "critical",
      category: "Social Media Phishing",
      reports: 1523,
      lastSeen: "2025-11-04",
      description: "Fake WhatsApp verification page stealing phone numbers and OTPs",
      tags: ["phishing", "whatsapp", "otp-theft"]
    },
    {
      indicator: "https://crypto-giveaway-musk.com",
      type: "phishing",
      severity: "critical",
      category: "Cryptocurrency Scam",
      reports: 3421,
      lastSeen: "2025-11-05",
      description: "Fake Elon Musk cryptocurrency giveaway - sends crypto, never returns",
      tags: ["phishing", "cryptocurrency", "celebrity-impersonation"]
    },
    {
      indicator: "http://microsoft-security-alert.tk",
      type: "phishing",
      severity: "high",
      category: "Tech Support Scam",
      reports: 789,
      lastSeen: "2025-11-03",
      description: "Fake Microsoft security alert leading to tech support scam",
      tags: ["phishing", "microsoft", "tech-support-scam"]
    },
    {
      indicator: "https://icloud-unlock.ml",
      type: "phishing",
      severity: "critical",
      category: "Apple ID Phishing",
      reports: 1092,
      lastSeen: "2025-11-04",
      description: "Fraudulent iCloud unlock service stealing Apple ID credentials",
      tags: ["phishing", "apple", "credential-theft"]
    }
  ],

  // Malicious Phone Numbers
  phones: [
    {
      indicator: "+91-XXXXX-87634",
      type: "scam",
      severity: "high",
      category: "CEO Fraud",
      reports: 234,
      lastSeen: "2025-11-04",
      description: "Used in impersonation scams pretending to be company executives",
      tags: ["ceo-fraud", "gift-card-scam", "business-email-compromise"]
    },
    {
      indicator: "+1-844-555-0123",
      type: "scam",
      severity: "critical",
      category: "Tech Support Scam",
      reports: 1876,
      lastSeen: "2025-11-05",
      description: "Fake Microsoft/Apple tech support scam call center",
      tags: ["tech-support", "remote-access", "payment-fraud"]
    },
    {
      indicator: "+91-9876543210",
      type: "scam",
      severity: "high",
      category: "UPI Fraud",
      reports: 567,
      lastSeen: "2025-11-03",
      description: "Used for UPI payment scams and fake emergency requests",
      tags: ["upi-fraud", "payment-scam", "emergency-scam"]
    },
    {
      indicator: "+44-20-3808-9876",
      type: "scam",
      severity: "high",
      category: "Investment Scam",
      reports: 423,
      lastSeen: "2025-11-04",
      description: "Cryptocurrency and forex investment scam call center",
      tags: ["investment-fraud", "cryptocurrency", "forex-scam"]
    },
    {
      indicator: "+1-888-777-0001",
      type: "scam",
      severity: "critical",
      category: "IRS Impersonation",
      reports: 2341,
      lastSeen: "2025-11-05",
      description: "Fake IRS calls threatening arrest for unpaid taxes",
      tags: ["irs-scam", "government-impersonation", "tax-fraud"]
    },
    {
      indicator: "+91-7001234567",
      type: "scam",
      severity: "medium",
      category: "OTP Theft",
      reports: 189,
      lastSeen: "2025-11-02",
      description: "Calls pretending to be bank, asks for OTP verification",
      tags: ["otp-theft", "banking", "social-engineering"]
    },
    {
      indicator: "+971-50-123-4567",
      type: "scam",
      severity: "high",
      category: "Job Scam",
      reports: 312,
      lastSeen: "2025-11-04",
      description: "Fake job offers requiring upfront payment for processing",
      tags: ["job-scam", "employment-fraud", "advance-fee"]
    },
    {
      indicator: "+1-800-AMAZON",
      type: "scam",
      severity: "critical",
      category: "Package Delivery Scam",
      reports: 1567,
      lastSeen: "2025-11-05",
      description: "Fake Amazon delivery calls attempting to steal payment info",
      tags: ["amazon-scam", "delivery-fraud", "phishing"]
    }
  ],

  // Malicious Email Addresses
  emails: [
    {
      indicator: "security@paypal-verify.com",
      type: "phishing",
      severity: "critical",
      category: "Payment Phishing",
      reports: 1423,
      lastSeen: "2025-11-04",
      description: "Fake PayPal security emails requesting account verification",
      tags: ["phishing", "paypal", "credential-theft"]
    },
    {
      indicator: "no-reply@amazon-account.tk",
      type: "phishing",
      severity: "high",
      category: "E-commerce Phishing",
      reports: 892,
      lastSeen: "2025-11-05",
      description: "Fraudulent Amazon account suspension emails",
      tags: ["phishing", "amazon", "account-takeover"]
    },
    {
      indicator: "support@microsoft-security.ml",
      type: "phishing",
      severity: "critical",
      category: "Tech Company Phishing",
      reports: 2103,
      lastSeen: "2025-11-03",
      description: "Fake Microsoft security alerts with malicious attachments",
      tags: ["phishing", "microsoft", "malware"]
    },
    {
      indicator: "hr@company-payroll.xyz",
      type: "phishing",
      severity: "high",
      category: "Business Email Compromise",
      reports: 534,
      lastSeen: "2025-11-04",
      description: "CEO fraud emails requesting gift card purchases",
      tags: ["bec", "ceo-fraud", "gift-card-scam"]
    },
    {
      indicator: "verify@netflix-billing.cf",
      type: "phishing",
      severity: "high",
      category: "Subscription Scam",
      reports: 678,
      lastSeen: "2025-11-05",
      description: "Fake Netflix billing update emails stealing credit cards",
      tags: ["phishing", "netflix", "payment-fraud"]
    },
    {
      indicator: "prizes@lottery-winner.ga",
      type: "phishing",
      severity: "medium",
      category: "Prize Scam",
      reports: 345,
      lastSeen: "2025-11-02",
      description: "Fake lottery winner notifications requiring upfront fees",
      tags: ["prize-scam", "advance-fee", "lottery-fraud"]
    },
    {
      indicator: "alert@bank-security.tk",
      type: "phishing",
      severity: "critical",
      category: "Banking Phishing",
      reports: 1876,
      lastSeen: "2025-11-04",
      description: "Fraudulent bank security alerts requesting credential updates",
      tags: ["phishing", "banking", "credential-theft"]
    },
    {
      indicator: "delivery@dhl-tracking.ml",
      type: "phishing",
      severity: "high",
      category: "Delivery Scam",
      reports: 923,
      lastSeen: "2025-11-05",
      description: "Fake DHL delivery notifications with malware links",
      tags: ["phishing", "delivery", "malware"]
    }
  ],

  // Malicious IP Addresses
  ips: [
    {
      indicator: "185.220.101.47",
      type: "malicious",
      severity: "critical",
      category: "Command & Control Server",
      reports: 3421,
      lastSeen: "2025-11-05",
      description: "Known C2 server for banking trojan malware",
      tags: ["c2-server", "malware", "banking-trojan"]
    },
    {
      indicator: "45.142.212.61",
      type: "malicious",
      severity: "critical",
      category: "Phishing Host",
      reports: 2134,
      lastSeen: "2025-11-04",
      description: "Hosts multiple phishing sites targeting financial institutions",
      tags: ["phishing", "hosting", "banking"]
    },
    {
      indicator: "103.216.221.19",
      type: "malicious",
      severity: "high",
      category: "Spam Source",
      reports: 1567,
      lastSeen: "2025-11-05",
      description: "Mass spam and phishing email distribution server",
      tags: ["spam", "phishing", "email-fraud"]
    },
    {
      indicator: "91.203.5.146",
      type: "malicious",
      severity: "critical",
      category: "Ransomware C2",
      reports: 4523,
      lastSeen: "2025-11-04",
      description: "Command server for ransomware operations",
      tags: ["ransomware", "c2-server", "malware"]
    },
    {
      indicator: "194.59.30.73",
      type: "malicious",
      severity: "high",
      category: "Credential Harvesting",
      reports: 892,
      lastSeen: "2025-11-03",
      description: "Hosts credential phishing pages for multiple services",
      tags: ["phishing", "credential-theft", "hosting"]
    },
    {
      indicator: "37.0.11.198",
      type: "malicious",
      severity: "medium",
      category: "Scanning/Probing",
      reports: 456,
      lastSeen: "2025-11-05",
      description: "Automated scanning for vulnerable servers and services",
      tags: ["scanning", "reconnaissance", "exploitation"]
    }
  ]
};

// Detect indicator type
export function detectIndicatorType(indicator) {
  const cleaned = indicator.trim().toLowerCase();
  
  // URL detection
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.includes('www.') || /bit\.ly|tinyurl|shorturl/i.test(cleaned)) {
    return 'url';
  }
  
  // Email detection
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return 'email';
  }
  
  // Phone number detection
  if (/^\+?[\d\s\-()]+$/.test(cleaned) && cleaned.replace(/\D/g, '').length >= 7) {
    return 'phone';
  }
  
  // IP address detection
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleaned)) {
    return 'ip';
  }
  
  return 'unknown';
}

// Search local database
export function searchLocalDatabase(indicator, type) {
  if (!type || type === 'unknown') return null;
  
  const dbKey = type === 'url' ? 'urls' : 
                type === 'email' ? 'emails' : 
                type === 'phone' ? 'phones' : 'ips';
  
  const results = THREAT_DATABASE[dbKey].filter(item => 
    item.indicator.toLowerCase().includes(indicator.toLowerCase()) ||
    indicator.toLowerCase().includes(item.indicator.toLowerCase())
  );
  
  return results.length > 0 ? results[0] : null;
}

// Generate reputation score (0-100, lower is worse)
export function calculateReputationScore(severity, reports) {
  const severityScore = {
    'critical': 0,
    'high': 25,
    'medium': 50,
    'low': 75
  };
  
  const base = severityScore[severity] || 100;
  const reportPenalty = Math.min(reports / 100, 25); // Max 25 point penalty
  
  return Math.max(0, Math.round(base - reportPenalty));
}

// Get threat color
export function getThreatColor(severity) {
  const colors = {
    'critical': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
    'high': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
    'medium': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    'low': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
    'safe': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' }
  };
  
  return colors[severity] || colors.safe;
}
