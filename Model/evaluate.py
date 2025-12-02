#!/usr/bin/env python
"""Evaluation script for Scam Message Detection Model.

Categories covered:
- Performance
- Generalization
- Robustness (optional adversarial tests)
- Efficiency
- Complexity
- Interpretability (global + LIME local)
- Fairness (length buckets)
- Data Quality
- Stability (repeat run)
- Deployment readiness summary
- Business fit notes

Usage:
python model/evaluate.py --data model/artifacts/dataset.csv --model model/artifacts/scam_detector_model.joblib --vectorizer model/artifacts/scam_tfidf_vectorizer.joblib --out model/reports --cv-folds 5 --lime-explain 3 --adversarial
"""
import argparse
import json
import os
import time
import hashlib
import random
import re
import math
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import pandas as pd
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve, average_precision_score)
from sklearn.model_selection import StratifiedKFold
from sklearn.utils import Bunch
from scipy.sparse import hstack, csr_matrix
import joblib
import matplotlib
matplotlib.use('Agg')  # headless backend for CI / server environments
import matplotlib.pyplot as plt
import seaborn as sns
import tldextract

try:
    from lime.lime_text import LimeTextExplainer
    LIME_AVAILABLE = True
except Exception:
    LIME_AVAILABLE = False

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

# --- Feature Extraction Logic (Copied from train_generalized_model.py) ---
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
    if not domain or len(domain) < 3:
        return 0.0
    freq = {}
    for char in domain:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / len(domain)
        entropy -= p * math.log2(p)
    return entropy

def has_suspicious_pattern(domain):
    if not domain:
        return False
    domain_lower = domain.lower()
    if domain_lower.count('-') >= 2:
        return True
    if re.search(r'[a-z]\d[a-z]|\d[a-z]\d', domain_lower):
        return True
    suspicious_suffixes = ['secure', 'verify', 'login', 'account', 'update', 
                          'confirm', 'alert', 'support', 'service', 'online']
    for suffix in suspicious_suffixes:
        if domain_lower.endswith(suffix):
            return True
    if len(domain_lower.split('.')[0]) > 20:
        return True
    return False

def extract_generalized_features(text):
    features = {
        'has_url': 0, 'url_count': 0, 'has_ip_url': 0, 'has_url_shortener': 0,
        'has_suspicious_tld': 0, 'avg_domain_entropy': 0.0, 'has_suspicious_pattern': 0,
        'has_https': 0, 'has_non_standard_port': 0,
        'text_length': len(str(text)), 'word_count': len(str(text).split()),
        'digit_ratio': 0.0, 'uppercase_ratio': 0.0, 'special_char_ratio': 0.0,
        'has_urgency': 0, 'has_financial_keywords': 0, 'has_verification_keywords': 0, 'has_prize_keywords': 0,
    }
    
    if not text or pd.isna(text):
        return features
    
    text_str = str(text)
    text_lower = text_str.lower()
    
    urls = extract_all_urls(text_str)
    features['url_count'] = len(urls)
    features['has_url'] = 1 if urls else 0
    
    if urls:
        entropy_values = []
        for url in urls:
            try:
                parsed = urlparse(url if url.startswith('http') else f'http://{url}')
                netloc = parsed.netloc or parsed.path.split('/')[0]
                if is_ip_address(netloc.split(':')[0]): features['has_ip_url'] = 1
                if ':' in netloc and netloc.split(':')[-1].isdigit():
                    port = int(netloc.split(':')[-1])
                    if port not in [80, 443]: features['has_non_standard_port'] = 1
                if url.startswith('https://'): features['has_https'] = 1
                extracted = tldextract.extract(url)
                domain = extracted.domain
                tld = extracted.suffix
                full_domain = f"{domain}.{tld}" if domain and tld else netloc
                if full_domain.lower() in URL_SHORTENERS: features['has_url_shortener'] = 1
                if tld and tld.split('.')[-1].lower() in SUSPICIOUS_TLDS: features['has_suspicious_tld'] = 1
                if domain:
                    entropy_values.append(calculate_domain_entropy(domain))
                    if has_suspicious_pattern(domain): features['has_suspicious_pattern'] = 1
            except: continue
        if entropy_values: features['avg_domain_entropy'] = np.mean(entropy_values)
    
    if text_str:
        digit_count = sum(c.isdigit() for c in text_str)
        upper_count = sum(c.isupper() for c in text_str)
        special_count = sum(not c.isalnum() and not c.isspace() for c in text_str)
        features['digit_ratio'] = digit_count / len(text_str)
        features['uppercase_ratio'] = upper_count / len(text_str)
        features['special_char_ratio'] = special_count / len(text_str)
    
    urgency_keywords = ['urgent', 'immediately', 'now', 'act now', 'limited time', 'expire', 'suspended', 'locked', 'frozen']
    features['has_urgency'] = 1 if any(kw in text_lower for kw in urgency_keywords) else 0
    financial_keywords = ['bank', 'account', 'card', 'payment', 'money', 'transfer', 'refund', 'prize', 'win', 'won', 'claim', 'reward']
    features['has_financial_keywords'] = 1 if any(kw in text_lower for kw in financial_keywords) else 0
    verification_keywords = ['verify', 'verification', 'confirm', 'validate', 'authenticate', 'code', 'otp', 'pin']
    features['has_verification_keywords'] = 1 if any(kw in text_lower for kw in verification_keywords) else 0
    prize_keywords = ['congratulations', 'winner', 'selected', 'prize', 'gift', 'free']
    features['has_prize_keywords'] = 1 if any(kw in text_lower for kw in prize_keywords) else 0
    
    return features

