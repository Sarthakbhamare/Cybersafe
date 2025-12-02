"""
Analyze data quality and identify critical problems
"""

import pandas as pd
import numpy as np
import re
from collections import Counter

print("="*80)
print("🔍 CRITICAL DATA QUALITY ANALYSIS")
print("="*80)

# Load dataset
print("\n📂 Loading training dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train.csv')

print(f"\n✓ Total samples: {len(df):,}")
print(f"✓ Columns: {len(df.columns)}")

# ==================== CRITICAL PROBLEM #1: Label Distribution ====================
print("\n" + "="*80)
print("🚨 PROBLEM #1: LABEL DISTRIBUTION")
print("="*80)

label_dist = df['label'].value_counts()
print("\nLabel counts:")
print(label_dist)

label_pct = df['label'].value_counts(normalize=True) * 100
print("\nLabel percentage:")
print(label_pct)

# Check if labels are balanced
if 'spam' in label_dist and 'ham' in label_dist:
    spam_pct = label_pct['spam']
    ham_pct = label_pct['ham']
    
    if abs(spam_pct - ham_pct) > 20:
        print(f"\n❌ CRITICAL: SEVERE CLASS IMBALANCE!")
        print(f"   Spam: {spam_pct:.1f}%")
        print(f"   Ham: {ham_pct:.1f}%")
        print(f"   Difference: {abs(spam_pct - ham_pct):.1f}%")
        print("\n💡 IMPACT: Model will be biased toward majority class!")
    else:
        print(f"\n✅ Labels are balanced (Spam: {spam_pct:.1f}%, Ham: {ham_pct:.1f}%)")

# ==================== CRITICAL PROBLEM #2: Data Quality ====================
print("\n" + "="*80)
print("🚨 PROBLEM #2: DATA QUALITY ISSUES")
print("="*80)

# Check for missing values
missing_text = df['text'].isna().sum()
missing_label = df['label'].isna().sum()

print(f"\n❌ Missing text: {missing_text} ({missing_text/len(df)*100:.2f}%)")
print(f"❌ Missing labels: {missing_label} ({missing_label/len(df)*100:.2f}%)")

# Check for empty or very short messages
empty_texts = df['text'].apply(lambda x: len(str(x).strip()) < 10).sum()
print(f"❌ Very short messages (<10 chars): {empty_texts} ({empty_texts/len(df)*100:.2f}%)")

# Check for duplicates
duplicates = df.duplicated(subset=['text']).sum()
print(f"❌ Duplicate messages: {duplicates} ({duplicates/len(df)*100:.2f}%)")

if missing_text > 0 or empty_texts > 100 or duplicates > 1000:
    print("\n💡 IMPACT: Poor data quality will reduce model performance!")

# ==================== CRITICAL PROBLEM #3: URL Presence ====================
print("\n" + "="*80)
print("🚨 PROBLEM #3: URL COVERAGE")
print("="*80)

# Check URL presence
has_url = df['has_url'].sum() if 'has_url' in df.columns else df['text'].apply(lambda x: 'http' in str(x).lower() or 'www.' in str(x).lower()).sum()

print(f"\nMessages with URLs: {has_url:,} ({has_url/len(df)*100:.1f}%)")
print(f"Messages without URLs: {len(df)-has_url:,} ({(len(df)-has_url)/len(df)*100:.1f}%)")

# Check URL presence by label
if 'spam' in df['label'].values:
    spam_df = df[df['label'] == 'spam']
    ham_df = df[df['label'] == 'ham']
    
    spam_with_url = spam_df['has_url'].sum() if 'has_url' in df.columns else spam_df['text'].apply(lambda x: 'http' in str(x).lower() or 'www.' in str(x).lower()).sum()
    ham_with_url = ham_df['has_url'].sum() if 'has_url' in df.columns else ham_df['text'].apply(lambda x: 'http' in str(x).lower() or 'www.' in str(x).lower()).sum()
    
    print(f"\nSpam messages with URLs: {spam_with_url:,} ({spam_with_url/len(spam_df)*100:.1f}%)")
    print(f"Ham messages with URLs: {ham_with_url:,} ({ham_with_url/len(ham_df)*100:.1f}%)")
    
    if spam_with_url/len(spam_df) < 0.3:
        print("\n❌ CRITICAL: Most spam messages have NO URLs!")
        print("💡 IMPACT: URL-based features will be mostly useless!")

# ==================== CRITICAL PROBLEM #4: Sample Quality ====================
print("\n" + "="*80)
print("🚨 PROBLEM #4: MESSAGE SAMPLE QUALITY")
print("="*80)

print("\n📝 SPAM SAMPLES:")
spam_samples = df[df['label'] == 'spam']['text'].head(10)
for i, msg in enumerate(spam_samples, 1):
    print(f"\n{i}. {msg[:200]}")
    if len(msg) > 200:
        print("   ...")

print("\n📝 HAM SAMPLES:")
ham_samples = df[df['label'] == 'ham']['text'].head(10)
for i, msg in enumerate(ham_samples, 1):
    print(f"\n{i}. {msg[:200]}")
    if len(msg) > 200:
        print("   ...")

# ==================== CRITICAL PROBLEM #5: Wrong Labels? ====================
print("\n" + "="*80)
print("🚨 PROBLEM #5: POTENTIAL MISLABELING")
print("="*80)

# Check for obvious scam indicators in HAM messages
scam_keywords = ['verify', 'suspended', 'locked', 'urgent', 'claim', 'prize', 'winner', 'congratulations']
ham_with_scam_words = df[df['label'] == 'ham']['text'].apply(
    lambda x: any(kw in str(x).lower() for kw in scam_keywords)
).sum()

print(f"\n❌ HAM messages with scam keywords: {ham_with_scam_words:,} ({ham_with_scam_words/len(ham_df)*100:.1f}%)")

if ham_with_scam_words > len(ham_df) * 0.1:
    print("\n💡 IMPACT: Potential mislabeling - ham messages have scam characteristics!")
    print("\nSuspicious HAM samples:")
    suspicious = df[df['label'] == 'ham']
    suspicious = suspicious[suspicious['text'].apply(lambda x: any(kw in str(x).lower() for kw in scam_keywords))]
    for i, row in suspicious.head(5).iterrows():
        print(f"\n{i}. {row['text'][:150]}...")

# ==================== CRITICAL PROBLEM #6: Domain Variety ====================
print("\n" + "="*80)
print("🚨 PROBLEM #6: DOMAIN VARIETY")
print("="*80)

if 'primary_domain' in df.columns:
    # Count unique domains
    unique_domains = df['primary_domain'].nunique()
    total_with_domains = df['primary_domain'].notna().sum()
    
    print(f"\nUnique domains: {unique_domains:,}")
    print(f"Messages with domains: {total_with_domains:,}")
    
    if unique_domains < 1000:
        print(f"\n❌ CRITICAL: Very limited domain variety ({unique_domains} unique domains)")
        print("💡 IMPACT: Model will memorize these specific domains!")
        
    # Most common domains
    print("\nTop 20 most common domains:")
    top_domains = df['primary_domain'].value_counts().head(20)
    for domain, count in top_domains.items():
        print(f"  {domain}: {count:,} ({count/total_with_domains*100:.1f}%)")
    
    # Check if top domains dominate
    top_10_pct = df['primary_domain'].value_counts().head(10).sum() / total_with_domains * 100
    if top_10_pct > 50:
        print(f"\n❌ CRITICAL: Top 10 domains account for {top_10_pct:.1f}% of data!")
        print("💡 IMPACT: Model will overfit to these specific domains!")

# ==================== CRITICAL PROBLEM #7: Text Quality ====================
print("\n" + "="*80)
print("🚨 PROBLEM #7: TEXT PREPROCESSING ISSUES")
print("="*80)

# Check for URL tokens already present
url_token_count = df['text'].apply(lambda x: '[URL]' in str(x) or 'URL' in str(x).upper()).sum()
print(f"\nMessages with URL tokens: {url_token_count:,} ({url_token_count/len(df)*100:.1f}%)")

if url_token_count > len(df) * 0.1:
    print("❌ WARNING: Dataset already contains URL tokens!")
    print("💡 IMPACT: Preprocessing will conflict with existing tokens!")

# ==================== SUMMARY ====================
print("\n" + "="*80)
print("📊 CRITICAL PROBLEMS SUMMARY")
print("="*80)

problems = []

if abs(spam_pct - ham_pct) > 20:
    problems.append("SEVERE CLASS IMBALANCE")

if missing_text > 0 or empty_texts > 100:
    problems.append("POOR DATA QUALITY (missing/empty texts)")

if duplicates > 1000:
    problems.append("TOO MANY DUPLICATES")

if spam_with_url/len(spam_df) < 0.3:
    problems.append("MOST SPAM HAS NO URLs (URL features useless)")

if ham_with_scam_words > len(ham_df) * 0.1:
    problems.append("POTENTIAL MISLABELING (ham has scam keywords)")

if 'primary_domain' in df.columns and unique_domains < 1000:
    problems.append("LIMITED DOMAIN VARIETY (memorization risk)")

if 'primary_domain' in df.columns and top_10_pct > 50:
    problems.append("TOP DOMAINS DOMINATE (overfitting risk)")

print(f"\n❌ Found {len(problems)} CRITICAL PROBLEMS:\n")
for i, prob in enumerate(problems, 1):
    print(f"{i}. {prob}")

if len(problems) == 0:
    print("✅ No critical problems detected!")

print("\n" + "="*80)
print("✅ Analysis Complete!")
print("="*80)
