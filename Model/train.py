#!/usr/bin/env python
"""Train Logistic Regression TF-IDF spam/phishing detection model on unified dataset.

Usage:
python train.py --data Datasets/unified_ml_dataset_train.csv --out artifacts

Dataset uses unified schema with spam/ham labels.
"""
import argparse
import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_fscore_support
import numpy as np
import json
from datetime import datetime

RANDOM_SEED = 42


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', default='Datasets/unified_ml_dataset_train.csv', help='Training CSV file path')
    ap.add_argument('--val', default='Datasets/unified_ml_dataset_val.csv', help='Validation CSV file path')
    ap.add_argument('--out', default='artifacts', help='Output directory for artifacts')
    ap.add_argument('--text-col', default='text', help='Name of text column')
    ap.add_argument('--label-col', default='label', help='Name of label column')
    return ap.parse_args()


def preprocess(text: str) -> str:
    """Clean and normalize text for TF-IDF vectorization."""
    import re
    if pd.isna(text):
        return ""
    t = str(text).lower()
    # Preserve URL markers but normalize them
    t = re.sub(r'http\S+', 'httpurl', t)
    t = re.sub(r'www\.\S+', 'wwwurl', t)
    # Remove special characters but keep spaces
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def main():
    args = parse_args()
    
    print("=" * 80)
    print("TRAINING SPAM/PHISHING DETECTOR ON UNIFIED DATASET")
    print("=" * 80)
    
    # Load training data
    print(f"\nLoading training data from: {args.data}")
    df_train = pd.read_csv(args.data, low_memory=False)
    print(f"  Training samples: {len(df_train):,}")
    
    # Load validation data
    print(f"Loading validation data from: {args.val}")
    df_val = pd.read_csv(args.val, low_memory=False)
    print(f"  Validation samples: {len(df_val):,}")
    
    text_col = args.text_col
    label_col = args.label_col
    
    # Clean data
    df_train = df_train.dropna(subset=[text_col, label_col]).copy()
    df_val = df_val.dropna(subset=[text_col, label_col]).copy()
    
    print(f"\nAfter dropping NaN:")
    print(f"  Training: {len(df_train):,}")
    print(f"  Validation: {len(df_val):,}")
    
    # Map labels: spam=1, ham=0
    print(f"\nLabel distribution (training):")
    print(df_train[label_col].value_counts())
    
    y_train = (df_train[label_col] == 'spam').astype(int)
    y_val = (df_val[label_col] == 'spam').astype(int)
    
    # Preprocess text
    print("\nPreprocessing text...")
    df_train['clean'] = df_train[text_col].apply(preprocess)
    df_val['clean'] = df_val[text_col].apply(preprocess)
    
    X_train = df_train['clean']
    X_val = df_val['clean']
    
    # Train TF-IDF vectorizer
    print("\nTraining TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 4),
        min_df=5,
        max_df=0.85,
        sublinear_tf=True,
        strip_accents='unicode',
        analyzer='char_wb'  # Character n-grams help with URL patterns
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_val_vec = vectorizer.transform(X_val)
    
    print(f"  Vocabulary size: {len(vectorizer.vocabulary_):,}")
    print(f"  Training matrix shape: {X_train_vec.shape}")
    
    # Train model
    print("\nTraining Logistic Regression model...")
    model = LogisticRegression(
        max_iter=500,
        solver='saga',
        class_weight='balanced',
        C=2.0,  # Higher C = less regularization = more complex model
        random_state=RANDOM_SEED,
        n_jobs=-1,
        penalty='l2'
    )
    model.fit(X_train_vec, y_train)
    
    # Evaluate on validation set
    print("\n" + "=" * 80)
    print("VALIDATION RESULTS")
    print("=" * 80)
    
    y_val_pred = model.predict(X_val_vec)
    y_val_proba = model.predict_proba(X_val_vec)[:, 1]
    
    # Classification report
    report = classification_report(y_val, y_val_pred, target_names=['ham', 'spam'], digits=4)
    print("\n" + report)
    
    # Additional metrics
    precision, recall, f1, support = precision_recall_fscore_support(y_val, y_val_pred, average='binary')
    roc_auc = roc_auc_score(y_val, y_val_proba)
    
    print(f"\nAdditional Metrics:")
    print(f"  ROC-AUC Score: {roc_auc:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_val, y_val_pred)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives (ham):  {cm[0,0]:,}")
    print(f"  False Positives:       {cm[0,1]:,}")
    print(f"  False Negatives:       {cm[1,0]:,}")
    print(f"  True Positives (spam): {cm[1,1]:,}")
    
    # Save artifacts
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "=" * 80)
    print("SAVING ARTIFACTS")
    print("=" * 80)
    
    model_path = out_dir / 'scam_detector_model.joblib'
    vectorizer_path = out_dir / 'scam_tfidf_vectorizer.joblib'
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print(f"\n  Model saved: {model_path}")
    print(f"  Vectorizer saved: {vectorizer_path}")
    
    # Save training report
    report_path = out_dir / 'training_report.txt'
    with open(report_path, 'w') as f:
        f.write("SPAM/PHISHING DETECTOR - TRAINING REPORT\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Training samples: {len(df_train):,}\n")
        f.write(f"Validation samples: {len(df_val):,}\n")
        f.write(f"Vocabulary size: {len(vectorizer.vocabulary_):,}\n\n")
        f.write("VALIDATION METRICS\n")
        f.write("=" * 80 + "\n\n")
        f.write(report)
        f.write(f"\nROC-AUC Score: {roc_auc:.4f}\n")
        f.write(f"F1 Score: {f1:.4f}\n")
        f.write(f"Precision: {precision:.4f}\n")
        f.write(f"Recall: {recall:.4f}\n")
    print(f"  Report saved: {report_path}")
    
    # Save metrics JSON
    metrics_path = out_dir / 'metrics.json'
    metrics = {
        'timestamp': datetime.now().isoformat(),
        'training_samples': int(len(df_train)),
        'validation_samples': int(len(df_val)),
        'vocabulary_size': int(len(vectorizer.vocabulary_)),
        'roc_auc': float(roc_auc),
        'f1_score': float(f1),
        'precision': float(precision),
        'recall': float(recall),
        'confusion_matrix': {
            'true_negatives': int(cm[0,0]),
            'false_positives': int(cm[0,1]),
            'false_negatives': int(cm[1,0]),
            'true_positives': int(cm[1,1])
        }
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"  Metrics saved: {metrics_path}")
    
    print("\n" + "=" * 80)
    print("TRAINING COMPLETE!")
    print("=" * 80)
    print(f"\nModel ready for deployment with {roc_auc:.2%} ROC-AUC score")

if __name__ == '__main__':
    main()