def preprocess_text(text):
    if not text or pd.isna(text): return ""
    text = str(text).lower()
    text = re.sub(r'https?://[^\s]+', ' URL ', text)
    text = re.sub(r'www\.[^\s]+', ' URL ', text)
    text = re.sub(r'[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?', ' URL ', text)
    text = re.sub(r'\S+@\S+', ' EMAIL ', text)
    text = re.sub(r'\d{10,}', ' PHONE ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --- End Feature Extraction Logic ---

def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', required=True, help='CSV dataset path with columns: text,label (supports text/message and spam/ham)')
    ap.add_argument('--model', required=True, help='Joblib path to trained LogisticRegression model')
    ap.add_argument('--vectorizer', required=True, help='Joblib path to fitted TfidfVectorizer')
    ap.add_argument('--scaler', required=False, help='Joblib path to fitted StandardScaler (optional, but needed for generalized model)')
    ap.add_argument('--out', required=True, help='Output directory for reports')
    ap.add_argument('--cv-folds', type=int, default=0, help='Number of cross-validation folds (0 to disable)')
    ap.add_argument('--lime-explain', type=int, default=0, help='Number of LIME examples to generate')
    ap.add_argument('--adversarial', action='store_true', help='Run robustness adversarial tests')
    ap.add_argument('--text-col', default=None, help='Name of text column (auto-detects text/message if None)')
    ap.add_argument('--label-col', default='label', help='Name of label column')
    return ap.parse_args()


def ensure_out_dir(path: str):
    Path(path).mkdir(parents=True, exist_ok=True)


def load_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def artifact_hash(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def compute_performance(y_true, y_pred, y_proba) -> Bunch:
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    roc_auc = roc_auc_score(y_true, y_proba[:, 1])
    pr_auc = average_precision_score(y_true, y_proba[:, 1])
    cm = confusion_matrix(y_true, y_pred).tolist()
    return Bunch(accuracy=acc, precision=prec, recall=rec, f1=f1, roc_auc=roc_auc, pr_auc=pr_auc, confusion_matrix=cm)


def plot_curves(y_true, y_proba, out_dir):
    fpr, tpr, _ = roc_curve(y_true, y_proba[:, 1])
    prec, rec, _ = precision_recall_curve(y_true, y_proba[:, 1])
    # ROC
    plt.figure()
    plt.plot(fpr, tpr, label='ROC curve')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('FPR')
    plt.ylabel('TPR')
    plt.title('ROC Curve')
    plt.legend()
    plt.savefig(os.path.join(out_dir, 'roc_curve.png'), dpi=150)
    plt.close()
    # PR
    plt.figure()
    plt.plot(rec, prec, label='PR curve')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend()
    plt.savefig(os.path.join(out_dir, 'pr_curve.png'), dpi=150)
    plt.close()


def plot_confusion(cm, out_dir):
    plt.figure()
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix (0=legitimate, 1=scam)')
    plt.savefig(os.path.join(out_dir, 'confusion_matrix.png'), dpi=150)
    plt.close()


def prepare_features(texts, vectorizer, scaler=None):
    # 1. Preprocess text
    processed_texts = [preprocess_text(t) for t in texts]
    
    # 2. TF-IDF Vectorization
    X_tfidf = vectorizer.transform(processed_texts)
    
    # 3. Feature Extraction (if scaler provided)
    if scaler:
        feature_dicts = [extract_generalized_features(t) for t in texts]
        feature_df = pd.DataFrame(feature_dicts)
        X_feat_scaled = scaler.transform(feature_df)
        X_combined = hstack([X_tfidf, csr_matrix(X_feat_scaled)])
        return X_combined
    else:
        return X_tfidf

def cross_validation(texts, y, model, vectorizer, scaler, folds: int) -> Bunch:
    skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=RANDOM_SEED)
    metrics = []
    
    # Pre-compute features once
    X = prepare_features(texts, vectorizer, scaler)
    
    # Note: This is a simplified CV that re-trains the classifier but re-uses the fixed vectorizer/scaler
    # Ideally, vectorizer/scaler should be fit inside the fold, but we are evaluating a PRE-TRAINED pipeline.
    # So we are evaluating the stability of the classifier given the fixed feature extraction.
    
    for train_idx, test_idx in skf.split(X, y):
        X_tr, X_te = X[train_idx], X[test_idx]
        y_tr, y_te = y[train_idx], y[test_idx]
        
        # Clone model to reset weights
        from sklearn.base import clone
        fold_model = clone(model)
        fold_model.fit(X_tr, y_tr)
        
        y_pred = fold_model.predict(X_te)
        y_proba = fold_model.predict_proba(X_te)
        m = compute_performance(y_te, y_pred, y_proba)
        metrics.append(m)
        
    # Aggregate
    agg = {}
    for field in ['accuracy', 'precision', 'recall', 'f1', 'roc_auc', 'pr_auc']:
        vals = [getattr(m, field) for m in metrics]
        agg[field] = {'mean': float(np.mean(vals)), 'std': float(np.std(vals))}
    return Bunch(fold_metrics=[m.__dict__ for m in metrics], aggregate=agg)


def generate_global_feature_weights(vectorizer, model, out_dir, top_k=20):
    if not hasattr(model, 'coef_'):
        return None
    
    # Note: This only works for the TF-IDF part if we don't have feature names for the extra features easily available
    # For now, we'll just use the vectorizer features and ignore the extra ones for this specific report
    # or try to reconstruct the full feature list
    
    feature_names = list(vectorizer.get_feature_names_out())
    # Add extra feature names if model coef size > vocab size
    extra_features = [
        'has_url', 'url_count', 'has_ip_url', 'has_url_shortener',
        'has_suspicious_tld', 'avg_domain_entropy', 'has_suspicious_pattern',
        'has_https', 'has_non_standard_port',
        'text_length', 'word_count',
        'digit_ratio', 'uppercase_ratio', 'special_char_ratio',
        'has_urgency', 'has_financial_keywords', 'has_verification_keywords', 'has_prize_keywords'
    ]
    
    if model.coef_.shape[1] > len(feature_names):
        feature_names.extend(extra_features)
        
    coefs = model.coef_[0]
    
    # Safety check
    if len(coefs) != len(feature_names):
        print(f"Warning: Coef shape {len(coefs)} != Feature names {len(feature_names)}. Skipping global weights.")
        return None

    top_pos_idx = np.argsort(coefs)[-top_k:][::-1]
    top_neg_idx = np.argsort(coefs)[:top_k]
    rows = []
    for idx in top_pos_idx:
        rows.append({'feature': feature_names[idx], 'coefficient': float(coefs[idx]), 'direction': 'scam_positive'})
    for idx in top_neg_idx:
        rows.append({'feature': feature_names[idx], 'coefficient': float(coefs[idx]), 'direction': 'scam_negative'})
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(out_dir, 'global_feature_weights.csv'), index=False)
    return rows


