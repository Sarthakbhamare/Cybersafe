import os
import re
import math
import sys
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

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

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
    channel: str | None = "general"
    modelTier: str | None = "standard"

class ScamPredictionResponse(BaseModel):
    input_text: str
    prediction: str
    confidence: float
    threat_indicators: dict
    model_name: str
    model_version: str
    model_tier: str

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

def detect_takeover_patterns(text):
    txt = str(text or "")
    txt_l = txt.lower()

    safe_education_context = bool(
        re.search(r"\b(do not|don't|never|avoid)\s+share\s+(the\s+)?otp\b", txt_l)
    )

    otp_share_request = bool(
        re.search(
            r"\b(share|send|tell|provide|give|forward)\b.{0,24}\b(otp|code|pin)\b|"
            r"\b(otp|code|pin)\b.{0,24}\b(share|send|tell|provide|give|forward)\b",
            txt_l,
        )
    ) and not safe_education_context

    account_block_threat = bool(
        re.search(
            r"\b(account|wallet|bank|upi|sim|number)\b.{0,35}"
            r"\b(block|blocked|suspend|suspended|lock|locked|deactivate|disabled|freeze|frozen)\b",
            txt_l,
        )
    )

    urgent_time_pressure = bool(
        re.search(
            r"\b(urgent|immediately|right now|asap|within\s+\d+\s*"
            r"(minute|minutes|min|mins|hour|hours))\b",
            txt_l,
        )
    )

    support_impersonation = bool(
        re.search(r"\b(support|customer care|helpline|bank team|official team)\b", txt_l)
    )

    takeover_combo = int(otp_share_request) + int(account_block_threat) + int(urgent_time_pressure) + int(support_impersonation)

    should_override = otp_share_request and (account_block_threat or urgent_time_pressure)

    return {
        "otp_share_request": otp_share_request,
        "account_block_threat": account_block_threat,
        "urgent_time_pressure": urgent_time_pressure,
        "support_impersonation": support_impersonation,
        "takeover_combo": takeover_combo,
        "should_override": should_override,
    }

def is_low_context_identifier(text):
    txt = str(text or "").strip()
    if not txt:
        return False

    txt_l = txt.lower()
    scam_keywords = [
        "otp", "urgent", "blocked", "verify", "kyc", "bank", "account",
        "click", "link", "suspend", "claim", "winner", "prize", "payment"
    ]
    if any(k in txt_l for k in scam_keywords):
        return False

    is_email = bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", txt))
    is_username_like = bool(re.fullmatch(r"[a-zA-Z0-9_.-]{3,40}(?:\s+\d{1,4})?", txt))
    is_phone_like = bool(re.fullmatch(r"\+?\d{8,15}", txt))

    return is_email or is_username_like or is_phone_like

# --- Load Models ---
current_dir = os.path.dirname(os.path.abspath(__file__))
artifacts_dir = os.path.join(current_dir, "..", "artifacts")

MODEL_BUNDLES = {}

def load_bundle(tier, model_file, vectorizer_file, scaler_file, model_name, model_version):
    try:
        model_obj = joblib.load(os.path.join(artifacts_dir, model_file))
        vectorizer_obj = joblib.load(os.path.join(artifacts_dir, vectorizer_file))
        scaler_obj = joblib.load(os.path.join(artifacts_dir, scaler_file))

        # Smoke-test compatibility so we don't advertise a tier that can't infer.
        sample_text = "This is a model compatibility check message."
        sample_txt = vectorizer_obj.transform([preprocess(sample_text)])
        sample_feats = scaler_obj.transform(pd.DataFrame([extract_domain_features(sample_text)]))
        sample_input = hstack([sample_txt, csr_matrix(sample_feats)])
        _ = model_obj.predict(sample_input)[0]

        MODEL_BUNDLES[tier] = {
            "model": model_obj,
            "vectorizer": vectorizer_obj,
            "scaler": scaler_obj,
            "name": model_name,
            "version": model_version,
            "tier": tier,
        }
        print(f"[OK] {tier} model loaded: {model_name} v{model_version}")
    except Exception as e:
        print(f"[WARN] Could not enable {tier} model bundle: {e}")

load_bundle(
    tier="standard",
    model_file="scam_detector_generalized.joblib",
    vectorizer_file="tfidf_vectorizer_generalized.joblib",
    scaler_file="feature_scaler_generalized.joblib",
    model_name="generalized",
    model_version="3.0"
)

