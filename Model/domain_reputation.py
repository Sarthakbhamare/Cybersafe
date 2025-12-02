"""
Domain Reputation Feature Extractor
Advanced features to catch IP-based phishing, URL shorteners, and suspicious domains
"""
import re
from urllib.parse import urlparse
import tldextract
import pandas as pd

# Known URL shortener domains
URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly',
    'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr', 'tiny.cc', 'tr.im', 'cli.gs',
    'x.co', 'shorturl.at', 'cutt.ly', 'rb.gy', 'short.io', 'tiny.one',
    'hyperurl.co', 'b2l.me', 'v.gd', 'lnkd.in', 'db.tt', 'qr.ae', 'bc.vc'
}

# Suspicious TLDs often used in phishing
SUSPICIOUS_TLDS = {
    'xyz', 'top', 'club', 'work', 'click', 'link', 'loan', 'download',
    'stream', 'racing', 'win', 'bid', 'accountant', 'science', 'gq',
    'cf', 'ga', 'ml', 'tk', 'info', 'online', 'site', 'tech', 'space'
}

# Known legitimate domains (major brands/services)
LEGITIMATE_DOMAINS = {
    # Email providers
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com',
    'icloud.com', 'aol.com', 'mail.com', 'zoho.com',
    
    # Financial
    'paypal.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'capitalone.com', 'citi.com', 'usbank.com', 'americanexpress.com',
    'discover.com', 'schwab.com', 'fidelity.com', 'tdbank.com',
    
    # E-commerce
    'amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'alibaba.com',
    'etsy.com', 'shopify.com', 'bestbuy.com', 'costco.com',
    
    # Tech/Social
    'google.com', 'microsoft.com', 'apple.com', 'facebook.com', 'twitter.com',
    'linkedin.com', 'instagram.com', 'youtube.com', 'netflix.com',
    'dropbox.com', 'github.com', 'stackoverflow.com', 'reddit.com',
    
    # Government
    'irs.gov', 'ssa.gov', 'usa.gov', 'usps.com', 'dmv.gov',
    
    # Crypto
    'coinbase.com', 'binance.com', 'kraken.com', 'blockchain.com',
    
    # Other trusted
    'adobe.com', 'zoom.us', 'slack.com', 'salesforce.com', 'oracle.com'
}

# Common legitimate second-level domains
LEGITIMATE_SLD = {
    'github.io', 'herokuapp.com', 'azurewebsites.net', 'cloudfront.net',
    'amazonaws.com', 'googleusercontent.com', 'cloudflare.com'
}


def extract_all_urls(text):
    """Extract all URLs from text."""
    if not text or pd.isna(text):
        return []
    
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, str(text))
    
    # Also catch www. patterns
    www_pattern = r'www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),])+'
    www_urls = re.findall(www_pattern, str(text))
    urls.extend(['http://' + u for u in www_urls])
    
    return urls


def is_ip_address(host):
    """Check if host is an IP address (IPv4 or IPv6)."""
    if not host:
        return False
    
    # IPv4 pattern
    ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}(:\d+)?$'
    if re.match(ipv4_pattern, host):
        return True
    
    # IPv6 pattern (simplified)
    if ':' in host and not '.' in host:
        return True
    
    return False


def is_private_ip(host):
    """Check if IP is in private range (10.x, 192.168.x, 172.16-31.x)."""
    if not host:
        return False
    
    ip_match = re.match(r'^(\d+)\.(\d+)\.(\d+)\.(\d+)', host)
    if not ip_match:
        return False
    
    octets = [int(x) for x in ip_match.groups()]
    
    # Private ranges
    if octets[0] == 10:
        return True
    if octets[0] == 172 and 16 <= octets[1] <= 31:
        return True
    if octets[0] == 192 and octets[1] == 168:
        return True
    if octets[0] == 127:  # Localhost
        return True
    
    return False


def has_non_standard_port(url):
    """Check if URL uses non-standard port."""
    try:
        parsed = urlparse(url if url.startswith('http') else 'http://' + url)
        port = parsed.port
        
        if port and port not in [80, 443]:
            return True
        
        # Also check for port in netloc
        if ':' in parsed.netloc and not is_ip_address(parsed.netloc.split(':')[0]):
            port_str = parsed.netloc.split(':')[-1]
            if port_str.isdigit():
                return int(port_str) not in [80, 443]
    except:
        pass
    
    return False