def lime_explanations(texts, vectorizer, scaler, model, out_dir, num_samples=3):
    if not LIME_AVAILABLE:
        return {'error': 'LIME not installed'}
    class_names = ['legitimate', 'scam']
    explainer = LimeTextExplainer(class_names=class_names)

    def predict_proba(raw_texts):
        # LIME passes a list of strings. We need to transform them exactly like the model expects.
        X = prepare_features(raw_texts, vectorizer, scaler)
        return model.predict_proba(X)

    selected = texts[:num_samples]
    results = []
    for i, txt in enumerate(selected):
        try:
            exp = explainer.explain_instance(txt, predict_proba, num_features=10)
            html_path = os.path.join(out_dir, f'lime_example_{i+1}.html')
            exp.save_to_file(html_path)
            results.append({'index': i, 'text': txt, 'html': html_path})
        except Exception as e:
            print(f"LIME error for sample {i}: {e}")
    return results


def fairness_length_bucket(df, y_true, y_pred, text_col: str):
    # Buckets: short <40, medium 40-120, long >120
    lengths = df[text_col].astype(str).str.len()
    buckets = []
    for lbl, mask in [('short', lengths < 40), ('medium', (lengths >= 40) & (lengths <= 120)), ('long', lengths > 120)]:
        sub = df[mask]
        if len(sub) == 0:
            continue
        sub_idx = sub.index
        # Need to align indices if df was filtered/shuffled, but here we assume aligned arrays
        # Actually y_true and y_pred are numpy arrays aligned with df (if df wasn't reordered)
        # Safety: use boolean mask on arrays
        sub_labels = y_true[mask]
        sub_preds = y_pred[mask]
        
        if len(sub_labels) == 0: continue

        rec = recall_score(sub_labels, sub_preds, zero_division=0)
        # FPR = FP / (FP + TN)
        tn, fp, fn, tp = confusion_matrix(sub_labels, sub_preds, labels=[0,1]).ravel()
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        
        buckets.append({'bucket': lbl, 'size': int(len(sub)), 'recall': float(rec), 'false_positive_rate': float(fpr)})
    return buckets


