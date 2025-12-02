#!/usr/bin/env python
"""
Generate diverse, non-duplicate scam detection training dataset.
Creates 20,000+ unique messages with realistic variations.
"""
import random
import csv
from typing import List, Tuple
import re

# Seed for reproducibility
random.seed(42)

# ============================================================================
# SCAM MESSAGE TEMPLATES (High Variety)
# ============================================================================

SCAM_TEMPLATES = [
    # Account security threats
    "Alert: Your {service} account will be {action} if you don't verify {urgency}",
    "URGENT: Unusual activity detected on your {service} account. {cta}",
    "Your {service} account has been {status}. {cta} to restore access",
    "Security warning: Your {service} credentials have been compromised. {cta}",
    "Action required: Verify your {service} account within {time} or face suspension",
    
    # Financial scams
    "Your {payment_method} payment of {currency}{amount} failed. Click to retry",
    "Your wallet has been credited with {currency}{amount}. {cta}",
    "URGENT: Your {payment_method} transaction requires verification. {cta}",
    "Bank alert: Suspicious transaction of {currency}{amount} detected. Confirm now",
    "Your {financial_service} balance is negative. Pay {currency}{amount} immediately",
    
    # Prize/lottery scams
    "Congratulations! You've won {prize}. {cta} to claim now!",
    "You have won a lottery of {currency}{amount}. Contact us immediately",
    "Alert: You've been selected for {opportunity}. {cta}",
    "Exclusive winner: {prize} is waiting for you. Claim within {time}",
    "Lucky draw results: You won {prize}! Verification needed. {cta}",
    
    # Get rich quick schemes
    "Get rich quick scheme. Invest {currency}{amount} and earn {currency}{amount2} in {time}",
    "Earn {currency}{amount} from home without investment. {cta}",
    "Make {currency}{amount} per {time_unit} working from home. No experience needed",
    "Financial freedom awaits! Invest {currency}{amount}, get {multiplier}x returns",
    "Secret method to earn {currency}{amount} in {time}. Limited spots available",
    
    # Free product scams
    "Free {product}! Just pay {currency}{amount} shipping charges",
    "Limited offer: Get {product} absolutely free. {cta}",
    "Flash sale: {product} for only {currency}{amount}. {discount}% off. {cta}",
    "Exclusive deal: Buy {product}, get {product2} free. Hurry!",
    "Today only: {product} at {discount}% discount. Stock limited. {cta}",
    
    # Urgency/pressure tactics
    "Limited seats available. Book now to save {discount}% {cta}",
    "Offer expires in {time}! {cta} immediately",
    "Only {number} spots left for {opportunity}. Act fast!",
    "Last chance: {offer} ends tonight. {cta}",
    "Time-sensitive: Respond within {time} or lose your {benefit}",
    
    # Government/official impersonation
    "Government scheme offering {benefit} - claim now",
    "Tax refund of {currency}{amount} available. Click to claim",
    "Your {document} is ready for collection. Verify identity first",
    "Official notice: Your {service} registration is incomplete. {cta}",
    "Subsidy payment of {currency}{amount} pending. Claim immediately",
    
    # Personal information phishing
    "Your KYC is pending. Update now {cta}",
    "Verify your identity to continue using {service}. {cta}",
    "Profile verification required for {service}. Complete within {time}",
    "Update your {document} details immediately to avoid account closure",
    "Mandatory information update for {service} users. {cta}",
    
    # Relationship/social engineering
    "You've been selected for a secret shopper program. Reply now",
    "Your friend {name} sent you {currency}{amount}. Accept here",
    "Someone sent you a private message. Click to view",
    "{name} is trying to reach you. Respond immediately",
    "You have {number} pending friend requests. Verify to see",
    
    # Discount/offer scams
    "Exclusive offer: Get {discount}% off on {product}",
    "VIP discount code: {code}. Save {currency}{amount} on your purchase",
    "Members-only deal: {product} at {discount}% off. {cta}",
    "Flash discount: {discount}% off everything for next {time}",
    "Cashback offer: Get {currency}{amount} back on purchases above {currency}{amount2}",
    
    # Investment scams
    "Cryptocurrency investment opportunity: {multiplier}x returns in {time}",
    "Real estate deal: Invest {currency}{amount}, earn {currency}{amount2} monthly",
    "Stock tip: Buy {company} now, triple your money in {time}",
    "Forex trading secret: Turn {currency}{amount} into {currency}{amount2}",
    "Bitcoin giveaway: Send {currency}{amount}, receive {currency}{amount2} back",
]

