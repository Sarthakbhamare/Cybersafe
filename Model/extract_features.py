"""
Step 5: Explicit Feature Engineering with Thresholds
Extract 40 pattern-based features with explicit rules (no TF-IDF memorization)
"""

import pandas as pd
import numpy as np
import re
import math
from urllib.parse import urlparse
import tldextract
from tqdm import tqdm

print("="*80)
print("🔧 STEP 5: EXPLICIT FEATURE ENGINEERING")
print("="*80)

# ==================== CONSTANTS ====================

# URL Shorteners (26 services)
URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd',
    'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr', 'tiny.cc',
    'qr.net', 'tinyurl', 'shorturl.at', 'cutt.ly', 'short.io',
    'qrco.de', 'q-r.to', 'l.ead.me', 'rebrand.ly', 'clck.ru',
    'shorturl', 'urlz.fr', 'v.gd', '2.gp'
}

# Suspicious TLDs (30+ risky extensions)
SUSPICIOUS_TLDS = {
    'xyz', 'top', 'club', 'work', 'click', 'link', 'site', 'online',
    'bid', 'loan', 'win', 'download', 'stream', 'racing', 'party',
    'review', 'trade', 'accountant', 'science', 'gdn', 'webcam',
    'tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'buzz', 'date', 'faith',
    'cricket', 'men', 'country'
}

# Phishing suffixes (40+ patterns)
PHISHING_SUFFIXES = {
    'verify', 'verification', 'secure', 'security', 'login', 'signin',
    'account', 'update', 'confirm', 'validate', 'auth', 'authenticate',
    'support', 'help', 'service', 'customer', 'alert', 'notice',
    'suspended', 'locked', 'frozen', 'blocked', 'limited', 'restricted',
    'recovery', 'recover', 'reset', 'restore', 'unlock', 'activate',
    'renewal', 'renew', 'expire', 'expiry', 'payment', 'billing',
    'invoice', 'receipt', 'refund', 'claim', 'prize', 'winner'
}

# Major brands (100+)
MAJOR_BRANDS = {
    # Tech giants
    'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 
    'instagram', 'twitter', 'linkedin', 'tiktok', 'snapchat', 
    'whatsapp', 'telegram', 'zoom', 'skype', 'discord', 'slack',
    
    # Financial
    'paypal', 'venmo', 'cashapp', 'zelle', 'stripe', 'square',
    'visa', 'mastercard', 'amex', 'american express', 'discover',
    'chase', 'bank of america', 'wells fargo', 'citibank', 'citi',
    'capital one', 'usbank', 'pnc', 'td bank', 'hsbc', 'barclays',
    
    # E-commerce
    'ebay', 'etsy', 'walmart', 'target', 'bestbuy', 'costco',
    
    # Delivery
    'usps', 'ups', 'fedex', 'dhl',
    
    # Streaming
    'netflix', 'spotify', 'hulu', 'disney', 'youtube',
    
    # Gaming
    'steam', 'playstation', 'xbox', 'nintendo', 'epic games',
    
    # Crypto
    'coinbase', 'binance', 'blockchain', 'crypto', 'bitcoin', 'ethereum',
    
    # Government
    'irs', 'tax', 'government', 'social security'
}

# Domain reputation rules
TRUSTED_DOMAINS = {
    'paypal.com', 'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
    'facebook.com', 'meta.com', 'instagram.com', 'twitter.com', 'x.com',
    'linkedin.com', 'tiktok.com', 'snapchat.com', 'whatsapp.com', 'telegram.org',
    'zoom.us', 'skype.com', 'discord.com', 'slack.com', 'venmo.com',
    'cash.app', 'zellepay.com', 'stripe.com', 'squareup.com', 'visa.com',
    'mastercard.com', 'americanexpress.com', 'discover.com', 'chase.com',
    'bankofamerica.com', 'wellsfargo.com', 'citibank.com', 'capitalone.com',
    'usbank.com', 'pnc.com', 'td.com', 'hsbc.com', 'barclays.co.uk',
    'ebay.com', 'etsy.com', 'walmart.com', 'target.com', 'bestbuy.com',
    'costco.com', 'usps.com', 'ups.com', 'fedex.com', 'dhl.com',
    'netflix.com', 'spotify.com', 'hulu.com', 'disneyplus.com', 'youtube.com',
    'steamcommunity.com', 'playstation.com', 'xbox.com', 'nintendo.com',
    'epicgames.com', 'coinbase.com', 'binance.com', 'irs.gov', 'ssa.gov'
}

