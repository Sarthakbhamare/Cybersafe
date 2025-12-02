"""
Step 8-10: Train Domain, Brand, and Text Specialist Models
Three expert classifiers targeting different feature groups
"""

import pandas as pd
import numpy as np
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
import xgboost as xgb
import joblib
import os

print("="*80)
print("🎯 PHASE 3: SPECIALIST MODEL TRAINING")
print("="*80)

# Create output directory
os.makedirs('artifacts/phase3', exist_ok=True)

# ==================== LOAD DATA ====================

print("\n📂 Loading feature datasets...")
train_df = pd.read_csv('Datasets/train_features.csv')
test_df = pd.read_csv('Datasets/test_features.csv')

print(f"✓ Train: {len(train_df):,} samples")
print(f"✓ Test: {len(test_df):,} samples")
print(f"✓ Features: {len(train_df.columns) - 1}")

# Separate features and labels
# Convert string labels to binary (spam=1, ham=0)
y_train = (train_df['label'] == 'spam').astype(int).values
y_test = (test_df['label'] == 'spam').astype(int).values
X_train_full = train_df.drop('label', axis=1)
X_test_full = test_df.drop('label', axis=1)

print(f"\n📊 Label distribution:")
print(f"  Train - Scam: {(y_train == 1).sum():,} ({100 * (y_train == 1).mean():.1f}%)")
print(f"  Train - Safe: {(y_train == 0).sum():,} ({100 * (y_train == 0).mean():.1f}%)")
print(f"  Test - Scam: {(y_test == 1).sum():,} ({100 * (y_test == 1).mean():.1f}%)")
print(f"  Test - Safe: {(y_test == 0).sum():,} ({100 * (y_test == 0).mean():.1f}%)")

# ==================== FEATURE GROUPS ====================

# Domain features (27): URL structure, entropy, reputation, typosquatting
DOMAIN_FEATURES = [
    'has_url', 'url_count', 'has_ip_url', 'has_private_ip',
    'domain_entropy', 'high_entropy', 'has_multiple_hyphens',
    'has_number_substitution', 'has_phishing_suffix', 'unusually_long_domain',
    'has_suspicious_tld', 'is_url_shortener', 'has_https', 'has_nonstandard_port',
    'path_length', 'suspicious_path', 'subdomain_count', 'many_subdomains',
    'trusted_domain', 'blacklisted_domain', 'suspicious_domain_pattern',
    'suspicious_subdomain_pattern', 'domain_reputation_score',
    'typoquatting_detected', 'typoquatting_distance', 'typoquatting_char_substitution',
    'multiple_brands'  # Cross-feature for domain analysis
]

# Brand features (8): Brand impersonation signals
BRAND_FEATURES = [
    'has_brand_mention', 'brand_with_urgency', 'brand_with_verify',
    'brand_with_financial', 'brand_with_suspicious_domain',
    'multiple_brands', 'brand_count', 'brand_domain_mismatch'
]

# Text features (12): Linguistic and stylistic patterns
TEXT_FEATURES = [
    'text_length', 'word_count', 'avg_word_length',
    'digit_ratio', 'uppercase_ratio', 'special_char_ratio',
    'has_urgency', 'has_financial', 'has_verification',
    'has_prize', 'excessive_caps', 'excessive_punctuation'
]

print(f"\n🔍 Feature breakdown:")
print(f"  Domain features: {len(DOMAIN_FEATURES)}")
print(f"  Brand features: {len(BRAND_FEATURES)}")
print(f"  Text features: {len(TEXT_FEATURES)}")

# Prepare feature subsets
X_train_domain = X_train_full[DOMAIN_FEATURES].values
X_test_domain = X_test_full[DOMAIN_FEATURES].values

X_train_brand = X_train_full[BRAND_FEATURES].values
X_test_brand = X_test_full[BRAND_FEATURES].values

X_train_text = X_train_full[TEXT_FEATURES].values
X_test_text = X_test_full[TEXT_FEATURES].values

# ==================== STEP 8: DOMAIN EXPERT (RANDOM FOREST) ====================

