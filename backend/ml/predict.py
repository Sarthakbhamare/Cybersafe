#!/usr/bin/env python3
"""CyberSafe ML Prediction Service - Production API"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import re
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Load artifacts
ARTIFACT_DIR = Path(__file__).parent / 'artifacts'
model = joblib.load(ARTIFACT_DIR / 'scam_detector.joblib')
vectorizer = joblib.load(ARTIFACT_DIR / 'vectorizer.joblib')
scaler = joblib.load(ARTIFACT_DIR / 'feature_scaler.joblib')

with open(ARTIFACT_DIR / 'thresholds.json') as f:
    thresholds = json.load(f)

def extract_features(text):
    """Extract 13 domain-specific features (matches XGBoost training)"""
    text_lower = text.lower()
    
    # Urgency words
    urgency_words = ['urgent', 'immediately', 'now', 'hurry', 'limited', 'expires', 
                     'act fast', 'must', 'asap', 'quickly', 'final', 'last chance']
    urgency_score = sum(1 for word in urgency_words if word in text_lower)
    
    # Money indicators
    money_words = ['$', 'prize', 'won', 'claim', 'free', 'money', 'cash', 'reward', 
                   'lottery', 'refund', 'payment', '₹', '€', '£']
    money_score = sum(1 for word in money_words if word in text_lower)
    
    # Action verbs
    action_words = ['click', 'verify', 'confirm', 'update', 'submit', 'download', 
                   'call', 'send', 'reply', 'respond', 'open']
    action_score = sum(1 for word in action_words if word in text_lower)
    
    # Text analysis
    text_length = len(text)
    word_count = len(text.split())
    special_char_count = len(re.findall(r'[!@#$%^&*()]', text))
    special_char_ratio = special_char_count / max(text_length, 1)
    
    # URL detection
    has_url = 1 if re.search(r'http[s]?://|www\.', text_lower) else 0
    url_count = len(re.findall(r'http[s]?://|www\.', text_lower))
    
    # Capitalization
    upper_ratio = sum(1 for c in text if c.isupper()) / max(text_length, 1)
    lower_ratio = sum(1 for c in text if c.islower()) / max(text_length, 1)
    
    # Suspicious patterns
    suspicious_chars = len(re.findall(r'[₹€£¥]|0[lO]|[1l]1', text))
    
    # Digit ratio
    digit_ratio = len(re.findall(r'\d', text)) / max(text_length, 1)
    
    # Combined risk score
    combined_risk = (urgency_score * 0.3 + money_score * 0.3 + 
                    action_score * 0.2 + special_char_ratio * 0.1 + 
                    digit_ratio * 0.1)
    
    return np.array([[
        text_length, word_count, urgency_score, money_score, 
        action_score, special_char_ratio, has_url, url_count,
        upper_ratio, lower_ratio, suspicious_chars, digit_ratio, 
        combined_risk
    ]])

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'loaded'})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict if text is scam or legitimate"""
    try:
        data = request.json
        text = data.get('text', '')
        channel = data.get('channel', 'general').lower()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Get TF-IDF features
        tfidf_features = vectorizer.transform([text])
        
        # Get domain features
        domain_features = extract_features(text)
        
        # Scale domain features (XGBoost requires this)
        domain_features = scaler.transform(domain_features)
        
        # Combine features (497 TF-IDF + 13 domain = 510 total for XGBoost)
        combined_features = np.hstack([tfidf_features.toarray(), domain_features])
        
        # Get prediction probability
        proba = model.predict_proba(combined_features)[0][1]  # Probability of scam
        
        # Apply channel-specific threshold
        threshold = thresholds.get(channel, thresholds['general'])
        is_scam = proba >= threshold
        
        # Confidence level
        confidence = 'high' if abs(proba - 0.5) > 0.3 else 'medium' if abs(proba - 0.5) > 0.15 else 'low'
        
        return jsonify({
            'is_scam': bool(is_scam),
            'scam_probability': float(proba),
            'threshold_used': float(threshold),
            'channel': channel,
            'confidence': confidence,
            'risk_level': 'high' if proba > 0.9 else 'medium' if proba > 0.7 else 'low'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Batch prediction for multiple texts"""
    try:
        data = request.json
        texts = data.get('texts', [])
        channel = data.get('channel', 'general').lower()
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        results = []
        for text in texts:
            # Get features
            tfidf_features = vectorizer.transform([text])
            domain_features = extract_features(text)
            domain_features = scaler.transform(domain_features)
            combined_features = np.hstack([tfidf_features.toarray(), domain_features])
            
            # Predict
            proba = model.predict_proba(combined_features)[0][1]
            threshold = thresholds.get(channel, thresholds['general'])
            is_scam = proba >= threshold
            
            results.append({
                'text': text,
                'is_scam': bool(is_scam),
                'scam_probability': float(proba),
                'risk_level': 'high' if proba > 0.9 else 'medium' if proba > 0.7 else 'low'
            })
        
        return jsonify({'predictions': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 CyberSafe ML Prediction Service (XGBoost)".center(60))
    print("="*60)
    print(f"✅ XGBoost Model: {ARTIFACT_DIR / 'scam_detector.joblib'}")
    print(f"✅ Vectorizer: {ARTIFACT_DIR / 'vectorizer.joblib'}")
    print(f"✅ Feature Scaler: {ARTIFACT_DIR / 'feature_scaler.joblib'}")
    print(f"✅ Thresholds: {len(thresholds)} channels")
    print(f"\n🌐 Starting Flask server on http://localhost:5001")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