BLOCKED_DOMAINS = {
    'account-security-center.com', 'paypal-service.com', 'secure-paypal.com',
    'login-paypal-account.com', 'update-paypal.com', 'verify-paypal.com',
    'apple-id-secure.com', 'microsoftsupportsecure.com', 'netflix-account.com',
    'banking-alert.com', 'secure-payment-info.com', 'customer-verification.net',
    'billing-update.com', 'security-check-alert.com', 'support-team-mail.com',
    'document-share-safety.com', 'drive-secure-share.com', 'onedrive-secure.com',
    'dropbox-file-alert.com', 'secure-dropbox.com', 'quickbooks-payments.net',
    'intuit-security.com', 'irs-tax-update.com', 'gov-refund-center.com'
}

SUSPICIOUS_DOMAIN_PATTERNS = {
    'secure', 'account', 'update', 'verify', 'login', 'signin', 'auth',
    'support', 'customer', 'billing', 'payment', 'alert', 'notice', 'review',
    'refund', 'claim', 'unlock', 'wallet', 'crypto', 'airdrop', 'bonus',
    'freegift'
}

# ==================== HELPER FUNCTIONS ====================

def extract_all_urls(text):
    """Extract all URLs from text"""
    if not text or pd.isna(text):
        return []
    text_str = str(text)
    # Multiple URL patterns
    patterns = [
        r'https?://[^\s]+',
        r'www\.[^\s]+',
        r'[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?'
    ]
    urls = []
    for pattern in patterns:
        urls.extend(re.findall(pattern, text_str))
    return list(set(urls))  # Remove duplicates

def is_ip_address(domain):
    """Check if domain is an IP address"""
    if not domain:
        return False
    return bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))

def is_private_ip(domain):
    """Check if IP is private (10.x, 192.168.x, 172.16-31.x)"""
    if not is_ip_address(domain):
        return False
    parts = domain.split('.')
    first = int(parts[0])
    second = int(parts[1]) if len(parts) > 1 else 0
    
    if first == 10:
        return True
    if first == 192 and second == 168:
        return True
    if first == 172 and 16 <= second <= 31:
        return True
    return False

def calculate_domain_entropy(domain):
    """Calculate Shannon entropy - higher = more random = more suspicious"""
    if not domain or len(domain) < 3:
        return 0.0
    
    freq = {}
    for char in domain.lower():
        freq[char] = freq.get(char, 0) + 1
    
    entropy = 0.0
    for count in freq.values():
        p = count / len(domain)
        entropy -= p * math.log2(p)
    
    return entropy

def has_suspicious_pattern(domain):
    """Detect suspicious patterns in domain"""
    if not domain:
        return False
    
    domain_lower = domain.lower()
    
    # Pattern 1: Multiple hyphens (2+)
    if domain_lower.count('-') >= 2:
        return True
    
    # Pattern 2: Number-letter mixing (paypa1, amaz0n)
    if re.search(r'[a-z]\d[a-z]|\d[a-z]\d', domain_lower):
        return True
    
    # Pattern 3: Phishing suffixes
    for suffix in PHISHING_SUFFIXES:
        if suffix in domain_lower:
            return True
    
    # Pattern 4: Unusually long (>20 chars)
    domain_name = domain_lower.split('.')[0]
    if len(domain_name) > 20:
        return True
    
    return False

def has_brand_in_text(text):
    """Check if any major brand is mentioned"""
    if not text:
        return False
    text_lower = str(text).lower()
    for brand in MAJOR_BRANDS:
        if brand in text_lower:
            return True
    return False

def extract_domain_from_url(url):
    """Extract domain from URL"""
    try:
        if not url.startswith('http'):
            url = 'http://' + url
        parsed = urlparse(url)
        netloc = parsed.netloc or parsed.path.split('/')[0]
        # Remove port
        domain = netloc.split(':')[0]
        return domain
    except:
        return None

def _normalize_token(value):
    """Normalize strings for fuzzy comparison."""
    if not value:
        return ''
    return re.sub(r'[^a-z0-9]', '', value.lower())

NORMALIZED_BRANDS = [_normalize_token(brand) for brand in MAJOR_BRANDS if _normalize_token(brand)]

