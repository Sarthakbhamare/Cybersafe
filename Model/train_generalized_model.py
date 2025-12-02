"""
Train a generalized scam detection model that works on UNSEEN domains and URLs
Focus: Pattern-based learning instead of memorizing specific domains
"""

import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import json
from urllib.parse import urlparse
import tldextract

print("="*80)
print("🚀 Training Generalized Scam Detection Model")
print("="*80)

# Load dataset
print("\n📂 Loading dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train.csv')

# Convert label to numeric if needed
if df['label'].dtype == 'object':
    df['label'] = df['label'].map({'spam': 1, 'ham': 0, 'scam': 1, 'legitimate': 0, 1: 1, 0: 0})
    df['label'] = df['label'].fillna(0).astype(int)

print(f"✓ Loaded {len(df)} messages")
scam_count = int(df['label'].sum())
ham_count = len(df) - scam_count
print(f"  Scam: {scam_count}")
print(f"  Ham: {ham_count}")

# --- Domain Feature Extraction (Pattern-based, NOT domain memorization) ---
URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly',
    'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr', 'tiny.cc', 'tr.im', 'cli.gs',
    'x.co', 'shorturl.at', 'cutt.ly', 'rb.gy', 'short.io', 'tiny.one',
    'qrco.de', 'q-r.to', 'clk.sh', 's.id', 'rebrand.ly', 'bl.ink'
}

SUSPICIOUS_TLDS = {
    'xyz', 'top', 'club', 'work', 'click', 'link', 'online', 'site',
    'website', 'space', 'tech', 'store', 'business', 'tk', 'ml', 'ga',
    'cf', 'gq', 'pw', 'cc', 'info', 'ws', 'su', 'icu', 'bid', 'loan'
}

# Common words found in legitimate domains (NOT brand-specific)
LEGITIMATE_KEYWORDS = {
    'bank', 'official', 'service', 'support', 'account', 'customer',
    'verification', 'security', 'alert', 'notice', 'info', 'message'
}

# Expanded list of major brands that are commonly impersonated in phishing
MAJOR_BRANDS = {
    # Tech Companies
    'apple', 'google', 'microsoft', 'amazon', 'facebook', 'meta', 'instagram',
    'twitter', 'x', 'linkedin', 'tiktok', 'snapchat', 'whatsapp', 'telegram',
    'zoom', 'skype', 'discord', 'slack', 'dropbox', 'adobe', 'oracle',
    'salesforce', 'netflix', 'spotify', 'hulu', 'disney', 'youtube',
    
    # Financial Services
    'paypal', 'venmo', 'cashapp', 'zelle', 'stripe', 'square', 'visa',
    'mastercard', 'amex', 'american express', 'discover', 'chase', 'bank of america',
    'wells fargo', 'citi', 'citibank', 'capital one', 'usbank', 'pnc', 'td bank',
    'hsbc', 'barclays', 'santander', 'bmo', 'rbc', 'scotiabank',
    
    # E-commerce & Delivery
    'ebay', 'etsy', 'walmart', 'target', 'bestbuy', 'costco', 'homedepot',
    'lowes', 'ikea', 'usps', 'ups', 'fedex', 'dhl', 'royal mail', 'canada post',
    
    # Gaming & Entertainment
    'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'roblox',
    'minecraft', 'twitch', 'fortnite',
    
    # Crypto & Fintech
    'coinbase', 'binance', 'kraken', 'blockchain', 'crypto', 'bitcoin',
    'ethereum', 'metamask', 'trustwallet', 'robinhood',
    
    # Email & Communication
    'gmail', 'outlook', 'yahoo', 'protonmail', 'aol', 'icloud',
    
    # Government & Official
    'irs', 'revenue', 'tax', 'gov', 'government', 'social security',
    'medicare', 'medicaid', 'dmv', 'passport', 'immigration',
    
    # Healthcare
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'medicare', 'medicaid',
    
    # Travel
    'booking', 'expedia', 'airbnb', 'hotels', 'marriott', 'hilton',
    'delta', 'united', 'american airlines', 'southwest',
    
    # Food Delivery
    'doordash', 'ubereats', 'grubhub', 'postmates', 'instacart',
}

# Suspicious domain suffixes that indicate phishing attempts
PHISHING_SUFFIXES = {
    'verify', 'verification', 'secure', 'security', 'login', 'signin',
    'account', 'update', 'confirm', 'validate', 'auth', 'authenticate',
    'support', 'help', 'service', 'customer', 'alert', 'notice',
    'suspended', 'locked', 'frozen', 'blocked', 'limited', 'restricted',
    'recovery', 'recover', 'reset', 'restore', 'unlock', 'activate',
    'renewal', 'renew', 'expire', 'expiry', 'payment', 'billing',
    'invoice', 'receipt', 'refund', 'claim', 'prize', 'winner',
    'official', 'portal', 'center', 'online', 'web', 'app'
}

