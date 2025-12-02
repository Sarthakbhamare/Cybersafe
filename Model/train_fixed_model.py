#!/usr/bin/env python
"""Train model on leakage-free dataset."""

import pandas as pd
import joblib
import re
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

RANDOM_SEED = 42

def preprocess(text: str) -> str:
    """Preprocess text without relying on domain information."""
    t = str(text).lower()
    # Keep [URL] token but don't use actual domain
    t = re.sub(r'[^a-z0-9\s\[\]]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def train_model():
    print("\n" + "="*80)
    print("TRAINING MODEL WITHOUT DATA LEAKAGE")
    print("="*80 + "\n")
    
    # Load fixed dataset
    print("Loading master dataset (UCI + HuggingFace + augmented)...")
    df = pd.read_csv('Datasets/master_spam_dataset.csv')
    
    print(f"Dataset size: {len(df):,}")
    print(f"  Spam: {sum(df['label']=='spam'):,}")
    print(f"  Ham: {sum(df['label']=='ham'):,}\n")
    
    # Preprocess
    print("Preprocessing text...")
    df['clean'] = df['text'].apply(preprocess)
    
    # Map labels
    y = (df['label'] == 'spam').astype(int)
    
    # Split data - 80/20
    print("Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        df['clean'], y, 
        test_size=0.2, 
        random_state=RANDOM_SEED, 
        stratify=y
    )
    
    print(f"Train size: {len(X_train):,}")
    print(f"Test size: {len(X_test):,}\n")
    
    # Vectorize
    print("Creating TF-IDF features...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=3,  # Increased to reduce overfitting
        max_df=0.9,  # More aggressive filtering
        sublinear_tf=True
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print(f"Feature space: {X_train_vec.shape[1]} features\n")
    
    # Train model
    print("Training Logistic Regression...")
    model = LogisticRegression(
        max_iter=1000,
        solver='lbfgs',
        class_weight='balanced',
        C=0.5,  # Increased regularization to prevent overfitting
        random_state=RANDOM_SEED
    )
    
    model.fit(X_train_vec, y_train)
    print("✓ Training complete\n")
    
    # Evaluate on test set
    print("="*80)
    print("TEST SET EVALUATION")
    print("="*80 + "\n")
    
    y_pred = model.predict(X_test_vec)
    y_proba = model.predict_proba(X_test_vec)
    
    test_accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Test Accuracy: {test_accuracy*100:.2f}%\n")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    print("Confusion Matrix:")
    print(f"                 Predicted Ham  Predicted Spam")
    print(f"  Actual Ham     {tn:>12,}  {fp:>14,}")
    print(f"  Actual Spam    {fn:>12,}  {tp:>14,}\n")
    
    print(f"True Negatives:  {tn:,}")
    print(f"True Positives:  {tp:,}")
    print(f"False Positives: {fp:,} ({fp/(fp+tn)*100:.2f}% of ham)")
    print(f"False Negatives: {fn:,} ({fn/(fn+tp)*100:.2f}% of spam)\n")
    
    # Classification Report
    print("Classification Report:")
    print(classification_report(y_test, y_pred, 
                                target_names=['Ham', 'Spam'], 
                                digits=4))
    
    # Cross-validation
    print("\n" + "="*80)
    print("CROSS-VALIDATION (5-Fold)")
    print("="*80 + "\n")
    
    print("Running 5-fold cross-validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    
    # Use training data for CV (already vectorized)
    cv_scores = cross_val_score(model, X_train_vec, y_train, cv=cv, scoring='accuracy')
    
    print(f"\nCross-validation scores: {[f'{s:.4f}' for s in cv_scores]}")
    print(f"Mean accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}\n")
    
    # Test on real-world examples
    print("="*80)
    print("REAL-WORLD EXAMPLES TEST")
    print("="*80 + "\n")
    
    test_cases = [
        ("Congratulations! You've won $1,000,000. Click here to claim", "spam"),
        ("URGENT: Your bank account will be closed. Verify now", "spam"),
        ("Free iPhone! Just pay $50 shipping", "spam"),
        ("Your package is waiting. Click to track", "spam"),
        ("Amazon: Your order #12345 has shipped. Track at [URL]", "ham"),
        ("Your OTP is 123456. Do not share this code", "ham"),
        ("Reminder: Your doctor appointment is tomorrow at 3 PM", "ham"),
        ("Flipkart: Your payment of ₹999 was successful", "ham"),
        ("Limited offer! 50% off on electronics", "ham"),  # Tricky - legitimate promo
        ("Your credit card was used for $500. If not you, call us", "ham"),  # Tricky - but legitimate alert
    ]
    
    correct = 0
    for text, true_label in test_cases:
        clean_text = preprocess(text)
        X_vec = vectorizer.transform([clean_text])
        pred = model.predict(X_vec)[0]
        proba = model.predict_proba(X_vec)[0]
        
        pred_label = "spam" if pred == 1 else "ham"
        is_correct = pred_label == true_label
        correct += is_correct
        
        status = "✓" if is_correct else "✗"
        confidence = proba[pred] * 100
        
        print(f"{status} '{text[:60]}...'")
        print(f"   True: {true_label:>4} | Pred: {pred_label:>4} | Confidence: {confidence:.1f}%\n")
    
    real_world_acc = correct / len(test_cases) * 100
    print(f"Real-world test accuracy: {correct}/{len(test_cases)} ({real_world_acc:.1f}%)\n")
    
    # Save model
    print("="*80)
    print("SAVING MODEL")
    print("="*80 + "\n")
    
    output_dir = Path('artifacts/fixed_model')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_dir / 'scam_detector_model.joblib')
    joblib.dump(vectorizer, output_dir / 'scam_tfidf_vectorizer.joblib')
    
    print(f"✓ Model saved to: {output_dir}/\n")
    
    # Save report
    with open(output_dir / 'training_report.txt', 'w') as f:
        f.write("MASTER DATASET MODEL TRAINING REPORT\n")
        f.write("="*80 + "\n\n")
        f.write(f"Dataset: master_spam_dataset.csv (UCI + HuggingFace + augmented)\n")
        f.write(f"Training samples: {len(X_train):,}\n")
        f.write(f"Test samples: {len(X_test):,}\n\n")
        f.write(f"Test Accuracy: {test_accuracy*100:.2f}%\n")
        f.write(f"CV Accuracy: {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%\n")
        f.write(f"Real-world: {real_world_acc:.1f}%\n\n")
        f.write("Confusion Matrix:\n")
        f.write(f"TN: {tn}, FP: {fp}, FN: {fn}, TP: {tp}\n\n")
        f.write(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))
    
    print(f"✓ Report saved to: {output_dir}/training_report.txt\n")
    
    # Summary
    print("="*80)
    print("TRAINING SUMMARY")
    print("="*80 + "\n")
    
    print(f"✓ Test Accuracy:      {test_accuracy*100:.2f}%")
    print(f"✓ CV Accuracy:        {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
    print(f"✓ Real-world Tests:   {real_world_acc:.1f}%")
    print(f"✓ False Positive Rate: {fp/(fp+tn)*100:.2f}%")
    print(f"✓ False Negative Rate: {fn/(fn+tp)*100:.2f}%\n")
    
    if test_accuracy >= 0.90 and test_accuracy <= 0.97:
        print("🎯 REALISTIC PERFORMANCE ACHIEVED!")
        print("   This is expected for real-world spam detection.")
        print("   The model is learning patterns, not memorizing domains.\n")
    elif test_accuracy > 0.97:
        print("⚠️  WARNING: Accuracy too high - possible remaining leakage")
        print("   Investigate further for hidden shortcuts.\n")
    else:
        print("⚠️  Accuracy below expected range")
        print("   May need more data or feature engineering.\n")
    
    return model, vectorizer, test_accuracy, cv_scores.mean()

if __name__ == "__main__":
    model, vectorizer, test_acc, cv_acc = train_model()