def levenshtein_distance(source, target, max_distance=2):
    """Compute Levenshtein distance with optional cutoff."""
    if source == target:
        return 0
    if source is None or target is None:
        return None
    len_src, len_tgt = len(source), len(target)
    if max_distance is not None and abs(len_src - len_tgt) > max_distance:
        return None
    # Ensure source is the longer string for minimal memory usage
    if len_src < len_tgt:
        source, target = target, source
        len_src, len_tgt = len_tgt, len_src
    previous_row = list(range(len_tgt + 1))
    for i, src_char in enumerate(source, start=1):
        current_row = [i]
        min_current = current_row[0]
        for j, tgt_char in enumerate(target, start=1):
            insertions = current_row[j - 1] + 1
            deletions = previous_row[j] + 1
            substitutions = previous_row[j - 1] + (src_char != tgt_char)
            best = min(insertions, deletions, substitutions)
            current_row.append(best)
            if best < min_current:
                min_current = best
        if max_distance is not None and min_current > max_distance:
            return None
        previous_row = current_row
    distance = previous_row[-1]
    if max_distance is not None and distance > max_distance:
        return None
    return distance

def get_typosquatting_features(domain):
    """Detect brand typosquatting via Levenshtein distance."""
    features = {
        'typoquatting_detected': 0,
        'typoquatting_distance': 3,
        'typoquatting_char_substitution': 0
    }
    normalized_domain = _normalize_token(domain)
    if not normalized_domain:
        return features
    best_distance = None
    best_brand = ''
    for brand in NORMALIZED_BRANDS:
        if not brand:
            continue
        if abs(len(normalized_domain) - len(brand)) > 2:
            continue
        distance = levenshtein_distance(normalized_domain, brand, max_distance=2)
        if distance is None:
            continue
        if best_distance is None or distance < best_distance:
            best_distance = distance
            best_brand = brand
            if distance == 0:
                break
    if best_distance is not None and 0 < best_distance <= 2:
        features['typoquatting_detected'] = 1
        features['typoquatting_distance'] = best_distance
        if best_brand and len(best_brand) == len(normalized_domain) and best_distance == 1:
            features['typoquatting_char_substitution'] = 1
    return features

def get_registered_domain(extracted, fallback_domain):
    """Return the registered domain (second-level + suffix)."""
    if extracted.domain and extracted.suffix:
        return f"{extracted.domain}.{extracted.suffix}".lower()
    return (fallback_domain or '').lower()

# ==================== FEATURE EXTRACTION ====================

