import random
import string
import requests
import json
import time

# --- Configuration ---
API_URL = "http://localhost:8001/predict-scam"

# --- Data Components ---
DOMAINS_LEGIT = ['google.com', 'amazon.com', 'paypal.com', 'chase.com', 'apple.com', 'microsoft.com', 'netflix.com']
DOMAINS_SCAM = [
    'g0ogle.com', 'amaz0n-secure.com', 'paypal-verify.xyz', 'chase-bank-alert.top', 
    'apple-id-support.info', 'microsoft-update.club', 'netflix-payment.net',
    'secure-login-verify.com', 'account-update-required.ga', 'win-prize-now.tk'
]
URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co']

ACTIONS_SCAM = [
    'verify your account', 'claim your prize', 'update payment details', 'confirm your identity',
    'unlock your account', 'prevent suspension', 'secure your funds'
]
ACTIONS_LEGIT = [
    'view your statement', 'track your package', 'review your recent login', 'check your order status',
    'read our new policy', 'see your memories'
]

URGENCY_PHRASES = [
    'IMMEDIATELY', 'URGENT', 'Action Required', 'Final Notice', '24 hours left', 'Account Suspended'
]

# --- Generators ---

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_scam_url():
    if random.random() < 0.3:
        # Use a shortener
        return f"http://{random.choice(URL_SHORTENERS)}/{random_string(6)}"
    elif random.random() < 0.6:
        # Use a suspicious TLD or typosquatting
        domain = random.choice(DOMAINS_SCAM)
        return f"http://{domain}/login?id={random_string(10)}"
    else:
        # IP address URL
        ip = ".".join(str(random.randint(0, 255)) for _ in range(4))
        return f"http://{ip}/secure"

def generate_legit_url():
    domain = random.choice(DOMAINS_LEGIT)
    return f"https://www.{domain}/account/{random_string(5)}"

def generate_scam_message():
    template_type = random.choice(['financial', 'prize', 'security'])
    
    if template_type == 'financial':
        bank = random.choice(['Chase', 'Wells Fargo', 'BoA', 'PayPal'])
        amount = random.randint(100, 5000)
        return f"{random.choice(URGENCY_PHRASES)}: Your {bank} account has a suspicious transaction of ${amount}. Click to deny: {generate_scam_url()}"
    
    elif template_type == 'prize':
        prize = random.choice(['iPhone 15', '$1000 Gift Card', 'Walmart Voucher', 'Tesla Model 3'])
        return f"CONGRATULATIONS! You have been selected to win a {prize}. Claim now before it expires: {generate_scam_url()}"
    
    elif template_type == 'security':
        service = random.choice(['Netflix', 'Amazon', 'Apple ID', 'Google'])
        return f"Alert: Your {service} account is locked due to failed login attempts. Verify identity {random.choice(URGENCY_PHRASES)}: {generate_scam_url()}"

def generate_legit_message():
    template_type = random.choice(['transaction', 'social', 'notification'])
    
    if template_type == 'transaction':
        store = random.choice(['Amazon', 'Walmart', 'Target', 'Best Buy'])
        return f"Your {store} order #{random.randint(10000,99999)} has shipped. Track it here: {generate_legit_url()}"
    
    elif template_type == 'social':
        return f"Hey, are we still meeting for lunch at {random.randint(11, 12)}:30? Let me know."
    
    elif template_type == 'notification':
        service = random.choice(['Google', 'Outlook', 'Slack'])
        return f"New login detected on your {service} account from Chrome on Windows. If this was you, no action is needed. {generate_legit_url()}"

# --- Main Execution ---

def run_test_batch(count=5):
    print(f"\n{'='*80}")
    print(f"🧪 GENERATING AND TESTING {count*2} RANDOM MESSAGES (50% Scam / 50% Legit)")
    print(f"{'='*80}\n")

    results = []
    
    # Generate mix
    messages = []
    for _ in range(count):
        messages.append(("Expected: SCAM", generate_scam_message()))
        messages.append(("Expected: LEGIT", generate_legit_message()))
    
    random.shuffle(messages)

    for expected, text in messages:
        print(f"📝 Input: {text}")
        print(f"   Target: {expected}")
        
        try:
            start_time = time.time()
            response = requests.post(API_URL, json={"text": text})
            latency = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                pred = data['prediction']
                conf = data['confidence']
                indicators = data['threat_indicators']
                
                # Determine pass/fail
                is_scam_pred = (pred == "scam")
                is_scam_expected = (expected == "Expected: SCAM")
                
                status = "✅ PASS" if is_scam_pred == is_scam_expected else "❌ FAIL"
                
                print(f"   Result: {pred.upper()} ({conf:.1%}) | {status}")
                print(f"   Flags:  {', '.join([k for k,v in indicators.items() if v and k != 'total_red_flags'])}")
                print(f"   Latency: {latency:.0f}ms")
            else:
                print(f"   ❌ API Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Connection Error: Is the server running? ({e})")
        
        print("-" * 80)

if __name__ == "__main__":
    run_test_batch(5)