def has_brand_impersonation(domain, text):
    """
    Detect if domain is trying to impersonate a major brand
    Returns True if suspicious brand-related pattern detected
    """
    if not domain:
        return False
    
    domain_lower = domain.lower()
    text_lower = text.lower() if text else ''
    
    # Extract domain name without TLD
    domain_parts = domain_lower.split('.')
    domain_name = domain_parts[0] if domain_parts else domain_lower
    
    # Check if any major brand name appears in domain or text
    for brand in MAJOR_BRANDS:
        brand_normalized = brand.replace(' ', '').replace('-', '')
        
        # Check if brand mentioned in text
        brand_in_text = brand in text_lower or brand_normalized in text_lower.replace(' ', '').replace('-', '')
        
        # Check if brand name in domain
        brand_in_domain = brand_normalized in domain_name.replace('-', '').replace('_', '')
        
        if brand_in_text or brand_in_domain:
            # If brand detected, check for phishing suffixes
            for suffix in PHISHING_SUFFIXES:
                if suffix in domain_name:
                    return True
            
            # Check for hyphenated patterns (e.g., paypal-secure, amazon-verify)
            if '-' in domain_name and brand_normalized in domain_name:
                return True
            
            # Check for character substitutions (e.g., paypa1, amaz0n)
            if has_character_substitution(domain_name, brand_normalized):
                return True
    
    return False

def has_character_substitution(domain, brand):
    """Detect character substitutions like 0 for o, 1 for l"""
    substitutions = {
        '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
        '7': 't', '8': 'b', '9': 'g'
    }
    
    # Create variants with substitutions
    for digit, letter in substitutions.items():
        if digit in domain:
            # Check if substituting back makes it match the brand
            variant = domain.replace(digit, letter)
            if brand in variant:
                return True
    
    return False

def extract_all_urls(text):
    if not text or pd.isna(text):
        return []
    url_pattern = r'https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?'
    return re.findall(url_pattern, str(text))

def is_ip_address(domain):
    if not domain:
        return False
    return bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))

def calculate_domain_entropy(domain):
    """Higher entropy = more random = more suspicious"""
    if not domain or len(domain) < 3:
        return 0.0
    import math
    freq = {}
    for char in domain:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / len(domain)
        entropy -= p * math.log2(p)
    return entropy

def has_suspicious_pattern(domain):
    """Detect suspicious patterns in domain names"""
    if not domain:
        return False
    domain_lower = domain.lower()
    
    # Pattern 1: Multiple hyphens (e.g., paypal-secure-verify.com)
    if domain_lower.count('-') >= 2:
        return True
    
    # Pattern 2: Numbers mixed with letters suspiciously (e.g., paypa1.com, amaz0n.com)
    if re.search(r'[a-z]\d[a-z]|\d[a-z]\d', domain_lower):
        return True
    
    # Pattern 3: Common brand-like patterns (ending in common suffixes)
    suspicious_suffixes = ['secure', 'verify', 'login', 'account', 'update', 
                          'confirm', 'alert', 'support', 'service', 'online']
    for suffix in suspicious_suffixes:
        if domain_lower.endswith(suffix):
            return True
    
    # Pattern 4: Long domain names (> 20 chars excluding TLD)
    if len(domain_lower.split('.')[0]) > 20:
        return True
    
    return False