def extract_domain_features(text):
    """Extract 20 domain-based features with explicit thresholds"""
    
    features = {
        # URL presence (2 features)
        'has_url': 0,
        'url_count': 0,
        
        # IP detection (2 features)
        'has_ip_url': 0,
        'has_private_ip': 0,
        
        # Entropy (2 features)
        'domain_entropy': 0.0,
        'high_entropy': 0,  # EXPLICIT: > 3.5
        
        # Pattern detection (4 features)
        'has_multiple_hyphens': 0,  # EXPLICIT: >= 2 hyphens
        'has_number_substitution': 0,
        'has_phishing_suffix': 0,
        'unusually_long_domain': 0,  # EXPLICIT: > 20 chars
        
        # TLD analysis (2 features)
        'has_suspicious_tld': 0,
        'is_url_shortener': 0,
        
        # Security (2 features)
        'has_https': 0,
        'has_nonstandard_port': 0,  # EXPLICIT: not 80/443
        
        # Path/Subdomain (4 features)
        'path_length': 0,
        'suspicious_path': 0,  # EXPLICIT: > 50 chars
        'subdomain_count': 0,
        'many_subdomains': 0,  # EXPLICIT: > 2
        
        # Reputation & typosquatting (8 features)
        'trusted_domain': 0,
        'blacklisted_domain': 0,
        'suspicious_domain_pattern': 0,
        'suspicious_subdomain_pattern': 0,
        'domain_reputation_score': 0.0,
        'typoquatting_detected': 0,
        'typoquatting_distance': 3,
        'typoquatting_char_substitution': 0,
    }
    
    if not text or pd.isna(text):
        return features
    
    urls = extract_all_urls(text)
    features['url_count'] = len(urls)
    features['has_url'] = 1 if urls else 0
    
    if not urls:
        return features
    
    # Analyze first URL (most important)
    url = urls[0]
    
    try:
        # Parse URL
        if not url.startswith('http'):
            url = 'http://' + url
        parsed = urlparse(url)
        netloc = parsed.netloc or parsed.path.split('/')[0]
        path = parsed.path
        
        # Extract domain
        domain_with_port = netloc.split(':')[0]
        
        # IP detection
        if is_ip_address(domain_with_port):
            features['has_ip_url'] = 1
            if is_private_ip(domain_with_port):
                features['has_private_ip'] = 1
        
        # Port detection
        if ':' in netloc:
            try:
                port = int(netloc.split(':')[-1])
                if port not in [80, 443]:
                    features['has_nonstandard_port'] = 1
            except:
                pass
        
        # HTTPS check
        if urls[0].startswith('https://'):
            features['has_https'] = 1
        
        # Extract domain parts
        extracted = tldextract.extract(url)
        domain = extracted.domain
        tld = extracted.suffix
        registered_domain = get_registered_domain(extracted, domain_with_port)
        subdomain_lower = extracted.subdomain.lower() if extracted.subdomain else ''
        
        # Domain entropy (EXPLICIT THRESHOLD)
        if domain:
            entropy = calculate_domain_entropy(domain)
            features['domain_entropy'] = entropy
            features['high_entropy'] = 1 if entropy > 3.5 else 0
            
            # Pattern detection
            domain_lower = domain.lower()
            
            # Multiple hyphens (EXPLICIT: >= 2)
            if domain_lower.count('-') >= 2:
                features['has_multiple_hyphens'] = 1
            
            # Number substitution
            if re.search(r'[a-z]\d[a-z]|\d[a-z]\d', domain_lower):
                features['has_number_substitution'] = 1
            
            # Phishing suffixes
            if any(suffix in domain_lower for suffix in PHISHING_SUFFIXES):
                features['has_phishing_suffix'] = 1
            
            # Long domain (EXPLICIT: > 20)
            if len(domain) > 20:
                features['unusually_long_domain'] = 1
            # Typosquatting detection
            typo_features = get_typosquatting_features(domain)
            for key, value in typo_features.items():
                features[key] = value
        
        # TLD checks
        if tld:
            tld_last = tld.split('.')[-1].lower()
            if tld_last in SUSPICIOUS_TLDS:
                features['has_suspicious_tld'] = 1
        
        # URL shortener
        full_domain = f"{domain}.{tld}" if domain and tld else domain_with_port
        if any(shortener in full_domain.lower() for shortener in URL_SHORTENERS):
            features['is_url_shortener'] = 1

        # Reputation lists
        if registered_domain:
            if registered_domain in TRUSTED_DOMAINS:
                features['trusted_domain'] = 1
            if registered_domain in BLOCKED_DOMAINS:
                features['blacklisted_domain'] = 1
            if not features['trusted_domain'] and any(pattern in registered_domain for pattern in SUSPICIOUS_DOMAIN_PATTERNS):
                features['suspicious_domain_pattern'] = 1
        if subdomain_lower and not features['trusted_domain']:
            if any(pattern in subdomain_lower for pattern in SUSPICIOUS_DOMAIN_PATTERNS):
                features['suspicious_subdomain_pattern'] = 1
        
        # Path analysis
        features['path_length'] = len(path)
        if len(path) > 50:
            features['suspicious_path'] = 1
        
        # Subdomain count (EXPLICIT: > 2)
        subdomain_count = extracted.subdomain.count('.') + (1 if extracted.subdomain else 0)
        features['subdomain_count'] = subdomain_count
        if subdomain_count > 2:
            features['many_subdomains'] = 1

        # Aggregate domain reputation score
        reputation = 0.0
        if features['trusted_domain']:
            reputation += 2.0
        if features['blacklisted_domain']:
            reputation -= 3.0
        if features['suspicious_domain_pattern'] or features['suspicious_subdomain_pattern']:
            reputation -= 1.0
        if features['has_suspicious_tld']:
            reputation -= 1.0
        if features['is_url_shortener']:
            reputation -= 1.0
        if features['has_https']:
            reputation += 0.5
        features['domain_reputation_score'] = reputation
            
    except Exception as e:
        pass
    
    return features

