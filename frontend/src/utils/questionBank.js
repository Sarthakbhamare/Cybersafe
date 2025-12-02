// Centralized Question Bank - Auto-generated from existing threat data

export const QUESTION_BANK = [
  // === STUDENT CATEGORY (Social Media, Jobs, Gaming) ===
  {
    id: "STU001",
    category: "social_media",
    difficulty: "easy",
    question: "Which email looks suspicious?",
    options: [
      { text: "support@netflix.com - Your account will be suspended", correct: false },
      { text: "noreply@netfl1x-security.com - Verify your account now!", correct: true },
      { text: "billing@netflix.com - Payment receipt for your subscription", correct: false },
    ],
    explanation: "The second email has a suspicious domain (netfl1x instead of netflix) and uses urgency tactics typical of phishing.",
    tags: ["phishing", "email", "students"]
  },
  {
    id: "STU002",
    category: "job_scams",
    difficulty: "easy",
    question: "Which job offer is likely a scam?",
    options: [
      { text: "Software Engineer at Google - Apply through careers.google.com", correct: false },
      { text: "Data Entry - Earn ₹5000/day working from home - No experience needed!", correct: true },
      { text: "Marketing Intern at local startup - Unpaid but good experience", correct: false },
    ],
    explanation: "Unrealistic pay for simple work and 'no experience needed' for high-paying jobs are red flags.",
    tags: ["job_scams", "employment", "students"]
  },
  {
    id: "STU003",
    category: "financial",
    difficulty: "medium",
    question: "Which website URL is safe for online banking?",
    options: [
      { text: "https://www.hdfc-bank-online.net", correct: false },
      { text: "https://www.hdfcbank.com", correct: true },
      { text: "http://hdfcbank-secure.com", correct: false },
    ],
    explanation: "Official bank websites use HTTPS and the exact bank name. Avoid sites with extra words or HTTP.",
    tags: ["banking", "phishing", "students"]
  },
  {
    id: "STU004",
    category: "social_media",
    difficulty: "easy",
    question: "Someone DMs you: 'Your Instagram will be deleted! Click here to verify'. What should you do?",
    options: [
      { text: "Click the link immediately to save my account", correct: false },
      { text: "Ignore and report the message as spam", correct: true },
      { text: "Reply asking for more details", correct: false },
    ],
    explanation: "Instagram never sends deletion warnings via DMs. This is a classic phishing attempt. Always ignore and report.",
    tags: ["social_media", "phishing", "students"]
  },
  {
    id: "STU005",
    category: "job_scams",
    difficulty: "medium",
    question: "A recruiter on LinkedIn asks you to pay ₹500 registration fee for an internship. Is this legitimate?",
    options: [
      { text: "Yes, registration fees are normal for internships", correct: false },
      { text: "No, legitimate companies never charge registration fees", correct: true },
      { text: "Yes, if they promise to refund it later", correct: false },
    ],
    explanation: "Legitimate employers NEVER ask for money upfront. Registration fee requests are a major red flag for job scams.",
    tags: ["job_scams", "linkedin", "students"]
  },
  {
    id: "STU006",
    category: "gaming",
    difficulty: "easy",
    question: "A website offers 'Free 1000 PUBG UC - Download APK'. What's the risk?",
    options: [
      { text: "No risk - free UC is always good", correct: false },
      { text: "High risk - likely contains malware", correct: true },
      { text: "Safe if the website looks professional", correct: false },
    ],
    explanation: "Modded APKs and free in-game currency offers often contain malware that can steal your data or hack your accounts.",
    tags: ["gaming", "malware", "students"]
  },

  // === PROFESSIONAL CATEGORY (Email, LinkedIn, Corporate) ===
  {
    id: "PRO001",
    category: "corporate",
    difficulty: "hard",
    question: "You receive an urgent email from your 'CEO' requesting a wire transfer of ₹10 lakhs. What should you do?",
    options: [
      { text: "Process it immediately - CEO requests are urgent", correct: false },
      { text: "Verify through phone call or in-person before acting", correct: true },
      { text: "Reply to the email asking for confirmation", correct: false },
    ],
    explanation: "CEO fraud (spear phishing) is common. Always verify high-value requests through multiple channels, never via email alone.",
    tags: ["corporate", "spear_phishing", "professionals"]
  },
  {
    id: "PRO002",
    category: "linkedin",
    difficulty: "medium",
    question: "A LinkedIn connection offers 'exclusive crypto investment' with 30% monthly returns. Red flag?",
    options: [
      { text: "No - LinkedIn connections are trustworthy", correct: false },
      { text: "Yes - unrealistic returns indicate a scam", correct: true },
      { text: "Maybe - depends on their profile connections", correct: false },
    ],
    explanation: "Professional networks are not investment platforms. 30% monthly returns are impossible and indicate a Ponzi scheme.",
    tags: ["investment", "linkedin", "professionals"]
  },
  {
    id: "PRO003",
    category: "email_security",
    difficulty: "medium",
    question: "An email claims to be from IT support asking for your password to 'update security'. What's wrong?",
    options: [
      { text: "Nothing - IT needs passwords for updates", correct: false },
      { text: "IT never asks for passwords via email", correct: true },
      { text: "It's fine if the email looks official", correct: false },
    ],
    explanation: "Legitimate IT departments NEVER ask for passwords. They have admin tools to reset without needing your credentials.",
    tags: ["corporate", "phishing", "professionals"]
  },
  {
    id: "PRO004",
    category: "financial",
    difficulty: "easy",
    question: "You get an SMS: 'Income tax refund of ₹25,000 approved. Click to claim'. Is it real?",
    options: [
      { text: "Yes - income tax refunds are sent via SMS", correct: false },
      { text: "No - tax department doesn't send refund links via SMS", correct: true },
      { text: "Yes, if the link has 'gov.in' in it", correct: false },
    ],
    explanation: "Income tax refunds are credited directly to your bank account. The department never sends SMS with links to claim refunds.",
    tags: ["financial", "phishing", "professionals"]
  },

  // === HOMEMAKER CATEGORY (Shopping, Banking, Bills) ===
  {
    id: "HOM001",
    category: "shopping",
    difficulty: "easy",
    question: "Which online deal looks suspicious?",
    options: [
      { text: "iPhone 14 - ₹15,000 (90% off) - Limited time offer!", correct: true },
      { text: "Kurta set - ₹800 (40% off) - Free delivery", correct: false },
      { text: "Kitchen utensils - ₹500 (20% off) - COD available", correct: false },
    ],
    explanation: "Extremely high discounts (90% off) on expensive items like iPhones are usually scams. Real discounts are typically 10-40%.",
    tags: ["shopping", "ecommerce", "homemakers"]
  },
  {
    id: "HOM002",
    category: "banking",
    difficulty: "medium",
    question: "You receive: 'Your KYC will expire in 24 hours. Update now: [link]'. What should you do?",
    options: [
      { text: "Click the link and update immediately", correct: false },
      { text: "Visit your bank branch or official website to verify", correct: true },
      { text: "Call the number in the message", correct: false },
    ],
    explanation: "Banks never send urgent KYC update links via SMS. Always verify through official bank channels or visit the branch.",
    tags: ["banking", "kyc", "homemakers"]
  },
  {
    id: "HOM003",
    category: "bills",
    difficulty: "easy",
    question: "SMS: 'Electricity will be cut in 2 hours. Pay now: [link]'. Is this how utility companies work?",
    options: [
      { text: "Yes - they send urgent payment links", correct: false },
      { text: "No - they send paper bills and give advance notice", correct: true },
      { text: "Yes, for overdue payments", correct: false },
    ],
    explanation: "Utility companies send physical bills and multiple notices before disconnection. Urgent SMS with payment links are scams.",
    tags: ["bills", "utilities", "homemakers"]
  },
  {
    id: "HOM004",
    category: "shopping",
    difficulty: "medium",
    question: "A WhatsApp forward shows 'Mega Clearance Sale - Amazon - 95% off'. Should you trust it?",
    options: [
      { text: "Yes - WhatsApp forwards from friends are safe", correct: false },
      { text: "No - verify on official Amazon app/website first", correct: true },
      { text: "Yes, if multiple people forwarded it", correct: false },
    ],
    explanation: "Scammers create fake sale announcements that spread via WhatsApp. Always verify deals on official apps/websites.",
    tags: ["shopping", "whatsapp", "homemakers"]
  },

  // === SENIOR CITIZEN CATEGORY (Phone, Bank, Remote Access) ===
  {
    id: "SEN001",
    category: "phone_scams",
    difficulty: "easy",
    question: "Someone calls: 'I am from your bank. Your ATM card is blocked. Share the OTP we sent'. What's wrong?",
    options: [
      { text: "Nothing - banks call to verify OTPs", correct: false },
      { text: "Banks NEVER ask for OTP over phone calls", correct: true },
      { text: "It's okay if they know my account number", correct: false },
    ],
    explanation: "OTP (One Time Password) should NEVER be shared with anyone, including bank staff. This is a common banking fraud tactic.",
    tags: ["banking", "otp", "seniors"]
  },
  {
    id: "SEN002",
    category: "emergency_scams",
    difficulty: "medium",
    question: "Call: 'Your son is in police custody. Send ₹50,000 immediately'. What should you do first?",
    options: [
      { text: "Send money immediately - it's an emergency", correct: false },
      { text: "Call your son directly to verify", correct: true },
      { text: "Ask the caller for police station details", correct: false },
    ],
    explanation: "Emergency scams use panic to rush you into sending money. Always verify by calling your family member directly first.",
    tags: ["emergency", "phone_scams", "seniors"]
  },
  {
    id: "SEN003",
    category: "remote_access",
    difficulty: "hard",
    question: "'Technical support' asks you to install TeamViewer app to fix your phone. Is this safe?",
    options: [
      { text: "Yes - technical support needs remote access", correct: false },
      { text: "No - never install remote access apps for strangers", correct: true },
      { text: "Yes, if they called from a bank number", correct: false },
    ],
    explanation: "Remote access apps like TeamViewer, AnyDesk give complete control of your device. Scammers use them to steal money directly.",
    tags: ["remote_access", "malware", "seniors"]
  },
  {
    id: "SEN004",
    category: "lottery_scams",
    difficulty: "easy",
    question: "SMS: 'Congratulations! You won ₹25 lakhs in KBC lottery. Pay ₹5,000 tax to claim'. Is this real?",
    options: [
      { text: "Yes - lottery winners must pay tax first", correct: false },
      { text: "No - you can't win a lottery you didn't enter", correct: true },
      { text: "Yes, if it mentions KBC", correct: false },
    ],
    explanation: "You cannot win a lottery you never entered. Real lottery taxes are deducted from winnings, never paid upfront.",
    tags: ["lottery", "scam", "seniors"]
  },

  // === RURAL CATEGORY (Government, UPI, Language-specific) ===
  {
    id: "RUR001",
    category: "government",
    difficulty: "easy",
    question: "SMS says PM-KISAN payment stopped. Click link to restart. Is this how government works?",
    options: [
      { text: "Yes - they send SMS with links", correct: false },
      { text: "No - visit bank or use official website only", correct: true },
      { text: "Yes, if SMS mentions PM-KISAN", correct: false },
    ],
    explanation: "Government schemes never send SMS with links to 'restart' payments. Visit your bank branch or use official pmkisan.gov.in website.",
    tags: ["government", "pm_kisan", "rural"]
  },
  {
    id: "RUR002",
    category: "upi_scams",
    difficulty: "medium",
    question: "Someone sends you a UPI payment request for ₹1. They say 'Accept to receive ₹500 prize'. What happens if you accept?",
    options: [
      { text: "You'll receive ₹500", correct: false },
      { text: "You'll pay ₹1 (money goes OUT, not IN)", correct: true },
      { text: "Nothing - it's just ₹1", correct: false },
    ],
    explanation: "Payment REQUESTS mean money goes OUT of your account. Scammers trick people by claiming it's a prize. Never accept unknown requests.",
    tags: ["upi", "payment", "rural"]
  },
  {
    id: "RUR003",
    category: "qr_code",
    difficulty: "medium",
    question: "A shopkeeper shows you a QR code to 'receive' payment for vegetables. What's the risk?",
    options: [
      { text: "No risk - QR codes are always safe", correct: false },
      { text: "High risk - ensure it's a payment OUT, not request IN", correct: true },
      { text: "Safe if it's a PhonePe/GPay QR", correct: false },
    ],
    explanation: "Scammers show QR codes that are payment REQUESTS (money goes out). Always check the screen shows 'Pay' not 'Collect'.",
    tags: ["qr_code", "upi", "rural"]
  },
  {
    id: "RUR004",
    category: "aadhaar",
    difficulty: "easy",
    question: "Someone calls asking for Aadhaar number to 'update government records'. Should you share it?",
    options: [
      { text: "Yes - Aadhaar updates need the number", correct: false },
      { text: "No - never share Aadhaar over phone calls", correct: true },
      { text: "Yes, if they mention your village name", correct: false },
    ],
    explanation: "Government officials never call asking for Aadhaar numbers. Visit your local CSC center or bank for any Aadhaar work.",
    tags: ["aadhaar", "identity", "rural"]
  },

  // === CROSS-CATEGORY (General Cybersecurity) ===
  {
    id: "GEN001",
    category: "general",
    difficulty: "easy",
    question: "What does 'HTTPS' in a website URL indicate?",
    options: [
      { text: "The website is 100% safe and legitimate", correct: false },
      { text: "The connection is encrypted, but doesn't guarantee legitimacy", correct: true },
      { text: "It's a government website", correct: false },
    ],
    explanation: "HTTPS means encrypted connection, but scam websites can also use HTTPS. Always check the full URL and website authenticity.",
    tags: ["general", "web_safety", "all"]
  },
  {
    id: "GEN002",
    category: "general",
    difficulty: "medium",
    question: "How many people should you share your OTP (One Time Password) with?",
    options: [
      { text: "Only bank staff and trusted people", correct: false },
      { text: "Nobody - never share OTP with anyone", correct: true },
      { text: "Family members for emergencies", correct: false },
    ],
    explanation: "OTP should NEVER be shared with ANYONE - not even bank staff, police, or family. It's your digital signature for transactions.",
    tags: ["otp", "general", "all"]
  },
  {
    id: "GEN003",
    category: "general",
    difficulty: "easy",
    question: "You get a call: 'Press 1 to talk to customer care, Press 2 to block fraud'. What should you do?",
    options: [
      { text: "Press 1 to clarify what's happening", correct: false },
      { text: "Hang up and call the official number yourself", correct: true },
      { text: "Press 2 to block the fraud", correct: false },
    ],
    explanation: "Automated fraud calls trick you into pressing buttons. Always hang up and call the official customer care number yourself.",
    tags: ["phone_scams", "general", "all"]
  },
  {
    id: "GEN004",
    category: "general",
    difficulty: "medium",
    question: "What's the safest way to verify if a message from 'your bank' is real?",
    options: [
      { text: "Click links in the message to check", correct: false },
      { text: "Visit bank branch or call official number from bank's website", correct: true },
      { text: "Reply to the message asking for confirmation", correct: false },
    ],
    explanation: "Never trust messages claiming to be from your bank. Visit the branch or find the official number from the bank's website/passbook.",
    tags: ["banking", "verification", "all"]
  },
  {
    id: "GEN005",
    category: "general",
    difficulty: "easy",
    question: "Someone forwards a WhatsApp message: 'Share this to 10 people or your account will be closed'. What is this?",
    options: [
      { text: "A legitimate warning from WhatsApp", correct: false },
      { text: "A fake chain message - ignore it", correct: true },
      { text: "Important - better to share just in case", correct: false },
    ],
    explanation: "Chain messages are hoaxes designed to spread panic. WhatsApp never sends warnings through user forwards. Ignore and don't spread.",
    tags: ["whatsapp", "hoax", "all"]
  },

  // === MORE STUDENT QUESTIONS (From Feed Stories) ===
  {
    id: "STU007",
    category: "scholarship",
    difficulty: "medium",
    question: "WhatsApp message: 'Govt scholarship - Pay ₹500 processing fee'. Is this legitimate?",
    options: [
      { text: "Yes - processing fees are normal", correct: false },
      { text: "No - government scholarships are always free", correct: true },
      { text: "Maybe - depends on the scholarship", correct: false },
    ],
    explanation: "Government scholarships NEVER require processing fees. This is a common scam targeting students.",
    tags: ["scholarship", "whatsapp", "students"]
  },
  {
    id: "STU008",
    category: "gaming",
    difficulty: "easy",
    question: "A website offers: 'Play this game tournament, pay ₹100 entry fee, win ₹10,000'. Red flag?",
    options: [
      { text: "No - tournaments have entry fees", correct: false },
      { text: "Yes - if the website is not from official game developers", correct: true },
      { text: "No - the prize amount seems fair", correct: false },
    ],
    explanation: "Fake gaming tournaments with entry fees are scams. Only participate in tournaments from official game developers/platforms.",
    tags: ["gaming", "tournament", "students"]
  },
  {
    id: "STU009",
    category: "social_media",
    difficulty: "medium",
    question: "A 'friend' on Instagram asks: 'Can you vote for me in this contest? Click here'. What's the risk?",
    options: [
      { text: "No risk - it's just voting", correct: false },
      { text: "Phishing link - could steal your Instagram login", correct: true },
      { text: "Safe if the friend's profile looks real", correct: false },
    ],
    explanation: "Compromised accounts send phishing links disguised as voting/contest requests. The link steals your login credentials.",
    tags: ["social_media", "phishing", "students"]
  },

  // === MORE PROFESSIONAL QUESTIONS ===
  {
    id: "PRO005",
    category: "corporate",
    difficulty: "hard",
    question: "Email: 'Vendor invoice attached - Updated banking details'. What should you verify FIRST?",
    options: [
      { text: "Check if the attachment has a valid invoice", correct: false },
      { text: "Call vendor using previously known number to confirm", correct: true },
      { text: "Reply asking why banking details changed", correct: false },
    ],
    explanation: "Invoice fraud is common. Banking detail changes MUST be verified through official vendor channels, never via email alone.",
    tags: ["corporate", "invoice", "professionals"]
  },
  {
    id: "PRO006",
    category: "email_security",
    difficulty: "medium",
    question: "How can you spot a spear phishing email impersonating your CEO?",
    options: [
      { text: "Check sender email address carefully for typos", correct: true },
      { text: "CEO emails always have attachments", correct: false },
      { text: "Look for the company logo in the signature", correct: false },
    ],
    explanation: "Spear phishing emails use similar-looking addresses (ceo@cornpany.com vs company.com). Always verify sender address character by character.",
    tags: ["spear_phishing", "email", "professionals"]
  },

  // === MORE HOMEMAKER QUESTIONS ===
  {
    id: "HOM005",
    category: "shopping",
    difficulty: "easy",
    question: "A shopping website asks for your card CVV to 'verify' your identity. Is this normal?",
    options: [
      { text: "Yes - CVV is needed for verification", correct: false },
      { text: "No - CVV is only for making payments, never for verification", correct: true },
      { text: "Yes, if it's a trusted brand", correct: false },
    ],
    explanation: "CVV (3-digit code) should ONLY be entered during payment. No website should ask for CVV for 'verification' purposes.",
    tags: ["shopping", "card_security", "homemakers"]
  },
  {
    id: "HOM006",
    category: "banking",
    difficulty: "medium",
    question: "Your bank app shows 'Update required' message. What's the safest way to update?",
    options: [
      { text: "Click the update button in the message", correct: false },
      { text: "Go to Google Play/App Store and update from there", correct: true },
      { text: "Uninstall and download from the link in message", correct: false },
    ],
    explanation: "Always update banking apps from official app stores, never from links in messages. Fake update messages install malware.",
    tags: ["banking", "app_security", "homemakers"]
  },

  // === MORE SENIOR CITIZEN QUESTIONS ===
  {
    id: "SEN005",
    category: "pension",
    difficulty: "easy",
    question: "Call: 'Your pension is stopped. Install this app to restart'. What's the trap?",
    options: [
      { text: "The app will help restart pension", correct: false },
      { text: "The app gives scammers control of your phone", correct: true },
      { text: "No trap - government apps are safe", correct: false },
    ],
    explanation: "Never install apps from phone calls. The app is likely remote access software that lets scammers control your device and steal money.",
    tags: ["pension", "remote_access", "seniors"]
  },
  {
    id: "SEN006",
    category: "health_scams",
    difficulty: "medium",
    question: "Call: 'Your son had an accident, hospitalized. Send ₹1 lakh immediately for surgery'. What to do?",
    options: [
      { text: "Send money immediately - it's an emergency", correct: false },
      { text: "Call your son first to verify, then hospital", correct: true },
      { text: "Ask for hospital details and go there", correct: false },
    ],
    explanation: "Medical emergency scams use panic to rush you. ALWAYS call your family member first to verify before sending any money.",
    tags: ["emergency", "health", "seniors"]
  },

  // === MORE RURAL QUESTIONS ===
  {
    id: "RUR005",
    category: "government",
    difficulty: "easy",
    question: "SMS: 'Ration card will be cancelled. Update Aadhaar: [link]'. Is this how government contacts people?",
    options: [
      { text: "Yes - government sends SMS links", correct: false },
      { text: "No - visit ration office or bank for Aadhaar work", correct: true },
      { text: "Yes, for urgent updates", correct: false },
    ],
    explanation: "Government never sends cancellation threats via SMS with links. Visit your local ration office or bank for any Aadhaar linking work.",
    tags: ["ration", "aadhaar", "rural"]
  },
  {
    id: "RUR006",
    category: "upi_scams",
    difficulty: "hard",
    question: "You scan a QR code at a shop. Screen shows 'Enter amount'. Is the QR code correct?",
    options: [
      { text: "Yes - you always enter the amount", correct: true },
      { text: "No - amount should be pre-filled by shopkeeper", correct: false },
      { text: "Doesn't matter - any QR code works", correct: false },
    ],
    explanation: "When YOU scan a QR, YOU enter amount (you're paying). When SHOPKEEPER scans YOUR QR, amount is pre-filled (you're receiving). This QR is correct.",
    tags: ["qr_code", "upi", "rural"]
  },

  // === ADDITIONAL QUESTIONS - ADVANCED SCENARIOS ===
  {
    id: "ADV001",
    category: "social_media",
    difficulty: "hard",
    question: "Your friend's Instagram account sends you: 'OMG check out this embarrassing video of you!' with a link. What's happening?",
    options: [
      { text: "My friend found an embarrassing video", correct: false },
      { text: "Their account is hacked, it's a phishing link", correct: true },
      { text: "It's a prank from my friend", correct: false },
    ],
    explanation: "Compromised accounts send urgent/embarrassing messages to steal more accounts. Never click links claiming to show videos/photos of you.",
    tags: ["social_media", "phishing", "students"]
  },
  {
    id: "ADV002",
    category: "financial",
    difficulty: "medium",
    question: "You receive: 'Refund of ₹12,450 approved. Download our app to claim'. What's the scam?",
    options: [
      { text: "The app is malware that steals banking credentials", correct: true },
      { text: "No scam - refunds need app download", correct: false },
      { text: "The amount is wrong, otherwise legitimate", correct: false },
    ],
    explanation: "Fake refund notifications trick you into downloading malicious apps. Real refunds are credited directly, never requiring app downloads.",
    tags: ["malware", "financial", "all"]
  },
  {
    id: "ADV003",
    category: "job_scams",
    difficulty: "easy",
    question: "Job ad: 'Earn ₹50,000/month by watching YouTube videos - WhatsApp us'. Red flag?",
    options: [
      { text: "No - YouTube pays for views", correct: false },
      { text: "Yes - classic work-from-home scam", correct: true },
      { text: "Maybe - depends on the company", correct: false },
    ],
    explanation: "Nobody pays huge amounts for watching videos. These scams collect registration fees or steal personal data.",
    tags: ["job_scams", "whatsapp", "students"]
  },
  {
    id: "ADV004",
    category: "corporate",
    difficulty: "hard",
    question: "Email from 'IT@company.com' (your company is company.co.in): 'Password expires in 2 hours'. What's wrong?",
    options: [
      { text: "Domain is wrong - .com instead of .co.in", correct: true },
      { text: "Nothing - IT emails look like this", correct: false },
      { text: "2 hours is too urgent, otherwise fine", correct: false },
    ],
    explanation: "Spear phishers use similar but wrong domains. Always check sender domain matches your company's exact domain.",
    tags: ["spear_phishing", "corporate", "professionals"]
  },
  {
    id: "ADV005",
    category: "upi_scams",
    difficulty: "medium",
    question: "Someone sends ₹1 to your UPI, then calls: 'I sent wrong amount, send back ₹5000'. What's the trick?",
    options: [
      { text: "They genuinely made a mistake", correct: false },
      { text: "They'll claim you stole money and threaten legal action", correct: true },
      { text: "UPI will reverse their ₹1 automatically", correct: false },
    ],
    explanation: "Scammers send small amounts, then pressure victims to send large amounts back by threatening police complaints.",
    tags: ["upi", "scam", "rural"]
  },
  {
    id: "ADV006",
    category: "shopping",
    difficulty: "easy",
    question: "Website offers: 'Original iPhone 15 Pro - ₹9,999 - Limited stock'. How to verify?",
    options: [
      { text: "Check if website has HTTPS", correct: false },
      { text: "Compare with Apple's official price (₹1,30,000+)", correct: true },
      { text: "Read customer reviews on the website", correct: false },
    ],
    explanation: "Price too good to be true is the biggest red flag. iPhone 15 Pro costs ₹1.3 lakh+. No legitimate seller offers 90% off.",
    tags: ["shopping", "price_scam", "homemakers"]
  },
  {
    id: "ADV007",
    category: "phone_scams",
    difficulty: "medium",
    question: "Caller: 'I'm from cybercrime police. Your name is in drug trafficking case. Pay ₹2 lakhs fine to avoid arrest'. What to do?",
    options: [
      { text: "Pay immediately to avoid arrest", correct: false },
      { text: "Hang up - police never demand money over phone", correct: true },
      { text: "Ask for their officer ID number", correct: false },
    ],
    explanation: "Police never call demanding money over phone. They send official summons/notices. This is intimidation fraud.",
    tags: ["phone_scams", "intimidation", "seniors"]
  },
  {
    id: "ADV008",
    category: "email_security",
    difficulty: "hard",
    question: "Email with attachment 'Invoice_Q4.pdf.exe'. What's suspicious about the filename?",
    options: [
      { text: "Nothing - it's a PDF invoice", correct: false },
      { text: ".exe extension means it's executable malware, not a PDF", correct: true },
      { text: "Q4 should be written as Quarter 4", correct: false },
    ],
    explanation: "Attackers hide malware with double extensions like .pdf.exe. Real PDFs end with just .pdf, never .exe.",
    tags: ["malware", "email", "professionals"]
  },
  {
    id: "ADV009",
    category: "government",
    difficulty: "easy",
    question: "SMS: 'Aadhaar-PAN linking failed. Re-link within 24 hours: [link]'. Is this real?",
    options: [
      { text: "Yes - linking has deadlines", correct: false },
      { text: "No - government doesn't send urgent SMS with links", correct: true },
      { text: "Maybe - check if link has .gov.in", correct: false },
    ],
    explanation: "Government never sends urgent SMS with links for Aadhaar/PAN work. Visit bank or use official incometax.gov.in website.",
    tags: ["government", "aadhaar", "rural"]
  },
  {
    id: "ADV010",
    category: "gaming",
    difficulty: "medium",
    question: "Message: 'You won Free Fire diamond giveaway! Click to claim: bit.ly/xxxxx'. Safe to click?",
    options: [
      { text: "Yes - bit.ly links are always safe", correct: false },
      { text: "No - shortened URLs hide the real destination", correct: true },
      { text: "Yes, if many people shared it", correct: false },
    ],
    explanation: "Shortened URLs (bit.ly, tinyurl) hide the actual destination. Giveaway scams use them to spread phishing/malware.",
    tags: ["gaming", "phishing", "students"]
  },
  {
    id: "ADV011",
    category: "banking",
    difficulty: "medium",
    question: "Your bank app asks for fingerprint/face unlock. Is this normal?",
    options: [
      { text: "No - banks never use biometric unlock", correct: false },
      { text: "Yes - legitimate security feature for app access", correct: true },
      { text: "Only if you enabled it first", correct: false },
    ],
    explanation: "Biometric unlock for banking apps is a legitimate security feature. But NEVER use biometrics for OTP/transaction approval.",
    tags: ["banking", "biometric", "all"]
  },
  {
    id: "ADV012",
    category: "scholarship",
    difficulty: "easy",
    question: "WhatsApp: 'PM scholarship - Send Aadhaar photo + bank passbook photo'. Should you send?",
    options: [
      { text: "Yes - scholarships need these documents", correct: false },
      { text: "No - never share document photos via WhatsApp", correct: true },
      { text: "Yes, but blur sensitive parts", correct: false },
    ],
    explanation: "Government scholarships are applied through official portals, never WhatsApp. Document photos can be misused for identity theft.",
    tags: ["scholarship", "identity_theft", "students"]
  },
  {
    id: "ADV013",
    category: "linkedin",
    difficulty: "hard",
    question: "LinkedIn connection offers: 'Part-time crypto trading mentor role - ₹30,000/month'. What's the real goal?",
    options: [
      { text: "Legitimate mentorship opportunity", correct: false },
      { text: "Get you to invest in fake crypto scheme", correct: true },
      { text: "Recruit you for a real crypto company", correct: false },
    ],
    explanation: "Crypto job offers on LinkedIn are often fronts for investment scams. They pitch you to invest, not actually hire you.",
    tags: ["linkedin", "crypto", "professionals"]
  },
  {
    id: "ADV014",
    category: "emergency_scams",
    difficulty: "medium",
    question: "Unknown number: 'Dad, I'm in jail. Don't call my phone, it's seized. Send ₹50,000 to this account'. How to verify?",
    options: [
      { text: "Send money immediately - it's urgent", correct: false },
      { text: "Call your child's known number first", correct: true },
      { text: "Ask for police station address", correct: false },
    ],
    explanation: "Emergency scams impersonate your children. Always verify by calling your child's actual number before sending money.",
    tags: ["emergency", "impersonation", "seniors"]
  },
  {
    id: "ADV015",
    category: "bills",
    difficulty: "easy",
    question: "SMS: 'Electricity bill overdue - ₹850. Pay via this link to avoid disconnection'. How to pay safely?",
    options: [
      { text: "Click the link and pay", correct: false },
      { text: "Open official electricity board app/website yourself", correct: true },
      { text: "Call the number in the SMS", correct: false },
    ],
    explanation: "Never use links from bill payment SMS. Open the official app/website yourself to verify and pay bills.",
    tags: ["bills", "phishing", "homemakers"]
  },
  {
    id: "ADV016",
    category: "remote_access",
    difficulty: "hard",
    question: "Which of these apps is used by scammers for remote control of your phone?",
    options: [
      { text: "WhatsApp", correct: false },
      { text: "AnyDesk / TeamViewer / QuickSupport", correct: true },
      { text: "Google Pay", correct: false },
    ],
    explanation: "AnyDesk, TeamViewer, QuickSupport are remote desktop apps. Scammers trick victims into installing them for full device control.",
    tags: ["remote_access", "malware", "seniors"]
  },
  {
    id: "ADV017",
    category: "general",
    difficulty: "medium",
    question: "Your friend forwards: 'Forward to 10 people or WhatsApp will delete your account'. What is this?",
    options: [
      { text: "Official WhatsApp warning", correct: false },
      { text: "Fake chain message - ignore it", correct: true },
      { text: "Possible virus, delete WhatsApp", correct: false },
    ],
    explanation: "Chain messages are hoaxes. WhatsApp never sends warnings through user forwards. Ignore and don't spread.",
    tags: ["whatsapp", "hoax", "all"]
  },
  {
    id: "ADV018",
    category: "social_media",
    difficulty: "easy",
    question: "Instagram story: 'Tag 3 friends to win iPhone 15'. Is this a real giveaway?",
    options: [
      { text: "Yes - tag friends to participate", correct: false },
      { text: "No - fake giveaways collect followers/data", correct: true },
      { text: "Only if posted by verified accounts", correct: false },
    ],
    explanation: "Fake giveaways collect followers, harvest data, or lead to phishing. Real brand giveaways have clear official rules.",
    tags: ["social_media", "giveaway", "students"]
  },
  {
    id: "ADV019",
    category: "corporate",
    difficulty: "medium",
    question: "Email: 'Update your payroll details by EOD or salary will be withheld'. What should you do?",
    options: [
      { text: "Update immediately using the email link", correct: false },
      { text: "Contact HR department directly to verify", correct: true },
      { text: "Reply to email asking if it's legitimate", correct: false },
    ],
    explanation: "Payroll phishing creates urgency. Always verify salary/payroll emails by contacting HR through known official channels.",
    tags: ["corporate", "phishing", "professionals"]
  },
  {
    id: "ADV020",
    category: "qr_code",
    difficulty: "hard",
    question: "You're RECEIVING money. Shopkeeper says 'Show me your QR code'. What should you do?",
    options: [
      { text: "Show QR from GPay 'Receive Money' section", correct: true },
      { text: "Scan their QR code instead", correct: false },
      { text: "Share UPI ID verbally", correct: false },
    ],
    explanation: "To RECEIVE money, you show YOUR QR (from Receive section) or share UPI ID. Never scan someone else's QR to receive.",
    tags: ["qr_code", "upi", "rural"]
  },
  {
    id: "ADV021",
    category: "pension",
    difficulty: "easy",
    question: "Call: 'Your pension Aadhaar linking failed. Give me your Aadhaar number to fix it'. Should you?",
    options: [
      { text: "Yes - they need it to link", correct: false },
      { text: "No - visit pension office in person", correct: true },
      { text: "Yes, but don't share OTP", correct: false },
    ],
    explanation: "Never share Aadhaar over phone. For pension work, visit the pension office or bank branch in person.",
    tags: ["pension", "aadhaar", "seniors"]
  },
  {
    id: "ADV022",
    category: "financial",
    difficulty: "medium",
    question: "Ad: 'Earn ₹1 lakh daily with AI trading bot - Join now ₹5000'. What's the reality?",
    options: [
      { text: "Real AI can predict stock markets", correct: false },
      { text: "Ponzi scheme - your money funds others' payouts", correct: true },
      { text: "Legitimate if it has good reviews", correct: false },
    ],
    explanation: "Guaranteed high returns are impossible. These are Ponzi schemes where early investors are paid using new investors' money.",
    tags: ["financial", "ponzi", "professionals"]
  },
  {
    id: "ADV023",
    category: "shopping",
    difficulty: "hard",
    question: "Online payment page shows 'HTTP' in URL (not HTTPS). What does this mean?",
    options: [
      { text: "Website is slightly older but safe", correct: false },
      { text: "Connection is not encrypted - don't enter card details", correct: true },
      { text: "HTTP is fine for small purchases under ₹500", correct: false },
    ],
    explanation: "HTTP means unencrypted connection. Your card details can be intercepted. Only enter payment info on HTTPS sites.",
    tags: ["shopping", "web_security", "homemakers"]
  },
  {
    id: "ADV024",
    category: "kyc",
    difficulty: "medium",
    question: "Call: 'Your bank KYC expires today. Update via video call with me'. Is this how banks update KYC?",
    options: [
      { text: "Yes - video KYC is the new process", correct: false },
      { text: "No - video KYC is done through official bank app, not calls", correct: true },
      { text: "Yes, if they know your account number", correct: false },
    ],
    explanation: "Video KYC is real but done through official bank apps, not random phone calls. Scammers use video calls to get your documents on camera.",
    tags: ["kyc", "banking", "homemakers"]
  },
  {
    id: "ADV025",
    category: "job_scams",
    difficulty: "hard",
    question: "Interview went well. Recruiter says: 'Buy company laptop (₹40,000) from our vendor, refundable after joining'. Red flag?",
    options: [
      { text: "Normal - many companies do this", correct: false },
      { text: "Scam - real companies provide equipment free", correct: true },
      { text: "Fair if refund is in writing", correct: false },
    ],
    explanation: "Legitimate companies provide laptops/equipment free. Asking candidates to purchase equipment is a classic employment scam.",
    tags: ["job_scams", "employment", "students"]
  },
  {
    id: "ADV026",
    category: "lottery",
    difficulty: "easy",
    question: "Email: 'You won $1 million in Microsoft lucky draw'. How did you win without entering?",
    options: [
      { text: "My email was randomly selected", correct: false },
      { text: "You can't win a lottery you didn't enter - it's fake", correct: true },
      { text: "Microsoft does random email draws", correct: false },
    ],
    explanation: "You cannot win a lottery/draw you never entered. All such emails are scams to steal personal info or money for 'processing fees'.",
    tags: ["lottery", "email", "seniors"]
  },
  {
    id: "ADV027",
    category: "health_scams",
    difficulty: "medium",
    question: "Ad: 'Cure diabetes permanently in 7 days - ₹15,000 course'. Should you trust it?",
    options: [
      { text: "Yes - many people are sharing it", correct: false },
      { text: "No - diabetes has no permanent cure yet", correct: true },
      { text: "Try it once to verify", correct: false },
    ],
    explanation: "Medical scams exploit desperate patients. Diabetes currently has no permanent cure. Such claims are fake and potentially dangerous.",
    tags: ["health", "medical_fraud", "seniors"]
  },
  {
    id: "ADV028",
    category: "general",
    difficulty: "easy",
    question: "What's the safest way to create passwords?",
    options: [
      { text: "Use your birthdate for easy memory", correct: false },
      { text: "Long mix of letters, numbers, symbols - unique per account", correct: true },
      { text: "Use same strong password everywhere", correct: false },
    ],
    explanation: "Strong passwords are 12+ characters with mix of upper/lowercase, numbers, symbols. Use different passwords for different accounts.",
    tags: ["password", "security", "all"]
  },
  {
    id: "ADV029",
    category: "social_media",
    difficulty: "hard",
    question: "Someone creates a fake profile using your photos and friends. What's this called?",
    options: [
      { text: "Identity theft", correct: false },
      { text: "Catfishing / Impersonation", correct: true },
      { text: "Hacking", correct: false },
    ],
    explanation: "Impersonation/catfishing is when someone creates fake profiles using your identity. Report to platform immediately and warn friends.",
    tags: ["social_media", "impersonation", "students"]
  },
  {
    id: "ADV030",
    category: "upi_scams",
    difficulty: "medium",
    question: "After scanning QR, screen shows 'Collect ₹500 from [your name]'. What does this mean?",
    options: [
      { text: "You will receive ₹500", correct: false },
      { text: "You will PAY ₹500 - it's a request, not payment", correct: true },
      { text: "It's scanning your account balance", correct: false },
    ],
    explanation: "'Collect from you' means money goes OUT. Scammers show QR codes that are payment requests (collect) not payment methods.",
    tags: ["upi", "qr_code", "rural"]
  },
  {
    id: "ADV031",
    category: "corporate",
    difficulty: "hard",
    question: "Email from 'vendor@company-invoices.com' has invoice PDF. Your actual vendor is 'vendor@company.com'. What's wrong?",
    options: [
      { text: "Nothing - companies use multiple domains", correct: false },
      { text: "Different domain - likely invoice fraud", correct: true },
      { text: "Just check if invoice details match", correct: false },
    ],
    explanation: "Invoice fraud uses similar but different domains. Always verify vendor emails match their official domain exactly before paying.",
    tags: ["corporate", "invoice_fraud", "professionals"]
  },
  {
    id: "ADV032",
    category: "phishing",
    difficulty: "medium",
    question: "Email has your correct name, address, and recent purchase details. Does this prove it's legitimate?",
    options: [
      { text: "Yes - only real companies have this info", correct: false },
      { text: "No - scammers buy data from breaches", correct: true },
      { text: "Probably yes, unless you suspect", correct: false },
    ],
    explanation: "Data breaches leak personal info that scammers use to make phishing look legitimate. Always verify through official channels.",
    tags: ["phishing", "data_breach", "all"]
  },
  {
    id: "ADV033",
    category: "government",
    difficulty: "easy",
    question: "Which is the ONLY official domain for Indian government websites?",
    options: [
      { text: ".gov.in", correct: true },
      { text: ".govt.in or .gov.in", correct: false },
      { text: ".in or .gov.in", correct: false },
    ],
    explanation: "All official Indian government websites end with .gov.in ONLY. Avoid sites with .govt.in, .org, .com claiming to be government.",
    tags: ["government", "web_security", "rural"]
  },
  {
    id: "ADV034",
    category: "ration",
    difficulty: "medium",
    question: "SMS: 'Ration card holders get ₹3000 COVID relief. Click here to apply'. Is this real?",
    options: [
      { text: "Yes - government announced relief", correct: false },
      { text: "No - verify on official state government website first", correct: true },
      { text: "Yes, if SMS mentions your ration card number", correct: false },
    ],
    explanation: "Fake relief schemes spread via SMS. Always verify on official state government websites or visit ration office in person.",
    tags: ["ration", "government", "rural"]
  },
  {
    id: "ADV035",
    category: "app_security",
    difficulty: "easy",
    question: "App requests: 'Allow access to Contacts, SMS, Camera, Location'. Should you allow all?",
    options: [
      { text: "Yes - apps need permissions to work", correct: false },
      { text: "No - only grant permissions the app actually needs", correct: true },
      { text: "Yes, for trusted apps only", correct: false },
    ],
    explanation: "Grant minimum permissions. Why does a flashlight app need your contacts? Unnecessary permissions are red flags.",
    tags: ["app_security", "privacy", "students"]
  },
];