LEGITIMATE_TEMPLATES = [
    # Appointment reminders
    "Appointment reminder: {appointment_type} tomorrow at {time}",
    "Your {appointment_type} is scheduled for {date} at {time}",
    "Reminder: {event} on {date}. Don't forget!",
    "Meeting scheduled for {date} at {time}. See you there",
    "Upcoming appointment: {appointment_type} on {date}",
    
    # Order confirmations
    "Your order has been shipped. Track here",
    "Order confirmation: #{order_number}. Expected delivery {date}",
    "Thank you for your purchase. Your order #{order_number} is being processed",
    "Shipment notification: Your order will arrive by {date}",
    "Your package is out for delivery today",
    
    # Bill/payment notifications
    "Your {bill_type} bill for this month is {currency}{amount}",
    "Payment received. Thank you for your transaction",
    "Invoice #{invoice_number} for your recent purchase is attached",
    "Your monthly {service} statement is ready for download",
    "Subscription renewed successfully. Next billing on {date}",
    
    # Information/reminders
    "Library books due in {number} days. Renew if needed",
    "Campus Wi-Fi maintenance scheduled tonight",
    "System maintenance scheduled at {time}",
    "Class cancelled today due to {reason}",
    "Project deadline reminder: Submit by {date}",
    
    # Confirmations
    "Your reservation is confirmed. See details",
    "Registration successful for {event}",
    "Booking confirmed: {service} on {date} at {time}",
    "Your subscription expires in {number} days",
    "Profile updated successfully",
    
    # Social messages
    "Hi — Please review the attached document",
    "Team lunch tomorrow at {time}. RSVP please",
    "Meeting notes from {date} attached",
    "Hello, how are you today?",
    "Thanks for your help with {task}",
    
    # News/updates
    "New features available in {service}",
    "Newsletter for {month}: {topic}",
    "Weather alert: {weather} expected {date}",
    "Traffic update: {route} is congested",
    "Community notice: {event} on {date}",
    
    # Greetings
    "Happy birthday! Hope you have a wonderful day",
    "Season's greetings from {organization}",
    "Welcome to {service}. Explore features here",
    "Thank you for joining {organization}",
    "Congratulations on your {achievement}",
    
    # Educational
    "Exam results will be published on {date}",
    "Assignment due: {subject} by {date}",
    "Lecture rescheduled to {date} at {time}",
    "Study group meeting at {location} on {date}",
    "Course materials for {subject} are now available",
    
    # Professional
    "Quarterly report attached. Please review before {date}",
    "Team meeting agenda for {date}",
    "Performance review scheduled for {date}",
    "Welcome aboard! Your first day is {date}",
    "Timesheet submission deadline: {date}",
]

# ============================================================================
# REPLACEMENT VARIABLES
# ============================================================================

SERVICES = ["bank", "email", "social media", "PayPal", "Amazon", "Netflix", 
            "credit card", "debit card", "UPI", "Google", "Microsoft", "Apple"]

ACTIONS = ["suspended", "closed", "locked", "terminated", "blocked", "deactivated"]

URGENCIES = ["immediately", "within 24 hours", "now", "today", "ASAP", "urgently"]

CTAS = ["Click here", "Verify now", "Update now", "Confirm here", "Act now", 
        "Reply immediately", "Visit link", "Tap here", "Follow link"]

PAYMENT_METHODS = ["UPI", "credit card", "debit card", "bank", "PayPal", "wallet"]

CURRENCIES = ["$", "Rs.", "€", "£"]

PRIZES = ["an iPhone", "a $1000 gift card", "$5000 cash", "a new car", 
          "a luxury vacation", "a laptop", "free Bitcoin", "a smartwatch"]

OPPORTUNITIES = ["an exclusive program", "a VIP membership", "a cashback offer",
                 "a beta testing program", "a secret shopper role"]

PRODUCTS = ["iPhone", "laptop", "smartwatch", "tablet", "headphones", "shoes",
            "clothing", "furniture", "electronics", "gift cards"]

FINANCIAL_SERVICES = ["bank account", "credit card", "savings account", "loan account"]

APPOINTMENT_TYPES = ["Doctor visit", "Dentist appointment", "Job interview", 
                     "Client meeting", "Car service", "Haircut appointment"]

BILL_TYPES = ["electricity", "water", "internet", "phone", "gas", "rent"]

EVENTS = ["conference", "webinar", "workshop", "seminar", "training session"]

TIMES = ["9 AM", "10 AM", "2 PM", "3 PM", "4 PM", "5 PM"]

DATES = ["Monday", "Tuesday", "tomorrow", "next week", "15th", "20th", "end of month"]

REASONS = ["technical issues", "instructor unavailability", "weather conditions", "holiday"]

