#!/usr/bin/env python
"""
Enhanced spam/phishing detector using TF-IDF + Engineered Features + XGBoost
Addresses the URL-heavy dataset imbalance issue.
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
    """Extract hand-crafted numeric features from the unified dataset."""
    
    features = pd.DataFrame()
    
    # Use pre-computed features from unified dataset
    if 'url_count' in df.columns:
        features['url_count'] = df['url_count'].fillna(0)
    else:
        features['url_count'] = 0
    
    if 'text_length' in df.columns:
        features['text_length'] = df['text_length'].fillna(0)
    else:
        features['text_length'] = df[text_col].str.len()
    
    if 'word_count' in df.columns:
        features['word_count'] = df['word_count'].fillna(0)
    else:
        features['word_count'] = df[text_col].str.split().str.len()
    
    if 'special_char_ratio' in df.columns:
        features['special_char_ratio'] = df['special_char_ratio'].fillna(0)
    else:
        features['special_char_ratio'] = 0
    
    if 'digit_ratio' in df.columns:
        features['digit_ratio'] = df['digit_ratio'].fillna(0)
    else:
        features['digit_ratio'] = 0
    
    if 'uppercase_ratio' in df.columns:
        features['uppercase_ratio'] = df['uppercase_ratio'].fillna(0)
    else:
        features['uppercase_ratio'] = 0
    
    if 'suspicious_keywords' in df.columns:
        features['suspicious_keywords'] = df['suspicious_keywords'].fillna(0)
    else:
        features['suspicious_keywords'] = 0
    
    if 'has_ip_address' in df.columns:
        features['has_ip_address'] = df['has_ip_address'].fillna(False).astype(int)
    else:
        features['has_ip_address'] = 0
    
    # Derived features
    features['has_url'] = (features['url_count'] > 0).astype(int)
    features['is_url_only'] = ((features['word_count'] <= 2) & (features['has_url'] == 1)).astype(int)
    features['url_to_text_ratio'] = np.where(
        features['text_length'] > 0,
        features['url_count'] / (features['text_length'] / 50),
        0
    )
    
    return features


def main():
    args = parse_args()
    
    print("=" * 80)
    print("ENHANCED SPAM/PHISHING DETECTOR TRAINING")
    print("TF-IDF Text Features + Hand-Crafted Numeric Features")
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
    
    # Extract numeric features
    print("\nExtracting numeric features...")
    X_train_numeric = extract_numeric_features(df_train, 'text')
    X_val_numeric = extract_numeric_features(df_val, 'text')
    print(f"  Numeric features: {X_train_numeric.columns.tolist()}")
    
    # Scale numeric features
    scaler = StandardScaler()
    X_train_numeric_scaled = scaler.fit_transform(X_train_numeric)
    X_val_numeric_scaled = scaler.transform(X_val_numeric)
    
    # Combine features
    print("\nCombining TF-IDF + numeric features...")
    from scipy.sparse import hstack, csr_matrix
    X_train_combined = hstack([X_train_text, csr_matrix(X_train_numeric_scaled)])
    X_val_combined = hstack([X_val_text, csr_matrix(X_val_numeric_scaled)])
    print(f"  Combined feature matrix shape: {X_train_combined.shape}")
    
    # Train model with adjusted regularization
    print("\nTraining Logistic Regression with combined features...")
    model = LogisticRegression(
        max_iter=300,
        solver='saga',
        class_weight={0: 1.0, 1: 0.8},  # Reduce spam weight to decrease false positives
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
    print(f"  False Positives: {cm[0,1]:,} (ham marked as spam)")
    print(f"  False Negatives: {cm[1,0]:,} (spam marked as ham)")
    print(f"  True Positives:  {cm[1,1]:,}")
    
    # Slice analysis by URL presence
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
        print(f"  Precision: {p:.4f}")
        print(f"  Recall: {r:.4f}")
        print(f"  F1 Score: {f:.4f}")
    
    # Save artifacts
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "=" * 80)
    print("SAVING ARTIFACTS")
    print("=" * 80)
    
    joblib.dump(model, out_dir / 'scam_detector_model.joblib')
    joblib.dump(vectorizer, out_dir / 'scam_tfidf_vectorizer.joblib')
    joblib.dump(scaler, out_dir / 'feature_scaler.joblib')
    
    # Save feature names for reconstruction
    feature_config = {
        'text_features': len(vectorizer.vocabulary_),
        'numeric_features': X_train_numeric.columns.tolist(),
        'preprocessing': {
            'url_marker': 'httpurl',
            'www_marker': 'wwwurl'
        }
    }
    with open(out_dir / 'feature_config.json', 'w') as f:
        json.dump(feature_config, f, indent=2)
    
    print(f"\n  Model: {out_dir / 'scam_detector_model.joblib'}")
    print(f"  Vectorizer: {out_dir / 'scam_tfidf_vectorizer.joblib'}")
    print(f"  Scaler: {out_dir / 'feature_scaler.joblib'}")
    print(f"  Config: {out_dir / 'feature_config.json'}")
    
    # Save metrics
    metrics = {
        'timestamp': datetime.now().isoformat(),
        'model_type': 'LogisticRegression + TF-IDF + Numeric Features',
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
    with open(out_dir / 'metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("\n" + "=" * 80)
    print("TRAINING COMPLETE!")
    print("=" * 80)
    print(f"\nModel achieves {roc_auc:.2%} ROC-AUC with {precision:.2%} precision")
    print(f"False positive rate: {100*cm[0,1]/(cm[0,0]+cm[0,1]):.1f}%")
    print(f"False negative rate: {100*cm[1,0]/(cm[1,0]+cm[1,1]):.1f}%")


if __name__ == '__main__':
    main()
