#!/usr/bin/env python
"""
Enhanced Training with Domain Reputation Features
Integrates IP detection, URL shorteners, and domain reputation into the model
"""
import argparse
import pandas as pd
import joblib
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_fscore_support
from sklearn.linear_model import LogisticRegression
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Import domain reputation features
import sys
sys.path.insert(0, str(Path(__file__).parent))
from domain_reputation import extract_domain_features, batch_extract_domain_features

RANDOM_SEED = 42


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', default='Datasets/unified_ml_dataset_train.csv')
    ap.add_argument('--val', default='Datasets/unified_ml_dataset_val.csv')
    ap.add_argument('--out', default='artifacts')
    return ap.parse_args()


def preprocess(text: str) -> str:
    """Clean text while preserving URL markers."""
    import re
    if pd.isna(text):
        return ""
    t = str(text).lower()
    t = re.sub(r'http\S+', ' httpurl ', t)
    t = re.sub(r'www\.\S+', ' wwwurl ', t)
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def extract_numeric_features(df, text_col='text'):
    """Extract basic + domain reputation numeric features."""
    
    features = pd.DataFrame()
    
    # Basic features from unified dataset
    features['url_count'] = df.get('url_count', 0).fillna(0)
    features['text_length'] = df.get('text_length', df[text_col].str.len()).fillna(0)
    features['word_count'] = df.get('word_count', df[text_col].str.split().str.len()).fillna(0)
    features['special_char_ratio'] = df.get('special_char_ratio', 0).fillna(0)
    features['digit_ratio'] = df.get('digit_ratio', 0).fillna(0)
    features['uppercase_ratio'] = df.get('uppercase_ratio', 0).fillna(0)
    features['suspicious_keywords'] = df.get('suspicious_keywords', 0).fillna(0)
    
    # Derived features
    features['has_url'] = (features['url_count'] > 0).astype(int)
    features['is_url_only'] = ((features['word_count'] <= 2) & (features['has_url'] == 1)).astype(int)
    features['url_to_text_ratio'] = np.where(
        features['text_length'] > 0,
        features['url_count'] / (features['text_length'] / 50),
        0
    )
    
    # NEW: Domain reputation features
    print("  → Extracting domain reputation features...")
    domain_features = batch_extract_domain_features(df[text_col].values)
    
    # Add domain features with NaN handling
    for col in domain_features.columns:
        features[col] = domain_features[col].fillna(0)
    
    # Ensure no NaN/inf values
    features = features.replace([np.inf, -np.inf], 0).fillna(0)
    
    return features