def data_quality(df, out_dir, text_col: str, label_col: str):
    class_counts = df[label_col].value_counts().to_dict()
    lengths = df[text_col].astype(str).str.len()
    vocab_tokens = ' '.join(df[text_col].astype(str)).split()
    vocab_size = len(set(vocab_tokens))
    # Plots
    plt.figure()
    sns.barplot(x=list(class_counts.keys()), y=list(class_counts.values()))
    plt.title('Class Distribution (0=legitimate,1=scam)')
    plt.savefig(os.path.join(out_dir, 'class_distribution.png'), dpi=150)
    plt.close()

    plt.figure()
    sns.histplot(lengths, bins=30, kde=True)
    plt.title('Message Length Distribution')
    plt.savefig(os.path.join(out_dir, 'length_histogram.png'), dpi=150)
    plt.close()

    duplicates = int(df.duplicated(subset=[text_col]).sum())
    top_tokens = pd.Series(vocab_tokens).value_counts().head(30).to_dict()
    return {
        'class_counts': class_counts,
        'vocab_size': int(vocab_size),
        'avg_length': float(lengths.mean()),
        'median_length': float(lengths.median()),
        'duplicates': duplicates,
        'top_tokens': top_tokens
    }


def adversarial_perturb(text: str) -> str:
    # Simple random character substitution & noise injection
    substitutions = {'e': '3', 'a': '@', 'o': '0', 'i': '1', 's': '$'}
    chars = list(text)
    for idx in range(len(chars)):
        if random.random() < 0.05 and chars[idx].lower() in substitutions:
            chars[idx] = substitutions[chars[idx].lower()]
    # Insert benign filler words occasionally
    if random.random() < 0.3:
        chars.append(' free offer')
    return ''.join(chars)