def extract_generalized_features(text):
    """Extract features that work on UNSEEN domains"""
    features = {
        # URL-based features
        'has_url': 0,
        'url_count': 0,
        'has_ip_url': 0,
        'has_url_shortener': 0,
        'has_suspicious_tld': 0,
        'avg_domain_entropy': 0.0,
        'has_suspicious_pattern': 0,
        'has_https': 0,
        'has_non_standard_port': 0,
        
        # Text-based features
        'text_length': len(str(text)),
        'word_count': len(str(text).split()),
        'digit_ratio': 0.0,
        'uppercase_ratio': 0.0,
        'special_char_ratio': 0.0,
        
        # Urgency/Scam keywords (pattern-based)
        'has_urgency': 0,
        'has_financial_keywords': 0,
        'has_verification_keywords': 0,
        'has_prize_keywords': 0,
    }
    
    if not text or pd.isna(text):
        return features
    
    text_str = str(text)
    text_lower = text_str.lower()
    
    # Extract URLs
    urls = extract_all_urls(text_str)
    features['url_count'] = len(urls)
    features['has_url'] = 1 if urls else 0
    
    # Analyze URLs
    if urls:
        entropy_values = []
        for url in urls:
            try:
                parsed = urlparse(url if url.startswith('http') else f'http://{url}')
                netloc = parsed.netloc or parsed.path.split('/')[0]
                
                # IP address detection
                if is_ip_address(netloc.split(':')[0]):
                    features['has_ip_url'] = 1
                
                # Port detection
                if ':' in netloc and netloc.split(':')[-1].isdigit():
                    port = int(netloc.split(':')[-1])
                    if port not in [80, 443]:
                        features['has_non_standard_port'] = 1
                
                # HTTPS detection
                if url.startswith('https://'):
                    features['has_https'] = 1
                
                # Extract domain
                extracted = tldextract.extract(url)
                domain = extracted.domain
                tld = extracted.suffix
                
                # URL shortener detection
                full_domain = f"{domain}.{tld}" if domain and tld else netloc
                if full_domain.lower() in URL_SHORTENERS:
                    features['has_url_shortener'] = 1
                
                # Suspicious TLD detection
                if tld and tld.split('.')[-1].lower() in SUSPICIOUS_TLDS:
                    features['has_suspicious_tld'] = 1
                
                # Domain entropy
                if domain:
                    entropy_values.append(calculate_domain_entropy(domain))
                    
                    # Suspicious pattern detection
                    if has_suspicious_pattern(domain):
                        features['has_suspicious_pattern'] = 1
            except:
                continue
        
        if entropy_values:
            features['avg_domain_entropy'] = np.mean(entropy_values)
    
    # Text analysis
    if text_str:
        digit_count = sum(c.isdigit() for c in text_str)
        upper_count = sum(c.isupper() for c in text_str)
        special_count = sum(not c.isalnum() and not c.isspace() for c in text_str)
        
        features['digit_ratio'] = digit_count / len(text_str)
        features['uppercase_ratio'] = upper_count / len(text_str)
        features['special_char_ratio'] = special_count / len(text_str)
    
    # Keyword detection (pattern-based, NOT brand-specific)
    urgency_keywords = ['urgent', 'immediately', 'now', 'act now', 'limited time', 
                       'expire', 'suspended', 'locked', 'frozen']
    features['has_urgency'] = 1 if any(kw in text_lower for kw in urgency_keywords) else 0
    
    financial_keywords = ['bank', 'account', 'card', 'payment', 'money', 'transfer',
                         'refund', 'prize', 'win', 'won', 'claim', 'reward']
    features['has_financial_keywords'] = 1 if any(kw in text_lower for kw in financial_keywords) else 0
    
    verification_keywords = ['verify', 'verification', 'confirm', 'validate', 'authenticate',
                            'code', 'otp', 'pin']
    features['has_verification_keywords'] = 1 if any(kw in text_lower for kw in verification_keywords) else 0
    
    prize_keywords = ['congratulations', 'winner', 'selected', 'prize', 'gift', 'free']
    features['has_prize_keywords'] = 1 if any(kw in text_lower for kw in prize_keywords) else 0
    
    return features

# --- Text Preprocessing (Remove specific domains to prevent memorization) ---
def preprocess_text(text):
    """Preprocess text while removing specific domain names"""
    if not text or pd.isna(text):
        return ""
    
    text = str(text).lower()
    
    # Replace URLs with generic tokens
    text = re.sub(r'https?://[^\s]+', ' URL ', text)
    text = re.sub(r'www\.[^\s]+', ' URL ', text)
    text = re.sub(r'[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?', ' URL ', text)
    
    # Replace emails with generic token
    text = re.sub(r'\S+@\S+', ' EMAIL ', text)
    
    # Replace phone numbers
    text = re.sub(r'\d{10,}', ' PHONE ', text)
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

print("\n🔧 Extracting features...")
# Extract generalized features
feature_dicts = [extract_generalized_features(text) for text in df['text']]
feature_df = pd.DataFrame(feature_dicts)

print(f"✓ Extracted {len(feature_df.columns)} generalized features")
print("\nFeature columns:")
for col in feature_df.columns:
    print(f"  - {col}")

# Preprocess text
print("\n📝 Preprocessing text (removing specific domains)...")
df['processed_text'] = df['text'].apply(preprocess_text)

# Split data
print("\n✂️ Splitting data...")
X_text = df['processed_text']
X_features = feature_df
y = df['label']

