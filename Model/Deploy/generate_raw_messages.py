import random
import string

# --- Data Components ---
DOMAINS_LEGIT = ['google.com', 'amazon.com', 'paypal.com', 'chase.com', 'apple.com', 'microsoft.com', 'netflix.com', 'irs.gov', 'ups.com', 'fedex.com']
DOMAINS_SCAM = [
    'g0ogle-secure.com', 'amaz0n-support.net', 'paypal-verify-now.xyz', 'chase-alert-bank.top', 
    'apple-id-locked.info', 'microsoft-security-update.club', 'netflix-billing-error.net',
    'secure-login-attempt.com', 'account-verification-required.ga', 'win-iphone-now.tk',
    'irs-refund-claim.org.in', 'ups-delivery-fee.com', 'fedex-tracking-update.net'
]
URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'goo.gl', 'ow.ly']

URGENCY_PHRASES = [
    'IMMEDIATELY', 'URGENT', 'Action Required', 'Final Notice', '24 hours left', 'Account Suspended', 'Unauthorized Access'
]

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

print("--- GENERATED UNSEEN MESSAGES (NOT IN DATASET) ---\n")
print("🔴 SCAM MESSAGES:")
for _ in range(5):
    print(f"- {generate_scam_message()}")

print("\n🟢 LEGITIMATE MESSAGES:")
for _ in range(5):
    print(f"- {generate_legit_message()}")
