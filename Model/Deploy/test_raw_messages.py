import requests
import random
import string
import time

# --- Configuration ---
API_URL = "http://localhost:8001/predict-scam"

# --- Data Components (Same as generate_raw_messages.py) ---
DOMAINS_LEGIT = ['google.com', 'amazon.com', 'paypal.com', 'chase.com', 'apple.com', 'microsoft.com', 'netflix.com', 'irs.gov', 'ups.com', 'fedex.com']
DOMAINS_SCAM = [
    'g0ogle-secure.com', 'amaz0n-support.net', 'paypal-verify-now.xyz', 'chase-alert-bank.top', 
    'apple-id-locked.info', 'microsoft-security-update.club', 'netflix-billing-error.net',
    'secure-login-attempt.com', 'account-verification-required.ga', 'win-iphone-now.tk',
    'irs-refund-claim.org.in', 'ups-delivery-fee.com', 'fedex-tracking-update.net'
]
URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'goo.gl', 'ow.ly']

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_scam_url():
    if random.random() < 0.4:
        return f"http://{random.choice(URL_SHORTENERS)}/{random_string(6)}"
    elif random.random() < 0.7:
        domain = random.choice(DOMAINS_SCAM)
        return f"http://{domain}/login?id={random_string(10)}"
    else:
        ip = ".".join(str(random.randint(0, 255)) for _ in range(4))
        return f"http://{ip}/secure-login"

def generate_legit_url():
    domain = random.choice(DOMAINS_LEGIT)
    return f"https://www.{domain}/account/history?ref={random_string(8)}"

def generate_scam_message():
    scenarios = [
        f"URGENT: Your IRS tax refund of ${random.randint(500, 2000)} is pending. Click to claim before it expires: {generate_scam_url()}",
        f"Amazon Security Alert: We detected a login from Russia. If this wasn't you, verify your account immediately: {generate_scam_url()}",
        f"You have (1) unread message from secure-center. Your account will be deleted in 24 hours. Cancel request: {generate_scam_url()}",
        f"CONGRATS! You are the lucky winner of a $500 Walmart Gift Card! Claim here: {generate_scam_url()}",
        f"Netflix Payment Failed: We could not process your latest payment. Update your card to avoid suspension: {generate_scam_url()}",
        f"FedEx: Your package is held at the terminal due to unpaid shipping fees ($1.99). Pay now to deliver: {generate_scam_url()}",
        f"Apple ID: Your account has been locked for security reasons. Unlock it now: {generate_scam_url()}",
        f"PayPal: You sent ${random.randint(100, 500)} to 'Unknown User'. If you did not authorize this, cancel transaction: {generate_scam_url()}"
    ]
    return random.choice(scenarios)

def generate_legit_message():
    scenarios = [
        f"Your Google verification code is {random.randint(100000, 999999)}. Do not share this with anyone.",
        f"Amazon: Your package has been delivered to your front porch. View photo proof: {generate_legit_url()}",
        f"Chase: You spent ${random.randint(10, 100)} at Starbucks. Your balance is ${random.randint(1000, 5000)}.",
        f"Netflix: New sign-in to your account on a new device (iPad). If this was you, you're all set.",
        f"UPS: Scheduled delivery for tomorrow between 2:00 PM and 4:00 PM. Track here: {generate_legit_url()}",
        f"Apple: Your receipt for iCloud Storage (50GB) - $0.99. View invoice: {generate_legit_url()}",
        "Hey, are you free this weekend? I was thinking we could go hike.",
        "Mom called, she wants to know if you're coming for dinner on Sunday."
    ]
    return random.choice(scenarios)

# --- Testing Logic ---

def test_messages():
    print(f"\n{'='*80}")
    print(f"🧪 TESTING GENERATED RAW MESSAGES AGAINST API")
    print(f"{'='*80}\n")

    test_cases = []
    for _ in range(5):
        test_cases.append(("SCAM", generate_scam_message()))
    for _ in range(5):
        test_cases.append(("LEGIT", generate_legit_message()))
    
    random.shuffle(test_cases)

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
                
                status_icon = "✅" if is_correct else "❌"
                
                print(f"   Prediction: {pred.upper()} ({conf:.1%}) {status_icon}")
                if indicators['total_red_flags'] > 0:
                    flags = [k for k,v in indicators.items() if v and k != 'total_red_flags']
                    print(f"   Flags: {', '.join(flags)}")
            else:
                print(f"   ❌ API Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
        
        print("-" * 80)

if __name__ == "__main__":
    test_messages()
