import os
import re
import math
import joblib
import numpy as np
import pandas as pd
from urllib.parse import urlparse
from scipy.sparse import hstack, csr_matrix
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import tldextract

# --- Configuration ---
app = FastAPI(
    title="Generalized Scam Detection API",
    description="Advanced scam detection using pattern recognition (works on unseen domains)",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Constants ---
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

# --- Data Models ---
class TextRequest(BaseModel):
    text: str

class ScamPredictionResponse(BaseModel):
    input_text: str
    prediction: str
    confidence: float
    threat_indicators: dict

# --- Helper Functions ---
def is_ip_address(domain):
    if not domain: return False
    return bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))

def calculate_domain_entropy(domain):
    if not domain or len(domain) < 3: return 0.0
    freq = {}
    for c in domain: freq[c] = freq.get(c, 0) + 1
    entropy = 0.0
    for cnt in freq.values():
        p = cnt / len(domain)
        entropy -= p * math.log2(p)
    return entropy

def has_suspicious_pattern(domain):
    if not domain: return False
    d = domain.lower()
    if d.count('-') >= 2: return True
    if re.search(r'[a-z]\d[a-z]|\d[a-z]\d', d): return True
    suffixes = ['secure', 'verify', 'login', 'account', 'update', 'confirm', 'alert', 'support', 'service', 'online', 'verif']
    if any(s in d.split('.')[0] or d.endswith(s) for s in suffixes): return True
    if len(d.split('.')[0]) > 20: return True
    return False

def extract_all_urls(text):
    if not text: return []
    return re.findall(r'https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?', str(text))

def extract_domain_features(text):
    feats = {
        'has_url': 0, 'url_count': 0, 'has_ip_url': 0, 'has_url_shortener': 0, 
        'has_suspicious_tld': 0, 'avg_domain_entropy': 0.0, 'has_suspicious_pattern': 0, 
        'has_https': 0, 'has_non_standard_port': 0, 'text_length': len(str(text)), 
        'word_count': len(str(text).split()), 'digit_ratio': 0.0, 'uppercase_ratio': 0.0, 
        'special_char_ratio': 0.0, 'has_urgency': 0, 'has_financial_keywords': 0, 
        'has_verification_keywords': 0, 'has_prize_keywords': 0
    }
    
    if not text: return feats
    txt = str(text)
    txt_l = txt.lower()
    
    urls = extract_all_urls(txt)
    feats['url_count'] = len(urls)
    feats['has_url'] = 1 if urls else 0
    
    if urls:
        entropies = []
        for url in urls:
            try:
                if not url.startswith(('http://', 'https://')):
                    url = 'http://' + url
                parsed = urlparse(url)
                netloc = parsed.netloc or parsed.path.split('/')[0]
                
                if is_ip_address(netloc.split(':')[0]): feats['has_ip_url'] = 1
                if ':' in netloc and netloc.split(':')[-1].isdigit():
                    port = int(netloc.split(':')[-1])
                    if port not in [80, 443]: feats['has_non_standard_port'] = 1
                
                if url.startswith('https://'): feats['has_https'] = 1
                
                ext = tldextract.extract(url)
                d, tld = ext.domain, ext.suffix
                full_d = f"{d}.{tld}" if d and tld else netloc
                
                if full_d.lower() in URL_SHORTENERS: feats['has_url_shortener'] = 1
                if tld and tld.split('.')[-1].lower() in SUSPICIOUS_TLDS: feats['has_suspicious_tld'] = 1
                
                if d:
                    entropies.append(calculate_domain_entropy(d))
                    if has_suspicious_pattern(d): feats['has_suspicious_pattern'] = 1
            except: continue
        
        if entropies: feats['avg_domain_entropy'] = float(np.mean(entropies))
    
    if txt:
        dcnt = sum(c.isdigit() for c in txt)
        ucnt = sum(c.isupper() for c in txt)
        scnt = sum(not c.isalnum() and not c.isspace() for c in txt)
        feats['digit_ratio'] = dcnt / len(txt)
        feats['uppercase_ratio'] = ucnt / len(txt)
        feats['special_char_ratio'] = scnt / len(txt)
    
    urgency = ['urgent', 'immediately', 'now', 'act now', 'limited time', 'expire', 'suspended', 'locked', 'frozen']
    feats['has_urgency'] = 1 if any(k in txt_l for k in urgency) else 0
    
    financial = ['bank', 'account', 'card', 'payment', 'money', 'transfer', 'refund', 'prize', 'win', 'won', 'claim', 'reward']
    feats['has_financial_keywords'] = 1 if any(k in txt_l for k in financial) else 0
    
    verification = ['verify', 'verification', 'confirm', 'validate', 'authenticate', 'code', 'otp', 'pin']
    feats['has_verification_keywords'] = 1 if any(k in txt_l for k in verification) else 0
    
    prize = ['congratulations', 'winner', 'selected', 'prize', 'gift', 'free']
    feats['has_prize_keywords'] = 1 if any(k in txt_l for k in prize) else 0
    
    return feats