// Helper function to get daily questions (5 random per day)
export const getDailyQuestions = (count = 5) => {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Shuffle array based on daily seed
  const shuffled = [...QUESTION_BANK].sort(() => {
    const random = Math.sin(seed) * 10000;
    return random - Math.floor(random);
  });
  
  return shuffled.slice(0, count);
};

// Get questions by category
export const getQuestionsByCategory = (category) => {
  return QUESTION_BANK.filter(q => q.category === category);
};

// Get questions by difficulty
export const getQuestionsByDifficulty = (difficulty) => {
  return QUESTION_BANK.filter(q => q.difficulty === difficulty);
};

// Get questions by tags
export const getQuestionsByTag = (tag) => {
  return QUESTION_BANK.filter(q => q.tags.includes(tag));
};

// Get random questions
export const getRandomQuestions = (count = 10) => {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const CATEGORIES = {
  social_media: { icon: "📱", label: "Social Media" },
  job_scams: { icon: "💼", label: "Job Scams" },
  gaming: { icon: "🎮", label: "Gaming" },
  corporate: { icon: "🏢", label: "Corporate" },
  linkedin: { icon: "💼", label: "LinkedIn" },
  email_security: { icon: "📧", label: "Email Security" },
  shopping: { icon: "🛒", label: "Shopping" },
  banking: { icon: "🏦", label: "Banking" },
  bills: { icon: "💡", label: "Bills" },
  phone_scams: { icon: "📞", label: "Phone Scams" },
  emergency_scams: { icon: "🚨", label: "Emergency" },
  remote_access: { icon: "💻", label: "Remote Access" },
  government: { icon: "🏛️", label: "Government" },
  upi_scams: { icon: "💰", label: "UPI" },
  general: { icon: "🛡️", label: "General" },
};