def robustness_tests(df, vectorizer, scaler, model, text_col: str, y_true):
    original_texts = df[text_col].astype(str).tolist()
    perturbed = [adversarial_perturb(t) for t in original_texts]
    
    X_orig = prepare_features(original_texts, vectorizer, scaler)
    X_adv = prepare_features(perturbed, vectorizer, scaler)
    
    y_pred_orig = model.predict(X_orig)
    y_pred_adv = model.predict(X_adv)
    
    base = compute_performance(y_true, y_pred_orig, model.predict_proba(X_orig))
    adv = compute_performance(y_true, y_pred_adv, model.predict_proba(X_adv))
    
    perf_keys = ['accuracy','precision','recall','f1','roc_auc','pr_auc','confusion_matrix']
    base_dict = {k: getattr(base, k) for k in perf_keys}
    adv_dict = {k: getattr(adv, k) for k in perf_keys}
    return {
        'baseline': base_dict,
        'adversarial': adv_dict,
        'delta_recall': adv_dict['recall'] - base_dict['recall'],
        'delta_f1': adv_dict['f1'] - base_dict['f1']
    }


def efficiency_tests(vectorizer, scaler, model, sample_texts):
    # Single inference timing
    start = time.time()
    for t in sample_texts:
        X = prepare_features([t], vectorizer, scaler)
        _ = model.predict_proba(X)
    single_total = time.time() - start
    avg_single = single_total / len(sample_texts)
    # Batch inference timing
    batch_sizes = [64, 256]
    batch_results = {}
    for b in batch_sizes:
        batch = sample_texts[:b] if len(sample_texts) >= b else (sample_texts * (b // len(sample_texts) + 1))[:b]
        st = time.time()
        Xb = prepare_features(batch, vectorizer, scaler)
        _ = model.predict_proba(Xb)
        dur = time.time() - st
        batch_results[b] = {'total_seconds': dur, 'per_sample_ms': (dur / b) * 1000.0}
    # Artifact sizes
    return {
        'avg_single_inference_seconds': avg_single,
        'batch_inference': batch_results
    }


def main():
    args = parse_args()
    ensure_out_dir(args.out)

    df = load_data(args.data)
    # Detect text column
    text_col = args.text_col
    if text_col is None:
        if 'text' in df.columns:
            text_col = 'text'
        elif 'message' in df.columns:
            text_col = 'message'
        else:
            raise ValueError('Cannot auto-detect text column; provide --text-col')
    label_col = args.label_col
    if label_col not in df.columns:
        raise ValueError(f'Label column {label_col} not found')
    df = df.dropna(subset=[text_col, label_col]).copy()
    y_series = df[label_col]
    if y_series.dtype == object:
        lower = y_series.str.lower()
        if set(lower.unique()) == {'spam', 'ham'}:
            y = (lower == 'spam').astype(int).values
        elif set(lower.unique()) == {'scam', 'legitimate'}:
            y = (lower == 'scam').astype(int).values
        else:
            # Try to map anyway if it looks like 0/1 strings
            try:
                y = y_series.astype(int).values
            except:
                raise ValueError(f'Unsupported string labels: {set(lower.unique())}. Expected spam/ham or scam/legitimate')
    else:
        y = y_series.astype(int).values

    model = joblib.load(args.model)
    vectorizer = joblib.load(args.vectorizer)
    
    # Load scaler if provided, or try to infer path
    scaler = None
    if args.scaler:
        scaler = joblib.load(args.scaler)
    else:
        # Try to find scaler in same dir as model
        scaler_path = Path(args.model).parent / 'feature_scaler_generalized.joblib'
        if scaler_path.exists():
            print(f"Auto-detected scaler: {scaler_path}")
            scaler = joblib.load(scaler_path)
        else:
            print("Warning: No scaler provided and none found. If model expects extra features, this will fail.")

    model_hash = artifact_hash(args.model)
    vectorizer_hash = artifact_hash(args.vectorizer)
    
    texts = df[text_col].astype(str).tolist()
    
    # Prepare features (TF-IDF + Engineered)
    X = prepare_features(texts, vectorizer, scaler)

    # Performance (single pass)
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)
    perf = compute_performance(y, y_pred, y_proba)
    plot_curves(y, y_proba, args.out)
    plot_confusion(confusion_matrix(y, y_pred), args.out)

    # Cross-Validation
    cv_res = None
    if args.cv_folds and args.cv_folds > 1:
        # Retrain inside CV; caution if model is already "final"
        cv_model = joblib.load(args.model)  # fresh instance
        cv_res = cross_validation(texts, y, cv_model, vectorizer, scaler, args.cv_folds)

    # Global feature weights
    global_weights = generate_global_feature_weights(vectorizer, model, args.out)

    # LIME explanations
    lime_results = None
    if args.lime_explain > 0:
        lime_results = lime_explanations(texts, vectorizer, scaler, model, args.out, args.lime_explain)

    # Fairness (length buckets)
    fairness = fairness_length_bucket(df, y, y_pred, text_col)

    # Data quality
    data_q = data_quality(df, args.out, text_col, label_col)

    # Robustness
    robustness = None
    if args.adversarial:
        robustness = robustness_tests(df, vectorizer, scaler, model, text_col, y)

    # Efficiency
    samples_for_eff = df[text_col].astype(str).tolist()[:300]  # limit for timing
    efficiency = efficiency_tests(vectorizer, scaler, model, samples_for_eff)

    # Complexity summary
    complexity = {
        'feature_count': int(X.shape[1]),
        'parameter_count_estimate': int(X.shape[1] + 1),
        'model_type': type(model).__name__,
        'linear': True
    }

    # Deployment readiness
    deployment = {
        'deterministic': True,
        'artifact_hashes': {'model': model_hash, 'vectorizer': vectorizer_hash},
        'lightweight': complexity['parameter_count_estimate'] < 20000,
        'requires_gpu': False,
        'supports_batching': True
    }

    # Business fit (based on metrics)
    business_fit = {
        'high_recall': perf.recall >= 0.85,
        'acceptable_precision': perf.precision >= 0.80,
        'roc_auc_target_met': perf.roc_auc >= 0.88,
        'summary': 'Meets baseline protection goals' if (perf.recall >= 0.85 and perf.precision >= 0.80) else 'Needs threshold tuning'
    }

    perf_keys = ['accuracy','precision','recall','f1','roc_auc','pr_auc','confusion_matrix']
    performance_dict = {k: getattr(perf, k) for k in perf_keys}
    report = {
        'performance': performance_dict,
        'cross_validation': cv_res.aggregate if cv_res else None,
        'fairness_length_buckets': fairness,
        'robustness': robustness,
        'efficiency': efficiency,
        'complexity': complexity,
        'interpretability_global_weights': global_weights,
        'lime_examples': lime_results,
        'data_quality': data_q,
        'deployment': deployment,
        'business_fit': business_fit,
        'stability_repeat_run_variation': None  # Could implement a second run comparison
    }

    with open(os.path.join(args.out, 'metrics.json'), 'w') as f:
        json.dump(report, f, indent=2)

    print('Evaluation complete. Report ->', os.path.join(args.out, 'metrics.json'))

if __name__ == '__main__':
    main()