# Optional latest tier: falls back to standard if unavailable.
load_bundle(
    tier="latest",
    model_file="scam_detector_xgboost.joblib",
    vectorizer_file="vectorizer_xgboost.joblib",
    scaler_file="feature_scaler_xgboost.joblib",
    model_name="xgboost",
    model_version="xgb-1"
)

def resolve_bundle(requested_tier="standard"):
    desired = (requested_tier or "standard").lower()
    if desired == "latest" and "latest" in MODEL_BUNDLES:
        return MODEL_BUNDLES["latest"]
    if "standard" in MODEL_BUNDLES:
        return MODEL_BUNDLES["standard"]
    if MODEL_BUNDLES:
        return next(iter(MODEL_BUNDLES.values()))
    return None

def predict_message(text, requested_tier="standard"):
    bundle = resolve_bundle(requested_tier)
    if not bundle:
        raise Exception("No model bundle loaded")

    model = bundle["model"]
    vectorizer = bundle["vectorizer"]
    scaler = bundle["scaler"]

    # Guard against false positives when user submits only identifiers
    # (username/email/number) without scam context.
    if is_low_context_identifier(text):
        indicators = {
            "ip_based_url": False,
            "url_shortener": False,
            "suspicious_tld": False,
            "suspicious_pattern": False,
            "urgency_keywords": False,
            "high_entropy_domain": False,
            "otp_share_request": False,
            "account_block_threat": False,
            "urgent_time_pressure": False,
            "support_impersonation": False,
            "rule_override": False,
            "low_context_identifier": True,
            "total_red_flags": 0,
        }
        return 0, 0.05, indicators, bundle
        
    X_txt = vectorizer.transform([preprocess(text)])
    feats = extract_domain_features(text)
    X_feat = scaler.transform(pd.DataFrame([feats]))
    X = hstack([X_txt, csr_matrix(X_feat)])
    
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0, 1]

    takeover = detect_takeover_patterns(text)

    # Hybrid safety guardrail: force obvious OTP takeover attempts to scam.
    if takeover["should_override"]:
        pred = 1
        prob = max(float(prob), 0.90)
    elif takeover["takeover_combo"] >= 3 and float(prob) < 0.80:
        pred = 1
        prob = max(float(prob), 0.82)
    
    indicators = {
        "ip_based_url": bool(feats['has_ip_url']),
        "url_shortener": bool(feats['has_url_shortener']),
        "suspicious_tld": bool(feats['has_suspicious_tld']),
        "suspicious_pattern": bool(feats['has_suspicious_pattern']),
        "urgency_keywords": bool(feats['has_urgency']),
        "high_entropy_domain": feats['avg_domain_entropy'] > 3.5,
        "otp_share_request": takeover["otp_share_request"],
        "account_block_threat": takeover["account_block_threat"],
        "urgent_time_pressure": takeover["urgent_time_pressure"],
        "support_impersonation": takeover["support_impersonation"],
        "rule_override": takeover["should_override"],
        "low_context_identifier": False,
        "total_red_flags": sum([
            feats['has_ip_url'], feats['has_url_shortener'], 
            feats['has_suspicious_tld'], feats['has_suspicious_pattern'], 
            feats['has_urgency'], 1 if feats['avg_domain_entropy'] > 3.5 else 0,
            int(takeover["otp_share_request"]), int(takeover["account_block_threat"]),
            int(takeover["urgent_time_pressure"]), int(takeover["support_impersonation"]),
        ])
    }
    return pred, prob, indicators, bundle

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
        pred, conf, indicators, bundle = predict_message(req.text, req.modelTier)
        return ScamPredictionResponse(
            input_text=req.text,
            prediction="scam" if pred == 1 else "not a scam",
            confidence=float(conf if pred == 1 else 1 - conf),
            threat_indicators=indicators,
            model_name=bundle["name"],
            model_version=bundle["version"],
            model_tier=bundle["tier"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    active_standard = MODEL_BUNDLES.get("standard")
    return {
        "status": "healthy",
        "model": active_standard["name"] if active_standard else "unavailable",
        "version": active_standard["version"] if active_standard else "unknown",
        "available_tiers": list(MODEL_BUNDLES.keys()),
    }

if __name__ == "__main__":
    print("="*80)
    print("[START] Generalized Scam Detection API v3.0 - Pattern-based")
    print("="*80)
    uvicorn.run(app, host="0.0.0.0", port=8004)