def preprocess(text):
    if not text: return ""
    t = str(text).lower()
    t = re.sub(r'https?://[^\s]+', ' URL ', t)
    t = re.sub(r'www\.[^\s]+', ' URL ', t)
    t = re.sub(r'[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?', ' URL ', t)
    t = re.sub(r'\S+@\S+', ' EMAIL ', t)
    t = re.sub(r'\d{10,}', ' PHONE ', t)
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

# --- Load Models ---
current_dir = os.path.dirname(os.path.abspath(__file__))
artifacts_dir = os.path.join(current_dir, "..", "artifacts")

try:
    model = joblib.load(os.path.join(artifacts_dir, "scam_detector_generalized.joblib"))
    vectorizer = joblib.load(os.path.join(artifacts_dir, "tfidf_vectorizer_generalized.joblib"))
    scaler = joblib.load(os.path.join(artifacts_dir, "feature_scaler_generalized.joblib"))
    print("✓ Generalized model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    vectorizer = None
    scaler = None

def predict_message(text):
    if not model:
        raise Exception("Model not loaded")
        
    X_txt = vectorizer.transform([preprocess(text)])
    feats = extract_domain_features(text)
    X_feat = scaler.transform(pd.DataFrame([feats]))
    X = hstack([X_txt, csr_matrix(X_feat)])
    
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0, 1]
    
    indicators = {
        "ip_based_url": bool(feats['has_ip_url']),
        "url_shortener": bool(feats['has_url_shortener']),
        "suspicious_tld": bool(feats['has_suspicious_tld']),
        "suspicious_pattern": bool(feats['has_suspicious_pattern']),
        "urgency_keywords": bool(feats['has_urgency']),
        "high_entropy_domain": feats['avg_domain_entropy'] > 3.5,
        "total_red_flags": sum([
            feats['has_ip_url'], feats['has_url_shortener'], 
            feats['has_suspicious_tld'], feats['has_suspicious_pattern'], 
            feats['has_urgency'], 1 if feats['avg_domain_entropy'] > 3.5 else 0
        ])
    }
    return pred, prob, indicators

# --- API Endpoints ---
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>Scam Detection API</title></head>
        <body style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
            <h1>🚀 Generalized Scam Detection API v3.0</h1>
            <p>Status: <strong>Running</strong></p>
            <p>Documentation: <a href="/docs">/docs</a></p>
        </body>
    </html>
    """

@app.post("/predict-scam", response_model=ScamPredictionResponse)
async def predict_scam(req: TextRequest):
    try:
        pred, conf, indicators = predict_message(req.text)
        return ScamPredictionResponse(
            input_text=req.text,
            prediction="scam" if pred == 1 else "not a scam",
            confidence=float(conf if pred == 1 else 1 - conf),
            threat_indicators=indicators
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "generalized", "version": "3.0"}

if __name__ == "__main__":
    print("="*80)
    print("🚀 Generalized Scam Detection API v3.0 - Pattern-based")
    print("="*80)
    uvicorn.run(app, host="0.0.0.0", port=8004)
