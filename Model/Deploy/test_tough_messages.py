import requests
import random
import string
import time

# --- Configuration ---
API_URL = "http://localhost:8001/predict-scam"

# --- Tough Data Components ---

# 1. Subtle Typosquatting / Subdomain Abuse (Hard Scams)
# These look very real but are fake.
HARD_SCAM_DOMAINS = [
    'paypaI.com',          # Capital 'i' looks like 'l'
    'rnicrosoft.com',      # 'rn' looks like 'm'
    'googIe.com',          # Capital 'I'
    'amazon-order-support.com', # Hyphenated but plausible
    'secure.chase.com.verify-identity.net', # Subdomain abuse
    'apple.id.support.com', # Subdomain abuse
    'netflix.com-cancel.net' # Suffix abuse
]

# 2. Safe Domains with Complex/Scary URLs (Hard Legit)
# These are real domains but might trigger "suspicious pattern" or "entropy" checks.
HARD_LEGIT_DOMAINS = [
    'amazon.com', 'google.com', 'linkedin.com', 'slack.com', 'zoom.us', 'dropbox.com'
]

# --- Generators ---

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_hard_scam():
    """
    Generates scams that try to evade detection by:
    - Using HTTPS
    - Avoiding obvious urgency ('IMMEDIATELY')
    - Using professional/polite language
    - Using subtle typosquatting
    """
    domain = random.choice(HARD_SCAM_DOMAINS)
    url = f"https://www.{domain}/auth/login?session={random_string(12)}"
    
    scenarios = [
        f"Dear Customer, we noticed a slight discrepancy in your billing information. Please review your profile at your earliest convenience: {url}",
        f"Attached is the invoice #INV-{random.randint(1000,9999)} for your recent consultation. You can view the details here: {url}",
        f"We have updated our Terms of Service. To continue using our services, please acknowledge the changes: {url}",
        f"Your support ticket #8821 has been updated. Click here to view the technician's reply: {url}",
        f"Hi, I shared a folder with you on Drive. 'Project Phoenix Specs'. View it here: {url}"
    ]
    return random.choice(scenarios)

def generate_hard_legit():
    """
    Generates legitimate messages that might trigger false positives by:
    - Using 'Urgent' or 'Security' keywords in safe contexts
    - Using financial keywords
    - Using long/complex URLs from safe domains
    """
    domain = random.choice(HARD_LEGIT_DOMAINS)
    # Complex URL with many parameters (high entropy)
    url = f"https://www.{domain}/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords={random_string(5)}&crid={random_string(10)}"
    
    scenarios = [
        f"URGENT: The team meeting has been moved to 3 PM. Please join via Zoom: {url}",
        f"Security Alert: A new device (iPhone 14) signed in to your Google Account. If this was you, no action is needed.",
        f"Your Chase statement for November is ready. Closing balance: $4,230.50. Minimum payment: $35.00.",
        f"Please verify your email address to complete your registration for the company picnic.",
        f"Hey, did you see this article? It's about the new security breach at Uber. Crazy stuff. {url}"
    ]
    return random.choice(scenarios)

# --- Testing Logic ---

def test_tough_messages():
    print(f"\n{'='*80}")
    print(f"🧪 TESTING 'TOUGH' ADVERSARIAL MESSAGES (Hard to Classify)")
    print(f"{'='*80}\n")

    test_cases = []
    for _ in range(5):
        test_cases.append(("SCAM", generate_hard_scam()))
    for _ in range(5):
        test_cases.append(("LEGIT", generate_hard_legit()))
    
    random.shuffle(test_cases)

    score = 0
    total = len(test_cases)

    for expected_type, text in test_cases:
        print(f"📝 Message: {text}")
        print(f"   Expected: {expected_type}")
        
        try:
            response = requests.post(API_URL, json={"text": text})
            if response.status_code == 200:
                data = response.json()
                pred = data['prediction']
                conf = data['confidence']
                indicators = data['threat_indicators']
                
                # Check correctness
                is_correct = (pred.upper() == "SCAM" and expected_type == "SCAM") or \
                             (pred.upper() == "NOT A SCAM" and expected_type == "LEGIT")
                
                if is_correct: score += 1
                status_icon = "✅" if is_correct else "❌"
                
                print(f"   Prediction: {pred.upper()} ({conf:.1%}) {status_icon}")
                
                # Show why it might have failed/succeeded
                active_flags = [k for k,v in indicators.items() if v and k != 'total_red_flags']
                if active_flags:
                    print(f"   Flags Triggered: {', '.join(active_flags)}")
                else:
                    print(f"   Flags Triggered: None")
                    
            else:
                print(f"   ❌ API Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
        
        print("-" * 80)
    
    print(f"\n📊 FINAL SCORE: {score}/{total} ({score/total:.1%})")
    print("   (Lower scores are expected here as these are designed to trick the model)")

if __name__ == "__main__":
    test_tough_messages()