def extract_brand_features(text):
    """Extract 8 brand impersonation features"""
    
    features = {
        'has_brand_mention': 0,
        'brand_with_urgency': 0,
        'brand_with_verify': 0,
        'brand_with_financial': 0,
        'brand_with_suspicious_domain': 0,
        'multiple_brands': 0,
        'brand_count': 0,
        'brand_domain_mismatch': 0  # Advanced: brand in text but different domain
    }
    
    if not text or pd.isna(text):
        return features
    
    text_lower = str(text).lower()
    
    # Find mentioned brands
    mentioned_brands = [brand for brand in MAJOR_BRANDS if brand in text_lower]
    features['brand_count'] = len(mentioned_brands)
    features['has_brand_mention'] = 1 if mentioned_brands else 0
    features['multiple_brands'] = 1 if len(mentioned_brands) > 1 else 0
    
    if not mentioned_brands:
        return features
    
    # Check for urgency keywords
    urgency_words = ['urgent', 'immediately', 'now', 'suspended', 'locked', 
                     'frozen', 'expire', 'limited', 'act now']
    if any(word in text_lower for word in urgency_words):
        features['brand_with_urgency'] = 1
    
    # Check for verification keywords
    verify_words = ['verify', 'confirm', 'validate', 'authenticate']
    if any(word in text_lower for word in verify_words):
        features['brand_with_verify'] = 1
    
    # Check for financial keywords
    financial_words = ['account', 'payment', 'card', 'bank', 'transfer', 'money']
    if any(word in text_lower for word in financial_words):
        features['brand_with_financial'] = 1
    
    # Check if URL has suspicious patterns
    urls = extract_all_urls(text)
    if urls:
        for url in urls:
            domain = extract_domain_from_url(url)
            if domain and has_suspicious_pattern(domain):
                features['brand_with_suspicious_domain'] = 1
                break
        if mentioned_brands:
            normalized_mentions = [_normalize_token(brand) for brand in mentioned_brands if _normalize_token(brand)]
            domain_matches_brand = False
            for url in urls:
                domain = extract_domain_from_url(url)
                if not domain:
                    continue
                try:
                    extracted_domain = tldextract.extract(domain)
                    normalized_domain = _normalize_token(extracted_domain.domain)
                except Exception:
                    normalized_domain = _normalize_token(domain)
                if not normalized_domain:
                    continue
                if any(norm_brand in normalized_domain or normalized_domain in norm_brand for norm_brand in normalized_mentions):
                    domain_matches_brand = True
                    break
            if not domain_matches_brand:
                features['brand_domain_mismatch'] = 1
    
    return features

def extract_text_features(text):
    """Extract 12 text-based features"""
    
    features = {
        # Length metrics (3)
        'text_length': 0,
        'word_count': 0,
        'avg_word_length': 0.0,
        
        # Character ratios (3)
        'digit_ratio': 0.0,
        'uppercase_ratio': 0.0,
        'special_char_ratio': 0.0,
        
        # Keyword presence (4)
        'has_urgency': 0,
        'has_financial': 0,
        'has_verification': 0,
        'has_prize': 0,
        
        # Style indicators (2)
        'excessive_caps': 0,  # EXPLICIT: > 30% uppercase
        'excessive_punctuation': 0  # EXPLICIT: > 3 ! or ?
    }
    
    if not text or pd.isna(text):
        return features
    
    text_str = str(text)
    features['text_length'] = len(text_str)
    
    words = text_str.split()
    features['word_count'] = len(words)
    
    if words:
        features['avg_word_length'] = sum(len(w) for w in words) / len(words)
    
    # Character ratios
    if len(text_str) > 0:
        features['digit_ratio'] = sum(c.isdigit() for c in text_str) / len(text_str)
        features['uppercase_ratio'] = sum(c.isupper() for c in text_str) / len(text_str)
        features['special_char_ratio'] = sum(not c.isalnum() and not c.isspace() for c in text_str) / len(text_str)
        
        # Excessive caps (EXPLICIT: > 30%)
        if features['uppercase_ratio'] > 0.3:
            features['excessive_caps'] = 1
    
    # Excessive punctuation (EXPLICIT: > 3)
    punct_count = text_str.count('!') + text_str.count('?')
    if punct_count > 3:
        features['excessive_punctuation'] = 1
    
    text_lower = text_str.lower()
    
    # Urgency keywords
    urgency = ['urgent', 'immediately', 'now', 'act now', 'limited time', 
               'expire', 'today', 'hurry', 'quickly', 'suspended', 'locked']
    features['has_urgency'] = 1 if any(kw in text_lower for kw in urgency) else 0
    
    # Financial keywords
    financial = ['money', 'cash', 'prize', 'winner', 'claim', 'refund',
                'payment', 'account', 'bank', 'card', 'transfer', 'deposit']
    features['has_financial'] = 1 if any(kw in text_lower for kw in financial) else 0
    
    # Verification keywords
    verification = ['verify', 'confirm', 'validate', 'authenticate',
                   'code', 'otp', 'pin', 'password', 'security']
    features['has_verification'] = 1 if any(kw in text_lower for kw in verification) else 0
    
    # Prize keywords
    prize = ['congratulations', 'winner', 'selected', 'won', 'prize', 
            'reward', 'gift', 'free', 'bonus', 'lucky']
    features['has_prize'] = 1 if any(kw in text_lower for kw in prize) else 0
    
    return features

