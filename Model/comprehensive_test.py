#!/usr/bin/env python
"""
Comprehensive Testing Suite for Spam/Phishing Detector
Tests model on unseen test set + real-world adversarial examples
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score,
    precision_recall_curve, roc_curve, precision_recall_fscore_support
)
import json
import re
from datetime import datetime

RANDOM_SEED = 42


def preprocess(text: str) -> str:
    """Text preprocessing matching training pipeline."""
    if pd.isna(text):
        return ""
    t = str(text).lower()
    t = re.sub(r'http\S+', ' httpurl ', t)
    t = re.sub(r'www\.\S+', ' wwwurl ', t)
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def extract_numeric_features(df, text_col='text'):
    """Extract numeric features matching training pipeline."""
    features = pd.DataFrame()
    
    # Pre-computed features
    features['url_count'] = df.get('url_count', 0).fillna(0)
    features['text_length'] = df.get('text_length', df[text_col].str.len()).fillna(0)
    features['word_count'] = df.get('word_count', df[text_col].str.split().str.len()).fillna(0)
    features['special_char_ratio'] = df.get('special_char_ratio', 0).fillna(0)
    features['digit_ratio'] = df.get('digit_ratio', 0).fillna(0)
    features['uppercase_ratio'] = df.get('uppercase_ratio', 0).fillna(0)
    features['suspicious_keywords'] = df.get('suspicious_keywords', 0).fillna(0)
    features['has_ip_address'] = df.get('has_ip_address', False).fillna(False).astype(int)
    
    # Derived features
    features['has_url'] = (features['url_count'] > 0).astype(int)
    features['is_url_only'] = ((features['word_count'] <= 2) & (features['has_url'] == 1)).astype(int)
    features['url_to_text_ratio'] = np.where(
        features['text_length'] > 0,
        features['url_count'] / (features['text_length'] / 50),
        0
    )
    
    return features


def predict_with_pipeline(texts, df_full, model, vectorizer, scaler):
    """Full prediction pipeline with text + numeric features."""
    from scipy.sparse import hstack, csr_matrix
    
    # Preprocess text
    clean_texts = [preprocess(t) for t in texts]
    
    # TF-IDF features
    X_text = vectorizer.transform(clean_texts)
    
    # Numeric features
    X_numeric = extract_numeric_features(df_full, 'text')
    X_numeric_scaled = scaler.transform(X_numeric)
    
    # Combine
    X_combined = hstack([X_text, csr_matrix(X_numeric_scaled)])
    
    # Predict
    predictions = model.predict(X_combined)
    probabilities = model.predict_proba(X_combined)[:, 1]
    
    return predictions, probabilities


def evaluate_test_set():
    """Evaluate on held-out test set (never seen during training)."""
    
    print("=" * 80)
    print("TEST SET EVALUATION (93,812 unseen samples)")
    print("=" * 80)
    
    # Load model
    artifacts_dir = Path('artifacts')
    model = joblib.load(artifacts_dir / 'scam_detector_model.joblib')
    vectorizer = joblib.load(artifacts_dir / 'scam_tfidf_vectorizer.joblib')
    scaler = joblib.load(artifacts_dir / 'feature_scaler.joblib')
    
    # Load test set
    df_test = pd.read_csv('Datasets/unified_ml_dataset_test.csv', low_memory=False)
    print(f"\nLoaded test set: {len(df_test):,} samples")
    
    df_test = df_test.dropna(subset=['text', 'label'])
    y_test = (df_test['label'] == 'spam').astype(int)
    
    # Predict
    print("Running predictions...")
    y_pred, y_proba = predict_with_pipeline(df_test['text'].values, df_test, model, vectorizer, scaler)
    
    # Overall metrics
    print("\n" + "=" * 80)
    print("OVERALL PERFORMANCE")
    print("=" * 80)
    
    report = classification_report(y_test, y_pred, target_names=['ham', 'spam'], digits=4)
    print("\n" + report)
    
    precision, recall, f1, support = precision_recall_fscore_support(y_test, y_pred, average='binary')
    roc_auc = roc_auc_score(y_test, y_proba)
    
    print(f"ROC-AUC Score: {roc_auc:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives (legitimate):  {cm[0,0]:,}")
    print(f"  False Positives (ham→spam):   {cm[0,1]:,}")
    print(f"  False Negatives (spam→ham):   {cm[1,0]:,}")
    print(f"  True Positives (caught spam): {cm[1,1]:,}")
    
    fp_rate = cm[0,1] / (cm[0,0] + cm[0,1])
    fn_rate = cm[1,0] / (cm[1,0] + cm[1,1])
    print(f"\n  False Positive Rate: {fp_rate:.2%}")
    print(f"  False Negative Rate: {fn_rate:.2%}")
    
    # Breakdown by source dataset
    print("\n" + "=" * 80)
    print("PERFORMANCE BY DATA SOURCE")
    print("=" * 80)
    
    for source in df_test['source_dataset'].value_counts().head(5).index:
        mask = df_test['source_dataset'] == source
        if mask.sum() < 100:
            continue
        
        y_slice = y_test[mask]
        y_pred_slice = y_pred[mask]
        
        p, r, f, _ = precision_recall_fscore_support(y_slice, y_pred_slice, average='binary', zero_division=0)
        
        print(f"\n{source} ({mask.sum():,} samples):")
        print(f"  Precision: {p:.4f} | Recall: {r:.4f} | F1: {f:.4f}")
    
    # URL presence analysis
    print("\n" + "=" * 80)
    print("PERFORMANCE BY URL PRESENCE")
    print("=" * 80)
    
    for has_url in [True, False]:
        mask = df_test['has_url'] == has_url
        if mask.sum() == 0:
            continue
        
        y_slice = y_test[mask]
        y_pred_slice = y_pred[mask]
        
        p, r, f, _ = precision_recall_fscore_support(y_slice, y_pred_slice, average='binary', zero_division=0)
        cm_slice = confusion_matrix(y_slice, y_pred_slice)
        
        label = "WITH URLs" if has_url else "WITHOUT URLs"
        print(f"\n{label} ({mask.sum():,} samples):")
        print(f"  Precision: {p:.4f} | Recall: {r:.4f} | F1: {f:.4f}")
        if cm_slice.shape == (2, 2):
            fp = cm_slice[0,1]
            fn = cm_slice[1,0]
            print(f"  False Positives: {fp:,} | False Negatives: {fn:,}")
    
    return {
        'roc_auc': roc_auc,
        'f1': f1,
        'precision': precision,
        'recall': recall,
        'confusion_matrix': cm.tolist(),
        'fp_rate': fp_rate,
        'fn_rate': fn_rate
    }


def create_adversarial_examples():
    """Create challenging real-world test cases."""
    
    print("\n" + "=" * 80)
    print("ADVERSARIAL & EDGE CASE TESTING")
    print("=" * 80)
    
    adversarial_cases = []
    
    # 1. Legitimate urgent emails (should be ham)
    adversarial_cases.extend([
        {
            'text': 'URGENT: Your Amazon order #12345 has been delayed. Click here to track: https://amazon.com/track',
            'label': 'ham',
            'category': 'legitimate_urgent',
            'reason': 'Real Amazon notification with urgency'
        },
        {
            'text': 'Important: Your bank account will be suspended. Please verify your information immediately at https://chase.com/verify',
            'label': 'ham',
            'category': 'legitimate_urgent',
            'reason': 'Legitimate bank communication (assuming real domain)'
        },
        {
            'text': 'Your PayPal payment of $500 has been sent. View details: https://paypal.com/activity',
            'label': 'ham',
            'category': 'legitimate_notification',
            'reason': 'Real PayPal transaction notification'
        }
    ])
    
    # 2. Obfuscated phishing URLs (should be spam)
    adversarial_cases.extend([
        {
            'text': 'Verify your account at https://paypa1.com/login (notice the 1 instead of l)',
            'label': 'spam',
            'category': 'homograph_attack',
            'reason': 'Typosquatting with character substitution'
        },
        {
            'text': 'Reset password: http://аmazon.com/reset (Cyrillic а instead of Latin a)',
            'label': 'spam',
            'category': 'homograph_attack',
            'reason': 'Internationalized domain name (IDN) homograph'
        },
        {
            'text': 'Click here: http://bit.ly/3x9kLm2 to claim your prize',
            'label': 'spam',
            'category': 'url_shortener',
            'reason': 'URL shortener hiding destination'
        },
        {
            'text': 'Urgent: https://www-paypal-security.com/login',
            'label': 'spam',
            'category': 'subdomain_trick',
            'reason': 'Fake subdomain mimicking legitimate domain'
        }
    ])
    
    # 3. IP-based phishing (should be spam)
    adversarial_cases.extend([
        {
            'text': 'Login here: http://192.168.1.100/paypal-login.php',
            'label': 'spam',
            'category': 'ip_address',
            'reason': 'Suspicious IP address instead of domain'
        },
        {
            'text': 'Verify account: http://123.456.789.012:8080/verify',
            'label': 'spam',
            'category': 'ip_address',
            'reason': 'Non-standard port on IP address'
        }
    ])
    
    # 4. Mixed legitimate content (should be ham)
    adversarial_cases.extend([
        {
            'text': 'Hi John, here are the meeting notes from today. Let me know if you have questions!',
            'label': 'ham',
            'category': 'normal_message',
            'reason': 'Regular personal/work email'
        },
        {
            'text': 'Your OTP for transaction is 123456. Do not share with anyone.',
            'label': 'ham',
            'category': 'otp_message',
            'reason': 'Legitimate OTP SMS'
        },
        {
            'text': 'Thanks for subscribing! Visit https://newsletter.example.com to manage preferences',
            'label': 'ham',
            'category': 'subscription',
            'reason': 'Legitimate newsletter'
        }
    ])
    
    # 5. Sophisticated phishing (should be spam)
    adversarial_cases.extend([
        {
            'text': 'Dear Customer, We noticed unusual activity. Please verify: https://secure-account-verification.net/confirm?ref=amazon',
            'label': 'spam',
            'category': 'sophisticated_phish',
            'reason': 'Professional tone + fake security domain'
        },
        {
            'text': 'You have received a secure message. View it at: https://docusign-documents.info/view?id=12345',
            'label': 'spam',
            'category': 'brand_impersonation',
            'reason': 'Fake DocuSign impersonation'
        }
    ])
    
    # 6. URL-only messages (mixed)
    adversarial_cases.extend([
        {
            'text': 'https://github.com/openai/gpt-4',
            'label': 'ham',
            'category': 'url_only_legit',
            'reason': 'Legitimate GitHub URL only'
        },
        {
            'text': 'http://free-iphone-winner.xyz',
            'label': 'spam',
            'category': 'url_only_suspicious',
            'reason': 'Suspicious domain with giveaway keywords'
        }
    ])
    
    return pd.DataFrame(adversarial_cases)


def test_adversarial_examples():
    """Test model on adversarial examples."""
    
    # Load model
    artifacts_dir = Path('artifacts')
    model = joblib.load(artifacts_dir / 'scam_detector_model.joblib')
    vectorizer = joblib.load(artifacts_dir / 'scam_tfidf_vectorizer.joblib')
    scaler = joblib.load(artifacts_dir / 'feature_scaler.joblib')
    
    # Create adversarial test set
    df_adv = create_adversarial_examples()
    
    # Need to compute numeric features
    print(f"\nTesting {len(df_adv)} adversarial cases...")
    
    # Manually compute features for adversarial cases
    df_adv['url_count'] = df_adv['text'].str.count(r'http')
    df_adv['text_length'] = df_adv['text'].str.len()
    df_adv['word_count'] = df_adv['text'].str.split().str.len()
    df_adv['has_url'] = df_adv['url_count'] > 0
    df_adv['special_char_ratio'] = 0.1  # Approximation
    df_adv['digit_ratio'] = 0.05
    df_adv['uppercase_ratio'] = 0.05
    df_adv['suspicious_keywords'] = 0
    df_adv['has_ip_address'] = df_adv['text'].str.contains(r'\d+\.\d+\.\d+\.\d+', regex=True)
    
    # Convert labels
    y_adv = (df_adv['label'] == 'spam').astype(int)
    
    # Predict
    y_pred, y_proba = predict_with_pipeline(df_adv['text'].values, df_adv, model, vectorizer, scaler)
    
    # Results by category
    print("\n" + "=" * 80)
    print("RESULTS BY CATEGORY")
    print("=" * 80)
    
    df_adv['predicted'] = ['spam' if p == 1 else 'ham' for p in y_pred]
    df_adv['confidence'] = y_proba
    df_adv['correct'] = (y_adv == y_pred)
    
    for category in df_adv['category'].unique():
        cat_df = df_adv[df_adv['category'] == category]
        accuracy = cat_df['correct'].mean()
        
        print(f"\n{category.upper().replace('_', ' ')} ({len(cat_df)} cases)")
        print(f"  Accuracy: {accuracy:.1%}")
        
        for _, row in cat_df.iterrows():
            status = "✓" if row['correct'] else "✗"
            print(f"    {status} Expected: {row['label']:4s} | Got: {row['predicted']:4s} | Conf: {row['confidence']:.2f}")
            print(f"       Text: {row['text'][:80]}...")
    
    # Overall adversarial accuracy
    overall_acc = df_adv['correct'].mean()
    print(f"\n{'=' * 80}")
    print(f"OVERALL ADVERSARIAL ACCURACY: {overall_acc:.1%} ({df_adv['correct'].sum()}/{len(df_adv)})")
    print(f"{'=' * 80}")
    
    return df_adv


def main():
    """Run comprehensive testing suite."""
    
    print("\n" + "=" * 80)
    print("COMPREHENSIVE MODEL TESTING SUITE")
    print("Testing real-world accuracy and edge cases")
    print("=" * 80)
    
    # Test 1: Held-out test set
    print("\n[TEST 1] Evaluating on unseen test set...")
    test_metrics = evaluate_test_set()
    
    # Test 2: Adversarial examples
    print("\n[TEST 2] Testing adversarial and edge cases...")
    adv_results = test_adversarial_examples()
    
    # Save results
    results_dir = Path('reports')
    results_dir.mkdir(exist_ok=True)
    
    # Save adversarial results
    adv_results.to_csv(results_dir / 'adversarial_test_results.csv', index=False)
    
    # Summary report
    summary = {
        'timestamp': datetime.now().isoformat(),
        'test_set_metrics': test_metrics,
        'adversarial_accuracy': float(adv_results['correct'].mean()),
        'adversarial_breakdown': adv_results.groupby('category')['correct'].mean().to_dict()
    }
    
    with open(results_dir / 'comprehensive_test_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n{'=' * 80}")
    print("TESTING COMPLETE")
    print(f"{'=' * 80}")
    print(f"\nTest Set ROC-AUC: {test_metrics['roc_auc']:.2%}")
    print(f"Test Set F1 Score: {test_metrics['f1']:.2%}")
    print(f"Adversarial Accuracy: {summary['adversarial_accuracy']:.2%}")
    print(f"\nResults saved in reports/")


if __name__ == '__main__':
    main()