def main():
    args = parse_args()
    
    print("=" * 80)
    print("ENHANCED SPAM/PHISHING DETECTOR WITH DOMAIN REPUTATION")
    print("TF-IDF + Basic Features + Domain Reputation Features")
    print("=" * 80)
    
    # Load data
    print(f"\nLoading training data from: {args.data}")
    df_train = pd.read_csv(args.data, low_memory=False)
    print(f"  Training samples: {len(df_train):,}")
    
    print(f"Loading validation data from: {args.val}")
    df_val = pd.read_csv(args.val, low_memory=False)
    print(f"  Validation samples: {len(df_val):,}")
    
    # Clean data
    df_train = df_train.dropna(subset=['text', 'label']).copy()
    df_val = df_val.dropna(subset=['text', 'label']).copy()
    
    print(f"\nLabel distribution (training):")
    print(df_train['label'].value_counts())
    
    # Convert labels
    y_train = (df_train['label'] == 'spam').astype(int)
    y_val = (df_val['label'] == 'spam').astype(int)
    
    # Preprocess text
    print("\nPreprocessing text...")
    df_train['clean'] = df_train['text'].apply(preprocess)
    df_val['clean'] = df_val['text'].apply(preprocess)
    
    # Extract TF-IDF features
    print("\nExtracting TF-IDF features...")
    vectorizer = TfidfVectorizer(
        max_features=12000,
        ngram_range=(1, 3),
        min_df=5,
        max_df=0.85,
        sublinear_tf=True,
        strip_accents='unicode'
    )
    X_train_text = vectorizer.fit_transform(df_train['clean'])
    X_val_text = vectorizer.transform(df_val['clean'])
    print(f"  Vocabulary size: {len(vectorizer.vocabulary_):,}")
    
    # Extract numeric features (includes domain reputation)
    print("\nExtracting numeric + domain reputation features...")
    X_train_numeric = extract_numeric_features(df_train, 'text')
    X_val_numeric = extract_numeric_features(df_val, 'text')
    
    print(f"  Total numeric features: {len(X_train_numeric.columns)}")
    print(f"  Feature list: {X_train_numeric.columns.tolist()}")
    
    # Scale numeric features
    scaler = StandardScaler()
    X_train_numeric_scaled = scaler.fit_transform(X_train_numeric)
    X_val_numeric_scaled = scaler.transform(X_val_numeric)
    
    # Combine features
    print("\nCombining TF-IDF + numeric + domain features...")
    from scipy.sparse import hstack, csr_matrix
    X_train_combined = hstack([X_train_text, csr_matrix(X_train_numeric_scaled)])
    X_val_combined = hstack([X_val_text, csr_matrix(X_val_numeric_scaled)])
    print(f"  Combined feature matrix shape: {X_train_combined.shape}")
    
    # Train model
    print("\nTraining Logistic Regression with enhanced features...")
    model = LogisticRegression(
        max_iter=300,
        solver='saga',
        class_weight={0: 1.0, 1: 0.8},
        C=3.0,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        penalty='l2'
    )
    model.fit(X_train_combined, y_train)
    
    # Evaluate
    print("\n" + "=" * 80)
    print("VALIDATION RESULTS")
    print("=" * 80)
    
    y_val_pred = model.predict(X_val_combined)
    y_val_proba = model.predict_proba(X_val_combined)[:, 1]
    
    report = classification_report(y_val, y_val_pred, target_names=['ham', 'spam'], digits=4)
    print("\n" + report)
    
    precision, recall, f1, support = precision_recall_fscore_support(y_val, y_val_pred, average='binary')
    roc_auc = roc_auc_score(y_val, y_val_proba)
    
    print(f"\nKey Metrics:")
    print(f"  ROC-AUC: {roc_auc:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    
    cm = confusion_matrix(y_val, y_val_pred)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives:  {cm[0,0]:,}")
    print(f"  False Positives: {cm[0,1]:,}")
    print(f"  False Negatives: {cm[1,0]:,}")
    print(f"  True Positives:  {cm[1,1]:,}")
    
    # Slice analysis
    print("\n" + "=" * 80)
    print("SLICE ANALYSIS: Performance by URL Presence")
    print("=" * 80)
    
    for has_url_val in [True, False]:
        mask = df_val['has_url'] == has_url_val
        if mask.sum() == 0:
            continue
        
        y_slice = y_val[mask]
        y_pred_slice = y_val_pred[mask]
        
        p, r, f, _ = precision_recall_fscore_support(y_slice, y_pred_slice, average='binary', zero_division=0)
        
        label_desc = "WITH URLs" if has_url_val else "WITHOUT URLs"
        print(f"\n{label_desc} ({mask.sum():,} samples):")
        print(f"  Precision: {p:.4f} | Recall: {r:.4f} | F1: {f:.4f}")
    
    # Save artifacts
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "=" * 80)
    print("SAVING ARTIFACTS")
    print("=" * 80)
    
    joblib.dump(model, out_dir / 'scam_detector_model_enhanced.joblib')
    joblib.dump(vectorizer, out_dir / 'scam_tfidf_vectorizer_enhanced.joblib')
    joblib.dump(scaler, out_dir / 'feature_scaler_enhanced.joblib')
    
    # Save feature config
    feature_config = {
        'text_features': len(vectorizer.vocabulary_),
        'numeric_features': X_train_numeric.columns.tolist(),
        'total_features': int(X_train_combined.shape[1]),
        'includes_domain_reputation': True,
        'preprocessing': {
            'url_marker': 'httpurl',
            'www_marker': 'wwwurl'
        }
    }
    with open(out_dir / 'feature_config_enhanced.json', 'w') as f:
        json.dump(feature_config, f, indent=2)
    
    print(f"\n  Model: scam_detector_model_enhanced.joblib")
    print(f"  Vectorizer: scam_tfidf_vectorizer_enhanced.joblib")
    print(f"  Scaler: feature_scaler_enhanced.joblib")
    print(f"  Config: feature_config_enhanced.json")
    
    # Save metrics
    metrics = {
        'timestamp': datetime.now().isoformat(),
        'model_type': 'LogisticRegression + TF-IDF + Numeric + Domain Reputation',
        'training_samples': int(len(df_train)),
        'validation_samples': int(len(df_val)),
        'vocabulary_size': int(len(vectorizer.vocabulary_)),
        'total_features': int(X_train_combined.shape[1]),
        'roc_auc': float(roc_auc),
        'f1_score': float(f1),
        'precision': float(precision),
        'recall': float(recall),
        'confusion_matrix': {
            'tn': int(cm[0,0]),
            'fp': int(cm[0,1]),
            'fn': int(cm[1,0]),
            'tp': int(cm[1,1])
        }
    }
    with open(out_dir / 'metrics_enhanced.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("\n" + "=" * 80)
    print("TRAINING COMPLETE!")
    print("=" * 80)
    print(f"\nEnhanced model with domain reputation features")
    print(f"ROC-AUC: {roc_auc:.2%} | Precision: {precision:.2%} | Recall: {recall:.2%}")
    print(f"False positive rate: {100*cm[0,1]/(cm[0,0]+cm[0,1]):.2f}%")
    print(f"False negative rate: {100*cm[1,0]/(cm[1,0]+cm[1,1]):.2f}%")


if __name__ == '__main__':
    main()
