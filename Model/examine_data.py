"""
Step 2: Strict Data Examination
Analyze cleaned dataset for quality issues, mislabeling, and domain distribution
"""

import pandas as pd
import numpy as np
import re
from collections import Counter

print("="*80)
print("🔬 STEP 2: STRICT DATA EXAMINATION")
print("="*80)

# Load cleaned dataset
print("\n📂 Loading cleaned dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train_cleaned.csv')
print(f"✓ Loaded: {len(df):,} messages")

# ==================== EXAMINATION 1: Label Distribution ====================
print("\n" + "="*80)
print("📊 EXAMINATION 1: LABEL DISTRIBUTION")
print("="*80)

label_counts = df['label'].value_counts()
print(f"\nLabel counts:")
print(label_counts)

spam_pct = (label_counts['spam'] / len(df)) * 100
ham_pct = (label_counts['ham'] / len(df)) * 100

print(f"\nPercentages:")
print(f"  Spam: {spam_pct:.2f}%")
print(f"  Ham: {ham_pct:.2f}%")
print(f"  Difference: {abs(spam_pct - ham_pct):.2f}%")

if abs(spam_pct - ham_pct) < 2:
    print("\n✅ EXCELLENT: Dataset is perfectly balanced!")
elif abs(spam_pct - ham_pct) < 5:
    print("\n✅ GOOD: Dataset is well balanced")
else:
    print("\n⚠️ WARNING: Dataset has noticeable imbalance")

# ==================== EXAMINATION 2: URL Coverage ====================
print("\n" + "="*80)
print("🔗 EXAMINATION 2: URL COVERAGE")
print("="*80)

# Check if has_url column exists
if 'has_url' in df.columns:
    url_coverage = df['has_url'].sum()
else:
    # Detect URLs manually
    url_pattern = r'https?://|www\.'
    url_coverage = df['text'].str.contains(url_pattern, case=False, regex=True, na=False).sum()

print(f"\nTotal messages with URLs: {url_coverage:,} ({url_coverage/len(df)*100:.1f}%)")
print(f"Messages without URLs: {len(df)-url_coverage:,} ({(len(df)-url_coverage)/len(df)*100:.1f}%)")

# URL coverage by label
spam_df = df[df['label'] == 'spam']
ham_df = df[df['label'] == 'ham']

if 'has_url' in df.columns:
    spam_url_count = spam_df['has_url'].sum()
    ham_url_count = ham_df['has_url'].sum()
else:
    spam_url_count = spam_df['text'].str.contains(url_pattern, case=False, regex=True, na=False).sum()
    ham_url_count = ham_df['text'].str.contains(url_pattern, case=False, regex=True, na=False).sum()

print(f"\nSpam with URLs: {spam_url_count:,} ({spam_url_count/len(spam_df)*100:.1f}%)")
print(f"Ham with URLs: {ham_url_count:,} ({ham_url_count/len(ham_df)*100:.1f}%)")

if spam_url_count/len(spam_df) > 0.5:
    print("\n✅ GOOD: Most spam messages contain URLs")
else:
    print("\n⚠️ WARNING: Many spam messages lack URLs - text features will be critical")

# ==================== EXAMINATION 3: Domain Variety ====================
print("\n" + "="*80)
print("🌐 EXAMINATION 3: DOMAIN VARIETY")
print("="*80)

if 'primary_domain' in df.columns:
    # Use existing domain column
    domains = df['primary_domain'].dropna()
    unique_domains = domains.nunique()
    
    print(f"\nUnique domains: {unique_domains:,}")
    print(f"Messages with domains: {len(domains):,}")
    
    # Top 50 domains
    print("\n📊 Top 50 most frequent domains:")
    top_domains = domains.value_counts().head(50)
    
    for i, (domain, count) in enumerate(top_domains.items(), 1):
        pct = (count / len(domains)) * 100
        print(f"  {i:2d}. {domain:40s}: {count:6,} ({pct:5.2f}%)")
    
    # Check concentration
    top_10_count = domains.value_counts().head(10).sum()
    top_10_pct = (top_10_count / len(domains)) * 100
    
    top_100_count = domains.value_counts().head(100).sum()
    top_100_pct = (top_100_count / len(domains)) * 100
    
    print(f"\n📈 Domain concentration:")
    print(f"  Top 10 domains: {top_10_count:,} messages ({top_10_pct:.1f}%)")
    print(f"  Top 100 domains: {top_100_count:,} messages ({top_100_pct:.1f}%)")
    
    if top_10_pct > 50:
        print(f"\n❌ CRITICAL: Top 10 domains dominate {top_10_pct:.1f}% of data!")
        print("   💡 Risk: Model will memorize these domains")
    elif top_10_pct > 30:
        print(f"\n⚠️ WARNING: Top 10 domains account for {top_10_pct:.1f}%")
        print("   💡 Consider limiting examples per domain")
    else:
        print(f"\n✅ GOOD: Domains are well distributed ({top_10_pct:.1f}% in top 10)")
    
    # Domains appearing > 1000 times
    frequent_domains = domains.value_counts()
    very_frequent = frequent_domains[frequent_domains > 1000]
    
    if len(very_frequent) > 0:
        print(f"\n⚠️ Domains appearing >1000 times: {len(very_frequent)}")
        print("   Top offenders:")
        for domain, count in very_frequent.head(20).items():
            print(f"     {domain}: {count:,}")
else:
    print("\n⚠️ No 'primary_domain' column found - skipping detailed domain analysis")

# ==================== EXAMINATION 4: Duplicate Detection ====================
print("\n" + "="*80)
print("🔄 EXAMINATION 4: DUPLICATE DETECTION")
print("="*80)

# Check for exact duplicates
exact_dupes = df.duplicated(subset=['text']).sum()
print(f"\nExact duplicate messages: {exact_dupes:,} ({exact_dupes/len(df)*100:.2f}%)")

if exact_dupes > 0:
    print("\n📝 Sample duplicates:")
    dupe_texts = df[df.duplicated(subset=['text'], keep=False)]['text'].value_counts().head(5)
    for i, (text, count) in enumerate(dupe_texts.items(), 1):
        print(f"\n{i}. Appears {count} times:")
        print(f"   {text[:100]}...")

# Near-duplicates (first 50 characters match)
df['text_prefix'] = df['text'].str[:50]
near_dupes = df.duplicated(subset=['text_prefix']).sum()
print(f"\nNear-duplicate messages (first 50 chars match): {near_dupes:,} ({near_dupes/len(df)*100:.2f}%)")

if exact_dupes > len(df) * 0.05:
    print("\n⚠️ WARNING: >5% duplicates detected - consider deduplication")
else:
    print("\n✅ GOOD: Low duplicate rate")

# ==================== EXAMINATION 5: Mislabeling Detection ====================
print("\n" + "="*80)
print("🏷️ EXAMINATION 5: POTENTIAL MISLABELING")
print("="*80)

# Check HAM messages with scam indicators
scam_keywords = [
    'verify', 'verification', 'suspended', 'locked', 'urgent', 'immediately',
    'claim', 'prize', 'winner', 'congratulations', 'won', 'selected',
    'refund', 'reward', 'gift', 'free money', 'act now', 'limited time',
    'expire', 'expire soon', 'account locked', 'confirm now', 'click here',
    'update', 'secure', 'security alert'
]

ham_with_scam_keywords = ham_df['text'].apply(
    lambda x: any(kw in str(x).lower() for kw in scam_keywords)
).sum()

print(f"\nHAM messages with scam keywords: {ham_with_scam_keywords:,} ({ham_with_scam_keywords/len(ham_df)*100:.1f}%)")

if ham_with_scam_keywords > len(ham_df) * 0.05:
    print("\n⚠️ WARNING: >5% of HAM has scam keywords - potential mislabeling!")
    print("\n📝 Suspicious HAM samples:")
    
    suspicious_ham = ham_df[ham_df['text'].apply(
        lambda x: any(kw in str(x).lower() for kw in scam_keywords)
    )]
    
    for i, row in suspicious_ham.head(10).iterrows():
        text = row['text']
        matched_keywords = [kw for kw in scam_keywords if kw in text.lower()]
        print(f"\n{i}. Keywords: {matched_keywords}")
        print(f"   {text[:120]}...")
else:
    print("\n✅ GOOD: Low rate of HAM with scam keywords")

# Check SPAM messages without URLs or scam keywords
url_pattern = r'https?://|www\.'
spam_without_indicators = spam_df[
    ~spam_df['text'].str.contains(url_pattern, case=False, regex=True, na=False) &
    ~spam_df['text'].apply(lambda x: any(kw in str(x).lower() for kw in scam_keywords))
]

print(f"\nSPAM without URLs or keywords: {len(spam_without_indicators):,} ({len(spam_without_indicators)/len(spam_df)*100:.1f}%)")

if len(spam_without_indicators) > len(spam_df) * 0.05:
    print("\n⚠️ WARNING: >5% of SPAM lacks obvious indicators")
    print("\n📝 Sample SPAM without indicators:")
    for i, row in spam_without_indicators.head(5).iterrows():
        print(f"\n{i}. {row['text'][:120]}...")

# ==================== EXAMINATION 6: Text Quality ====================
print("\n" + "="*80)
print("📝 EXAMINATION 6: TEXT QUALITY")
print("="*80)

# Length statistics
text_lengths = df['text'].str.len()

print(f"\nText length statistics:")
print(f"  Mean: {text_lengths.mean():.1f} characters")
print(f"  Median: {text_lengths.median():.1f} characters")
print(f"  Min: {text_lengths.min()} characters")
print(f"  Max: {text_lengths.max()} characters")

# Very short messages
very_short = (text_lengths < 10).sum()
print(f"\nVery short messages (<10 chars): {very_short:,} ({very_short/len(df)*100:.2f}%)")

# Very long messages
very_long = (text_lengths > 500).sum()
print(f"Very long messages (>500 chars): {very_long:,} ({very_long/len(df)*100:.2f}%)")

# Non-ASCII characters
non_ascii = df['text'].apply(lambda x: any(ord(c) > 127 for c in str(x))).sum()
print(f"\nMessages with non-ASCII characters: {non_ascii:,} ({non_ascii/len(df)*100:.1f}%)")

# ==================== SUMMARY ====================
print("\n" + "="*80)
print("📋 EXAMINATION SUMMARY")
print("="*80)

issues = []

if abs(spam_pct - ham_pct) > 5:
    issues.append("Label imbalance")

if spam_url_count/len(spam_df) < 0.5:
    issues.append("Low URL coverage in spam")

if 'primary_domain' in df.columns and top_10_pct > 30:
    issues.append(f"Top 10 domains dominate {top_10_pct:.1f}%")

if exact_dupes > len(df) * 0.05:
    issues.append(f"{exact_dupes:,} duplicates ({exact_dupes/len(df)*100:.1f}%)")

if ham_with_scam_keywords > len(ham_df) * 0.05:
    issues.append(f"{ham_with_scam_keywords:,} HAM with scam keywords")

if very_short > len(df) * 0.01:
    issues.append(f"{very_short:,} very short messages")

if len(issues) > 0:
    print(f"\n⚠️ Found {len(issues)} issues:\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
else:
    print("\n✅ No critical issues detected!")

print("\n📊 Dataset quality score:")
quality_score = 100 - (len(issues) * 15)  # Deduct 15 points per issue
quality_score = max(0, quality_score)

if quality_score >= 85:
    grade = "A - EXCELLENT"
elif quality_score >= 70:
    grade = "B - GOOD"
elif quality_score >= 50:
    grade = "C - ACCEPTABLE"
else:
    grade = "D - NEEDS IMPROVEMENT"

print(f"  Score: {quality_score}/100 ({grade})")

print("\n" + "="*80)
print("✅ STEP 2 COMPLETE: Data examination finished!")
print("="*80)
