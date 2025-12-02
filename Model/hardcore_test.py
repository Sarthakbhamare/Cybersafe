"""
HARDCORE TESTING: Generalized Model on Completely Unseen Domains and Sophisticated Scams
Testing with domains and patterns that were NEVER in the training data
"""

import joblib
import pandas as pd
import numpy as np
from scipy.sparse import hstack, csr_matrix
import sys

print("="*80)
print("🔥 HARDCORE TESTING - Unseen Domains & Sophisticated Scams")
print("="*80)

# Load the generalized model
print("\n📦 Loading generalized model...")
model = joblib.load('artifacts/scam_detector_generalized.joblib')
vectorizer = joblib.load('artifacts/tfidf_vectorizer_generalized.joblib')
scaler = joblib.load('artifacts/feature_scaler_generalized.joblib')
print("✓ Model loaded!\n")

# Import functions from training script
from train_generalized_model import preprocess_text, extract_generalized_features

# HARDCORE TEST CASES - Completely Unseen Domains and Sophisticated Patterns
hardcore_tests = [
    # === TYPOSQUATTING & BRAND IMPERSONATION ===
    {
        "category": "Typosquatting - WhatsApp",
        "message": "WhatsApp verification: Your code is 642311. If you didn't request this, enter it at http://wa-verif-sec.com",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - PayPal",
        "message": "URGENT: Your PayPal account has been suspended. Verify immediately at paypal-secure-login.com",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - Amazon",
        "message": "Your Amazon package is delayed. Track it here: amazon-track-delivery.xyz",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - Apple",
        "message": "Your Apple ID will be locked. Verify now at apple-verify-account.site",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - Netflix",
        "message": "Netflix: Your subscription expired. Renew immediately: netflix-renew-premium.online",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - Microsoft",
        "message": "Microsoft Security Alert: Suspicious activity detected. Verify at microsoft-security-alert.tech",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Typosquatting - Google",
        "message": "Google Account: Unusual sign-in attempt. Secure your account: google-account-secure.space",
        "expected": "scam",
        "difficulty": "HARD"
    },
    
    # === SOPHISTICATED TLD SCAMS ===
    {
        "category": "Suspicious TLD - .xyz",
        "message": "Congratulations! You've been selected for a $500 gift card. Claim here: prizewin-2025.xyz",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Suspicious TLD - .top",
        "message": "Your account verification is pending. Complete now: secure-verification.top",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Suspicious TLD - .club",
        "message": "Join our exclusive members club and get 90% OFF! Visit: premium-deals.club",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Suspicious TLD - .bid",
        "message": "You won an auction! Claim your prize at winner-notification.bid",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Suspicious TLD - .loan",
        "message": "Pre-approved for $50,000 loan! No credit check needed: instant-approval.loan",
        "expected": "scam",
        "difficulty": "HARD"
    },
    
    # === IP-BASED PHISHING ===
    {
        "category": "IP-based URL",
        "message": "Your bank account needs verification. Login here: http://192.168.100.50/banking/secure",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "IP-based with port",
        "message": "Click to verify your identity: http://203.45.89.12:8080/verify",
        "expected": "scam",
        "difficulty": "EXTREME"
    },
    
    # === URL SHORTENER SCAMS ===
    {
        "category": "URL Shortener - bit.ly",
        "message": "You've received a payment! Click to view: https://bit.ly/3xKm9Pq",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    {
        "category": "URL Shortener - tinyurl",
        "message": "URGENT: Reset your password immediately: https://tinyurl.com/sec-reset-2025",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    {
        "category": "URL Shortener - cutt.ly",
        "message": "Your package is ready for pickup. Details: https://cutt.ly/pkgtrack99",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    
    # === SUSPICIOUS DOMAIN PATTERNS ===
    {
        "category": "Multiple Hyphens",
        "message": "Account alert: Update required at secure-account-verify-now.com",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Number Substitution",
        "message": "Your amaz0n order #12345 has shipped. Track: amaz0n-tracking.com",
        "expected": "scam",
        "difficulty": "EXTREME"
    },
    {
        "category": "Long Domain Name",
        "message": "Verify your account at verificationandaccountsecurityserviceonline.com",
        "expected": "scam",
        "difficulty": "HARD"
    },
    
    # === FINANCIAL SCAMS ===
    {
        "category": "Fake Prize",
        "message": "CONGRATULATIONS! You won $10,000! Claim at winner-2025-official.site immediately!",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    {
        "category": "Tax Refund Scam",
        "message": "IRS: You have a pending tax refund of $1,247. Claim now: irs-refund-claim.work",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Crypto Scam",
        "message": "Elon Musk is giving away Bitcoin! Double your crypto: btc-giveaway-official.xyz",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Investment Scam",
        "message": "Make $5000/day working from home! Join now: easy-money-system.biz",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    
    # === URGENCY TACTICS ===
    {
        "category": "Account Suspension",
        "message": "URGENT: Your account will be suspended in 24 hours. Verify now at account-urgent-verify.online",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "Time-Limited Offer",
        "message": "EXPIRES TONIGHT: Exclusive offer for you! Act now: limited-offer-2025.club",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
    {
        "category": "Account Frozen",
        "message": "Your account has been frozen due to suspicious activity. Unlock: account-unfreeze-now.space",
        "expected": "scam",
        "difficulty": "HARD"
    },
    
    # === LEGITIMATE MESSAGES (Should NOT be flagged) ===
    {
        "category": "Legitimate Bank",
        "message": "Your Chase account ending in 1234 was charged $45.99 for Netflix on 11/13/2025. Text STOP to unsubscribe.",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    {
        "category": "Legitimate OTP",
        "message": "Your verification code is 847291. Valid for 10 minutes. Do not share this code.",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    {
        "category": "Legitimate Delivery",
        "message": "Your UPS package #1Z9999999999999999 will arrive today between 2-6 PM.",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    {
        "category": "Legitimate Appointment",
        "message": "Reminder: Your doctor's appointment is tomorrow at 3:00 PM. Reply C to confirm or R to reschedule.",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    {
        "category": "Legitimate Work",
        "message": "Meeting rescheduled to 3pm tomorrow. Conference room B. -Sarah",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    {
        "category": "Legitimate Order Confirmation",
        "message": "Thank you for your order! Order #12345 confirmed. Estimated delivery: Nov 15-17.",
        "expected": "ham",
        "difficulty": "TRICKY"
    },
    
    # === EDGE CASES & ADVERSARIAL ===
    {
        "category": "Mixed Content",
        "message": "Hi mom, I got the package. By the way, check this deal: super-discount-2025.xyz",
        "expected": "scam",
        "difficulty": "EXTREME"
    },
    {
        "category": "Misspelled Words",
        "message": "Acct suspendd. Verrify imedietly at acct-verify-secure.online",
        "expected": "scam",
        "difficulty": "HARD"
    },
    {
        "category": "No URL (Text Only)",
        "message": "CONGRATULATIONS! YOU WON $10,000! CALL NOW: 1-800-555-SCAM",
        "expected": "scam",
        "difficulty": "MEDIUM"
    },
]

print(f"Total test cases: {len(hardcore_tests)}\n")

# Run tests
results = []
correct = 0
total = 0

print("="*80)
print("TESTING RESULTS")
print("="*80)

for i, test in enumerate(hardcore_tests, 1):
    msg = test["message"]
    expected = test["expected"]
    category = test["category"]
    difficulty = test["difficulty"]
    
    # Preprocess and extract features
    processed = preprocess_text(msg)
    features = extract_generalized_features(msg)
    feat_df = pd.DataFrame([features])
    
    # Predict
    X_text = vectorizer.transform([processed])
    X_feat = scaler.transform(feat_df)
    X_combined = hstack([X_text, csr_matrix(X_feat)])
    
    prediction = model.predict(X_combined)[0]
    probability = model.predict_proba(X_combined)[0, 1]
    
    pred_label = "scam" if prediction == 1 else "ham"
    is_correct = pred_label == expected
    
    if is_correct:
        correct += 1
    total += 1
    
    # Status emoji
    if is_correct:
        status = "✅ PASS"
        color = ""
    else:
        status = "❌ FAIL"
        color = ""
    
    # Difficulty emoji
    if difficulty == "EXTREME":
        diff_emoji = "🔥🔥🔥"
    elif difficulty == "HARD":
        diff_emoji = "🔥🔥"
    elif difficulty == "TRICKY":
        diff_emoji = "🎯"
    else:
        diff_emoji = "🔥"
    
    print(f"\n{i}. {status} {diff_emoji} [{category}]")
    print(f"   Predicted: {pred_label.upper()} ({probability*100:.1f}%) | Expected: {expected.upper()}")
    print(f"   Message: {msg[:80]}...")
    
    # Show detected patterns for failed cases
    if not is_correct or difficulty == "EXTREME":
        indicators = []
        if features['has_suspicious_pattern']:
            indicators.append("⚠️ Suspicious pattern")
        if features['has_urgency']:
            indicators.append("⏰ Urgency")
        if features['has_url_shortener']:
            indicators.append("🔗 URL shortener")
        if features['has_suspicious_tld']:
            indicators.append("🌐 Suspicious TLD")
        if features['has_ip_url']:
            indicators.append("📍 IP-based URL")
        if features['avg_domain_entropy'] > 3.5:
            indicators.append(f"🎲 High entropy ({features['avg_domain_entropy']:.2f})")
        
        if indicators:
            print(f"   Indicators: {', '.join(indicators)}")
    
    results.append({
        'category': category,
        'difficulty': difficulty,
        'expected': expected,
        'predicted': pred_label,
        'confidence': probability,
        'correct': is_correct
    })

# Summary by difficulty
print("\n" + "="*80)
print("📊 SUMMARY BY DIFFICULTY")
print("="*80)

df_results = pd.DataFrame(results)

for diff in ["MEDIUM", "HARD", "EXTREME", "TRICKY"]:
    diff_results = df_results[df_results['difficulty'] == diff]
    if len(diff_results) > 0:
        acc = (diff_results['correct'].sum() / len(diff_results)) * 100
        print(f"\n{diff}: {diff_results['correct'].sum()}/{len(diff_results)} ({acc:.1f}%)")
        
        # Show failed cases
        failed = diff_results[~diff_results['correct']]
        if len(failed) > 0:
            print(f"  Failed: {', '.join(failed['category'].tolist())}")

# Summary by category
print("\n" + "="*80)
print("📊 SUMMARY BY CATEGORY")
print("="*80)

scam_results = df_results[df_results['expected'] == 'scam']
ham_results = df_results[df_results['expected'] == 'ham']

scam_acc = (scam_results['correct'].sum() / len(scam_results)) * 100
ham_acc = (ham_results['correct'].sum() / len(ham_results)) * 100

print(f"\nSCAM Detection: {scam_results['correct'].sum()}/{len(scam_results)} ({scam_acc:.1f}%)")
print(f"HAM Detection: {ham_results['correct'].sum()}/{len(ham_results)} ({ham_acc:.1f}%)")

# Overall accuracy
accuracy = (correct / total) * 100
print("\n" + "="*80)
print(f"🎯 OVERALL HARDCORE TEST ACCURACY: {correct}/{total} ({accuracy:.1f}%)")
print("="*80)

# Category breakdown
print("\n" + "="*80)
print("📈 DETAILED CATEGORY BREAKDOWN")
print("="*80)

category_summary = df_results.groupby('category').agg({
    'correct': ['sum', 'count']
}).reset_index()
category_summary.columns = ['Category', 'Correct', 'Total']
category_summary['Accuracy'] = (category_summary['Correct'] / category_summary['Total'] * 100).round(1)
category_summary = category_summary.sort_values('Accuracy')

for _, row in category_summary.iterrows():
    status = "✅" if row['Accuracy'] == 100 else "❌" if row['Accuracy'] < 50 else "⚠️"
    print(f"{status} {row['Category']}: {row['Correct']}/{row['Total']} ({row['Accuracy']}%)")

# Performance grade
print("\n" + "="*80)
if accuracy >= 90:
    grade = "🏆 EXCELLENT - Model is production-ready!"
elif accuracy >= 80:
    grade = "✅ GOOD - Minor improvements needed"
elif accuracy >= 70:
    grade = "⚠️ FAIR - Needs improvement"
else:
    grade = "❌ POOR - Major retraining required"

print(f"GRADE: {grade}")
print("="*80)