X_text_train, X_text_test, X_feat_train, X_feat_test, y_train, y_test = train_test_split(
    X_text, X_features, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✓ Train: {len(X_text_train)} | Test: {len(X_text_test)}")

# TF-IDF Vectorization (LIMITED vocab to prevent domain memorization)
print("\n🔤 Creating TF-IDF features...")
tfidf = TfidfVectorizer(
    max_features=5000,  # Reduced from 12000 to prevent overfitting
    ngram_range=(1, 2),  # Bigrams only
    min_df=5,  # Ignore rare terms
    max_df=0.8,  # Ignore very common terms
)

X_tfidf_train = tfidf.fit_transform(X_text_train)
X_tfidf_test = tfidf.transform(X_text_test)

print(f"✓ TF-IDF vocab size: {len(tfidf.vocabulary_)}")

# Scale numeric features
print("\n⚖️ Scaling numeric features...")
scaler = StandardScaler()
X_feat_train_scaled = scaler.fit_transform(X_feat_train)
X_feat_test_scaled = scaler.transform(X_feat_test)

# Combine features
from scipy.sparse import hstack, csr_matrix
X_train_combined = hstack([X_tfidf_train, csr_matrix(X_feat_train_scaled)])
X_test_combined = hstack([X_tfidf_test, csr_matrix(X_feat_test_scaled)])

print(f"✓ Combined features shape: {X_train_combined.shape}")

# Train model with balanced class weights
print("\n🤖 Training Logistic Regression model...")
model = LogisticRegression(
    max_iter=1000,
    class_weight='balanced',  # Handle imbalanced data
    C=0.5,  # Regularization to prevent overfitting
    random_state=42,
    solver='saga'
)

model.fit(X_train_combined, y_train)
print("✓ Model trained!")

# Evaluate
print("\n📊 Evaluating model...")
y_pred = model.predict(X_test_combined)
y_proba = model.predict_proba(X_test_combined)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Ham', 'Scam']))

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)

roc_auc = roc_auc_score(y_test, y_proba)
print(f"\n✓ ROC-AUC Score: {roc_auc:.4f}")

# Save model
print("\n💾 Saving model...")
joblib.dump(model, 'artifacts/scam_detector_generalized.joblib')
joblib.dump(tfidf, 'artifacts/tfidf_vectorizer_generalized.joblib')
joblib.dump(scaler, 'artifacts/feature_scaler_generalized.joblib')

# Save feature config
config = {
    'feature_columns': list(feature_df.columns),
    'tfidf_vocab_size': len(tfidf.vocabulary_),
    'total_features': X_train_combined.shape[1],
    'model_type': 'Logistic Regression (Generalized)',
    'roc_auc': float(roc_auc)
}

with open('artifacts/feature_config_generalized.json', 'w') as f:
    json.dump(config, f, indent=2)

print("✓ Model saved!")

# Test on unseen domains
print("\n"+"="*80)
print("🧪 Testing on UNSEEN Domains")
print("="*80)

test_cases = [
    "WhatsApp verification: Your code is 642311. If you didn't request this, enter it at http://wa-verif-sec.com",
    "Your PayPal account has been suspended. Verify at paypal-secure.com immediately",
    "Amazon: Your package is delayed. Track it here: amazon-tracking.xyz",
    "Netflix: Your subscription expired. Renew now: netflix-renew.site",
    "Your Chase account ending in 1234 was charged $45.99 for Netflix on 11/13/2025",
    "Your verification code is 847291. Valid for 10 minutes.",
]

for i, text in enumerate(test_cases, 1):
    processed = preprocess_text(text)
    features = extract_generalized_features(text)
    feat_df = pd.DataFrame([features])
    
    X_text_vec = tfidf.transform([processed])
    X_feat_scaled = scaler.transform(feat_df)
    X_combined = hstack([X_text_vec, csr_matrix(X_feat_scaled)])
    
    pred = model.predict(X_combined)[0]
    proba = model.predict_proba(X_combined)[0, 1]
    
    result = "🚨 SCAM" if pred == 1 else "✅ SAFE"
    print(f"\n{i}. {result} ({proba*100:.1f}% confidence)")
    print(f"   Message: {text[:80]}...")
    
    # Show detected patterns
    if features['has_suspicious_pattern']:
        print(f"   ⚠️ Suspicious domain pattern detected")
    if features['has_urgency']:
        print(f"   ⚠️ Urgency keywords detected")
    if features['has_url_shortener']:
        print(f"   ⚠️ URL shortener detected")

print("\n" + "="*80)
print("✅ Training Complete!")
print("="*80)