print("\n" + "="*80)
print("🌲 STEP 8: TRAINING DOMAIN EXPERT (Random Forest)")
print("="*80)

print("\n🔧 Model configuration:")
print("  Algorithm: Random Forest")
print("  Trees: 200")
print("  Max depth: 15")
print("  Min samples split: 10")
print("  Class weight: balanced")

domain_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
    verbose=1
)

print("\n🏋️ Training domain expert...")
domain_model.fit(X_train_domain, y_train)

# Predictions
y_pred_domain_train = domain_model.predict(X_train_domain)
y_pred_domain_test = domain_model.predict(X_test_domain)
y_proba_domain_test = domain_model.predict_proba(X_test_domain)[:, 1]

# Metrics
print("\n📊 Domain Expert Performance:")
print("\nTrain metrics:")
train_acc = accuracy_score(y_train, y_pred_domain_train)
print(f"  Accuracy: {train_acc:.4f}")

print("\nTest metrics:")
test_acc = accuracy_score(y_test, y_pred_domain_test)
prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred_domain_test, average='binary')
print(f"  Accuracy: {test_acc:.4f}")
print(f"  Precision: {prec:.4f}")
print(f"  Recall: {rec:.4f}")
print(f"  F1-Score: {f1:.4f}")

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred_domain_test)
print(f"  TN: {cm[0,0]:,} | FP: {cm[0,1]:,}")
print(f"  FN: {cm[1,0]:,} | TP: {cm[1,1]:,}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': DOMAIN_FEATURES,
    'importance': domain_model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🔝 Top 10 Domain Features:")
for idx, row in feature_importance.head(10).iterrows():
    print(f"  {row['feature']:30s}: {row['importance']:.4f}")

# Save model
joblib.dump(domain_model, 'artifacts/phase3/domain_expert.joblib')
feature_importance.to_csv('artifacts/phase3/domain_feature_importance.csv', index=False)
print("\n✓ Domain expert saved to: artifacts/phase3/domain_expert.joblib")

# ==================== STEP 9: BRAND EXPERT (XGBOOST) ====================

print("\n" + "="*80)
print("🏷️ STEP 9: TRAINING BRAND EXPERT (XGBoost)")
print("="*80)

print("\n🔧 Model configuration:")
print("  Algorithm: XGBoost")
print("  Trees: 100")
print("  Max depth: 6")
print("  Learning rate: 0.1")
print("  Scale pos weight: auto")

# Calculate scale_pos_weight for imbalance
scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

brand_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    scale_pos_weight=scale_pos_weight,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
    verbosity=1
)

print("\n🏋️ Training brand expert...")
brand_model.fit(X_train_brand, y_train)

# Predictions
y_pred_brand_train = brand_model.predict(X_train_brand)
y_pred_brand_test = brand_model.predict(X_test_brand)
y_proba_brand_test = brand_model.predict_proba(X_test_brand)[:, 1]

# Metrics
print("\n📊 Brand Expert Performance:")
print("\nTrain metrics:")
train_acc = accuracy_score(y_train, y_pred_brand_train)
print(f"  Accuracy: {train_acc:.4f}")

print("\nTest metrics:")
test_acc = accuracy_score(y_test, y_pred_brand_test)
prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred_brand_test, average='binary')
print(f"  Accuracy: {test_acc:.4f}")
print(f"  Precision: {prec:.4f}")
print(f"  Recall: {rec:.4f}")
print(f"  F1-Score: {f1:.4f}")

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred_brand_test)
print(f"  TN: {cm[0,0]:,} | FP: {cm[0,1]:,}")
print(f"  FN: {cm[1,0]:,} | TP: {cm[1,1]:,}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': BRAND_FEATURES,
    'importance': brand_model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🔝 Brand Features Ranked:")
for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:30s}: {row['importance']:.4f}")

# Save model
joblib.dump(brand_model, 'artifacts/phase3/brand_expert.joblib')
feature_importance.to_csv('artifacts/phase3/brand_feature_importance.csv', index=False)
print("\n✓ Brand expert saved to: artifacts/phase3/brand_expert.joblib")