DOMAINS_SCAM = ["verify-now.org", "secure-login.com", "account-update.net", 
                "prize-claim.store", "instant-rewards.site", "bank-verify.online",
                "cashback-hub.co", "promo-offers.in", "win-now.site"]

DOMAINS_LEGIT = ["gov.in", "edu.org", "company.com", "university.edu", 
                 "citybus.gov.in", "railways.in", "amazon.com", "bank-official.com"]

# ============================================================================
# GENERATION FUNCTIONS
# ============================================================================

def generate_amount():
    """Generate realistic monetary amounts."""
    choices = [50, 100, 250, 500, 1000, 1500, 2000, 2500, 5000, 10000, 50000]
    return random.choice(choices)

def generate_time_period():
    """Generate time periods."""
    return random.choice(["1 day", "3 days", "7 days", "10 days", "2 weeks", 
                          "1 month", "24 hours", "48 hours"])

def generate_scam_message() -> Tuple[str, str]:
    """Generate a unique scam message and URL."""
    template = random.choice(SCAM_TEMPLATES)
    
    # Replace variables in template
    message = template
    message = message.replace("{service}", random.choice(SERVICES))
    message = message.replace("{action}", random.choice(ACTIONS))
    message = message.replace("{urgency}", random.choice(URGENCIES))
    message = message.replace("{cta}", random.choice(CTAS))
    message = message.replace("{payment_method}", random.choice(PAYMENT_METHODS))
    message = message.replace("{currency}", random.choice(CURRENCIES))
    message = message.replace("{amount}", str(generate_amount()))
    message = message.replace("{amount2}", str(generate_amount() * random.randint(2, 10)))
    message = message.replace("{prize}", random.choice(PRIZES))
    message = message.replace("{opportunity}", random.choice(OPPORTUNITIES))
    message = message.replace("{time}", generate_time_period())
    message = message.replace("{product}", random.choice(PRODUCTS))
    message = message.replace("{product2}", random.choice(PRODUCTS))
    message = message.replace("{discount}", str(random.choice([10, 20, 30, 40, 50, 60, 70, 80, 90])))
    message = message.replace("{number}", str(random.randint(3, 20)))
    message = message.replace("{benefit}", random.choice(["money", "subsidy", "cashback", "refund"]))
    message = message.replace("{document}", random.choice(["passport", "ID", "license", "certificate"]))
    message = message.replace("{name}", random.choice(["John", "Sarah", "Mike", "Emma", "Alex"]))
    message = message.replace("{code}", f"CODE{random.randint(100, 999)}")
    message = message.replace("{multiplier}", str(random.choice([2, 3, 5, 10])))
    message = message.replace("{company}", random.choice(["TechCorp", "FinanceInc", "CryptoX", "GlobalTrade"]))
    message = message.replace("{time_unit}", random.choice(["day", "week", "month"]))
    message = message.replace("{financial_service}", random.choice(FINANCIAL_SERVICES))
    message = message.replace("{status}", random.choice(["compromised", "hacked", "suspended", "locked"]))
    message = message.replace("{offer}", random.choice(["special discount", "limited offer", "exclusive deal"]))
    
    # Generate suspicious URL
    subdomain = random.choice(["login", "secure", "verify", "account", "update", ""])
    domain = random.choice(DOMAINS_SCAM)
    url = f"https://{subdomain}-{domain}" if subdomain else f"https://{domain}"
    
    return message, url

def generate_legitimate_message() -> Tuple[str, str]:
    """Generate a unique legitimate message and URL."""
    template = random.choice(LEGITIMATE_TEMPLATES)
    
    # Replace variables in template
    message = template
    message = message.replace("{appointment_type}", random.choice(APPOINTMENT_TYPES))
    message = message.replace("{time}", random.choice(TIMES))
    message = message.replace("{date}", random.choice(DATES))
    message = message.replace("{event}", random.choice(EVENTS))
    message = message.replace("{order_number}", str(random.randint(10000, 99999)))
    message = message.replace("{bill_type}", random.choice(BILL_TYPES))
    message = message.replace("{currency}", random.choice(CURRENCIES))
    message = message.replace("{amount}", str(generate_amount()))
    message = message.replace("{service}", random.choice(["email", "cloud storage", "streaming", "hosting"]))
    message = message.replace("{invoice_number}", str(random.randint(1000, 9999)))
    message = message.replace("{number}", str(random.randint(2, 14)))
    message = message.replace("{reason}", random.choice(REASONS))
    message = message.replace("{task}", random.choice(["the project", "the report", "yesterday's meeting"]))
    message = message.replace("{month}", random.choice(["January", "February", "March", "November"]))
    message = message.replace("{topic}", random.choice(["Tech Updates", "Community News", "Tips & Tricks"]))
    message = message.replace("{weather}", random.choice(["rain", "snow", "storm", "fog"]))
    message = message.replace("{route}", random.choice(["Highway 101", "Main Street", "Route 66"]))
    message = message.replace("{organization}", random.choice(["ABC Corp", "XYZ University", "Community Center"]))
    message = message.replace("{achievement}", random.choice(["promotion", "graduation", "award", "milestone"]))
    message = message.replace("{subject}", random.choice(["Mathematics", "Physics", "Computer Science"]))
    message = message.replace("{location}", random.choice(["Library", "Room 301", "Main Hall", "Cafeteria"]))
    
    # Generate legitimate URL
    domain = random.choice(DOMAINS_LEGIT)
    subdomain = random.choice(["portal", "services", "online", "www", ""])
    url = f"https://{subdomain}.{domain}" if subdomain else f"https://{domain}"
    
    return message, url