def extract_all_features(text):
    """Combine all engineered features"""
    domain_feats = extract_domain_features(text)
    brand_feats = extract_brand_features(text)
    text_feats = extract_text_features(text)
    
    # Combine all features
    all_features = {}
    all_features.update(domain_feats)
    all_features.update(brand_feats)
    all_features.update(text_feats)
    
    return all_features

# ==================== MAIN PROCESSING ====================

if __name__ == "__main__":
    print("\n📂 Loading train/test datasets...")
    
    train_df = pd.read_csv('Datasets/train_domain_stratified.csv')
    test_df = pd.read_csv('Datasets/test_domain_stratified.csv')
    
    print(f"✓ Train: {len(train_df):,} messages")
    print(f"✓ Test: {len(test_df):,} messages")
    
    # Extract features
    print("\n🔧 Extracting features from TRAIN set...")
    tqdm.pandas(desc="Processing")
    train_features = train_df['text'].progress_apply(extract_all_features)
    train_features_df = pd.DataFrame(train_features.tolist())
    
    print("\n🔧 Extracting features from TEST set...")
    test_features = test_df['text'].progress_apply(extract_all_features)
    test_features_df = pd.DataFrame(test_features.tolist())
    
    print(f"\n✓ Extracted {len(train_features_df.columns)} features")
    print(f"\nFeature list:")
    for i, col in enumerate(train_features_df.columns, 1):
        print(f"  {i:2d}. {col}")
    
    # Add labels
    train_features_df['label'] = train_df['label'].values
    test_features_df['label'] = test_df['label'].values
    
    # Save features
    print(f"\n💾 Saving feature datasets...")
    train_features_df.to_csv('Datasets/train_features.csv', index=False)
    test_features_df.to_csv('Datasets/test_features.csv', index=False)
    
    print(f"✓ Train features saved to: Datasets/train_features.csv")
    print(f"✓ Test features saved to: Datasets/test_features.csv")
    
    # Statistics
    print(f"\n📊 Feature statistics:")
    domain_cols = [c for c in train_features_df.columns if c not in ['label'] 
                   and any(x in c for x in ['url', 'ip', 'entropy', 'hyphen', 'substitution', 
                                            'phishing', 'long', 'tld', 'shortener', 'https', 
                                            'port', 'path', 'subdomain', 'trusted', 'blacklisted',
                                            'pattern', 'reputation', 'typo'])]
    print(f"\nDomain features ({len(domain_cols)}):")
    for col in domain_cols:
        mean_val = train_features_df[col].mean()
        print(f"  {col:30s}: {mean_val:.3f}")
    
    brand_cols = [c for c in train_features_df.columns if 'brand' in c]
    print(f"\nBrand features ({len(brand_cols)}):")
    for col in brand_cols:
        mean_val = train_features_df[col].mean()
        print(f"  {col:30s}: {mean_val:.3f}")
    
    text_cols = [c for c in train_features_df.columns if c not in domain_cols + brand_cols + ['label']]
    print(f"\nText features ({len(text_cols)}):")
    for col in text_cols:
        mean_val = train_features_df[col].mean()
        print(f"  {col:30s}: {mean_val:.3f}")
    
    print("\n" + "="*80)
    print("✅ STEP 5 COMPLETE: Feature extraction finished!")
    print("="*80)
    print(f"\n📊 Total features: {len(train_features_df.columns) - 1} (excluding label)")
    print(f"📁 Ready for model training!")