# ==================== STEP 10: TEXT EXPERT (LOGISTIC REGRESSION) ====================

print("\n" + "="*80)
print("📝 STEP 10: TRAINING TEXT EXPERT (Logistic Regression)")
print("="*80)

print("\n🔧 Model configuration:")
print("  Algorithm: Logistic Regression")
print("  Regularization: L2 (Ridge)")
print("  C: 1.0")
print("  Class weight: balanced")
print("  Scaling: StandardScaler")

# Scale features for LogReg
scaler = StandardScaler()
X_train_text_scaled = scaler.fit_transform(X_train_text)
X_test_text_scaled = scaler.transform(X_test_text)

text_model = LogisticRegression(
    C=1.0,
    penalty='l2',
    class_weight='balanced',
    max_iter=1000,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

print("\n🏋️ Training text expert...")
text_model.fit(X_train_text_scaled, y_train)

# Predictions
y_pred_text_train = text_model.predict(X_train_text_scaled)
y_pred_text_test = text_model.predict(X_test_text_scaled)
y_proba_text_test = text_model.predict_proba(X_test_text_scaled)[:, 1]

# Metrics
print("\n📊 Text Expert Performance:")
print("\nTrain metrics:")
train_acc = accuracy_score(y_train, y_pred_text_train)
print(f"  Accuracy: {train_acc:.4f}")

print("\nTest metrics:")
test_acc = accuracy_score(y_test, y_pred_text_test)
prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred_text_test, average='binary')
print(f"  Accuracy: {test_acc:.4f}")
print(f"  Precision: {prec:.4f}")
print(f"  Recall: {rec:.4f}")
print(f"  F1-Score: {f1:.4f}")

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred_text_test)
print(f"  TN: {cm[0,0]:,} | FP: {cm[0,1]:,}")
print(f"  FN: {cm[1,0]:,} | TP: {cm[1,1]:,}")

# Feature coefficients
feature_importance = pd.DataFrame({
    'feature': TEXT_FEATURES,
    'coefficient': text_model.coef_[0]
}).sort_values('coefficient', ascending=False, key=abs)

print("\n🔝 Text Features by Coefficient:")
for idx, row in feature_importance.iterrows():
    sign = "+" if row['coefficient'] > 0 else ""
    print(f"  {row['feature']:30s}: {sign}{row['coefficient']:.4f}")

# Save model and scaler
joblib.dump(text_model, 'artifacts/phase3/text_expert.joblib')
joblib.dump(scaler, 'artifacts/phase3/text_scaler.joblib')
feature_importance.to_csv('artifacts/phase3/text_feature_importance.csv', index=False)
print("\n✓ Text expert saved to: artifacts/phase3/text_expert.joblib")
print("✓ Text scaler saved to: artifacts/phase3/text_scaler.joblib")

# ==================== SAVE METADATA ====================

metadata = {
    'domain_features': DOMAIN_FEATURES,
    'brand_features': BRAND_FEATURES,
    'text_features': TEXT_FEATURES,
    'train_size': len(train_df),
    'test_size': len(test_df),
    'domain_accuracy': float(accuracy_score(y_test, y_pred_domain_test)),
    'brand_accuracy': float(accuracy_score(y_test, y_pred_brand_test)),
    'text_accuracy': float(accuracy_score(y_test, y_pred_text_test))
}

with open('artifacts/phase3/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✓ Metadata saved to: artifacts/phase3/metadata.json")

print("\n" + "="*80)
print("✅ PHASE 3 SPECIALIST TRAINING COMPLETE!")
print("="*80)
print(f"\n📊 Summary:")
print(f"  Domain Expert (RF)    - Test Accuracy: {accuracy_score(y_test, y_pred_domain_test):.4f}")
print(f"  Brand Expert (XGB)    - Test Accuracy: {accuracy_score(y_test, y_pred_brand_test):.4f}")
print(f"  Text Expert (LogReg)  - Test Accuracy: {accuracy_score(y_test, y_pred_text_test):.4f}")
print(f"\n📁 All models saved to: artifacts/phase3/")
print(f"🎯 Ready for ensemble construction!")