def generate_dataset(total_samples: int = 25000, duplicate_threshold: float = 0.02):
    """
    Generate diverse dataset with minimal duplicates.
    
    Args:
        total_samples: Total number of samples to generate
        duplicate_threshold: Maximum allowed duplicate percentage (default 2%)
    """
    print(f"Generating {total_samples} diverse messages...")
    print(f"Target duplicate rate: <{duplicate_threshold*100}%\n")
    
    samples = []
    seen_messages = set()
    scam_count = 0
    ham_count = 0
    duplicate_count = 0
    
    target_scam = total_samples // 2
    target_ham = total_samples // 2
    
    attempts = 0
    max_attempts = total_samples * 10  # Prevent infinite loop
    
    while (scam_count < target_scam or ham_count < target_ham) and attempts < max_attempts:
        attempts += 1
        
        # Decide whether to generate scam or ham
        if scam_count < target_scam and (ham_count >= target_ham or random.random() < 0.5):
            message, url = generate_scam_message()
            label = "spam"
            
            if message not in seen_messages:
                samples.append([message, url, label])
                seen_messages.add(message)
                scam_count += 1
            else:
                duplicate_count += 1
                
        elif ham_count < target_ham:
            message, url = generate_legitimate_message()
            label = "ham"
            
            if message not in seen_messages:
                samples.append([message, url, label])
                seen_messages.add(message)
                ham_count += 1
            else:
                duplicate_count += 1
        
        # Progress update
        if (scam_count + ham_count) % 5000 == 0:
            print(f"Progress: {scam_count + ham_count}/{total_samples} "
                  f"(Scam: {scam_count}, Ham: {ham_count}, Duplicates rejected: {duplicate_count})")
    
    # Shuffle the dataset
    random.shuffle(samples)
    
    # Calculate final statistics
    total_generated = len(samples)
    duplicate_rate = duplicate_count / (total_generated + duplicate_count)
    
    print(f"\n{'='*60}")
    print(f"Dataset Generation Complete!")
    print(f"{'='*60}")
    print(f"Total unique samples: {total_generated}")
    print(f"Scam messages: {scam_count}")
    print(f"Legitimate messages: {ham_count}")
    print(f"Duplicates rejected: {duplicate_count}")
    print(f"Duplicate rate: {duplicate_rate*100:.2f}%")
    print(f"Unique messages: {len(seen_messages)}")
    print(f"{'='*60}\n")
    
    return samples

def save_dataset(samples: List[List[str]], filename: str = "cybersafe_dataset_diverse.csv"):
    """Save dataset to CSV file."""
    print(f"Saving dataset to {filename}...")
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['message', 'url', 'label'])
        writer.writerows(samples)
    
    print(f"[OK] Dataset saved successfully!\n")

def main():
    """Main execution."""
    print("\n" + "="*60)
    print("DIVERSE SCAM DETECTION DATASET GENERATOR")
    print("="*60 + "\n")
    
    # Generate dataset with 25,000 samples (allowing for better train/test split)
    samples = generate_dataset(total_samples=25000, duplicate_threshold=0.02)
    
    # Save to file
    save_dataset(samples, "cybersafe_dataset_diverse.csv")
    
    print("Next steps:")
    print("1. Review the generated dataset: cybersafe_dataset_diverse.csv")
    print("2. Retrain your model using: python train.py --data cybersafe_dataset_diverse.csv --out artifacts")
    print("3. Evaluate with: python evaluate.py --data cybersafe_dataset_diverse.csv --model artifacts/scam_detector_model.joblib --vectorizer artifacts/scam_tfidf_vectorizer.joblib --out reports")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