def extract_domain_features(text):
    """
    Extract advanced domain reputation features.
    
    Returns dict with:
    - has_ip_url: URL contains IP address
    - has_private_ip: URL contains private/local IP
    - has_non_standard_port: URL uses unusual port
    - has_url_shortener: URL uses known shortener
    - has_suspicious_tld: Domain uses suspicious TLD
    - has_legitimate_domain: Domain is known legitimate
    - domain_entropy: Randomness of domain name
    - subdomain_count: Number of subdomains
    - url_path_length: Average path length
    - has_https: Uses HTTPS protocol
    """
    import pandas as pd
    
    features = {
        'has_ip_url': 0,
        'has_private_ip': 0,
        'has_non_standard_port': 0,
        'has_url_shortener': 0,
        'has_suspicious_tld': 0,
        'has_legitimate_domain': 0,
        'domain_entropy': 0.0,
        'subdomain_count': 0,
        'url_path_length': 0,
        'has_https': 0
    }
    
    if not text or pd.isna(text):
        return features
    
    urls = extract_all_urls(str(text))
    
    if not urls:
        return features
    
    # Analyze first URL (primary)
    url = urls[0]
    
    try:
        parsed = urlparse(url if url.startswith('http') else 'http://' + url)
        host = parsed.netloc.split(':')[0]  # Remove port
        
        # IP address detection
        if is_ip_address(host):
            features['has_ip_url'] = 1
            if is_private_ip(host):
                features['has_private_ip'] = 1
        
        # Non-standard port
        if has_non_standard_port(url):
            features['has_non_standard_port'] = 1
        
        # Extract domain components
        ext = tldextract.extract(url)
        domain = ext.domain
        tld = ext.suffix
        subdomain = ext.subdomain
        
        # URL shortener detection
        full_domain = f"{domain}.{tld}" if domain and tld else host
        if full_domain.lower() in URL_SHORTENERS:
            features['has_url_shortener'] = 1
        
        # Suspicious TLD
        if tld and tld.lower() in SUSPICIOUS_TLDS:
            features['has_suspicious_tld'] = 1
        
        # Legitimate domain check
        if full_domain.lower() in LEGITIMATE_DOMAINS:
            features['has_legitimate_domain'] = 1
        
        # Check second-level domain (e.g., github.io)
        if subdomain and domain and tld:
            sld = f"{domain}.{tld}".lower()
            if sld in LEGITIMATE_SLD:
                features['has_legitimate_domain'] = 1
        
        # Domain entropy (randomness)
        if domain:
            import math
            domain_lower = domain.lower()
            freq = {}
            for char in domain_lower:
                freq[char] = freq.get(char, 0) + 1
            
            entropy = 0.0
            for count in freq.values():
                prob = count / len(domain_lower)
                entropy -= prob * math.log2(prob)
            
            features['domain_entropy'] = entropy
        
        # Subdomain count
        if subdomain:
            features['subdomain_count'] = len(subdomain.split('.'))
        
        # URL path length
        if parsed.path:
            features['url_path_length'] = len(parsed.path)
        
        # HTTPS
        if parsed.scheme == 'https':
            features['has_https'] = 1
    
    except Exception as e:
        pass
    
    return features


def batch_extract_domain_features(texts):
    """Extract domain features for multiple texts."""
    import pandas as pd
    
    results = []
    for text in texts:
        results.append(extract_domain_features(text))
    
    return pd.DataFrame(results)


if __name__ == '__main__':
    # Test cases
    import pandas as pd
    
    test_cases = [
        "Login at http://192.168.1.1:8080/admin",
        "Click here: http://bit.ly/abc123",
        "Verify at https://secure-paypal.xyz/verify",
        "Amazon order: https://amazon.com/orders",
        "Reset password: http://github.io/reset",
        "Download from http://free-software.tk",
    ]
    
    print("Testing Domain Reputation Features:")
    print("=" * 80)
    
    for text in test_cases:
        features = extract_domain_features(text)
        print(f"\nText: {text}")
        print("Features:")
        for key, value in features.items():
            if value != 0 and value != 0.0:
                print(f"  {key}: {value}")
