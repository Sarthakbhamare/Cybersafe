"""
Step 4: Create Domain-Stratified Train/Test Splits
Split by DOMAINS, not messages - ensures ZERO overlap for true generalization testing
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

print("="*80)
print("✂️ STEP 4: CREATING DOMAIN-STRATIFIED TRAIN/TEST SPLITS")
print("="*80)

# Load balanced dataset
print("\n📂 Loading balanced dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train_balanced.csv')
print(f"✓ Loaded: {len(df):,} messages")

# Check for domain column
if 'primary_domain' not in df.columns:
    print("\n❌ ERROR: No 'primary_domain' column found!")
    print("   Cannot create domain-stratified splits without domain information.")
    exit(1)

# Separate messages with and without domains
df_with_domain = df[df['primary_domain'].notna()].copy()
df_no_domain = df[df['primary_domain'].isna()].copy()

print(f"\n📊 Dataset composition:")
print(f"  Messages with domains: {len(df_with_domain):,}")
print(f"  Messages without domains: {len(df_no_domain):,}")
print(f"  Unique domains: {df_with_domain['primary_domain'].nunique():,}")

# Get domain statistics for stratification
print("\n🔍 Analyzing domain label distribution...")

# Count spam/ham per domain
domain_stats = df_with_domain.groupby('primary_domain')['label'].agg([
    ('total', 'count'),
    ('spam', lambda x: (x == 'spam').sum()),
    ('ham', lambda x: (x == 'ham').sum())
]).reset_index()

# Calculate spam ratio per domain
domain_stats['spam_ratio'] = domain_stats['spam'] / domain_stats['total']

# Categorize domains by spam ratio for stratified sampling
# Simplified to 2 categories to avoid stratification issues
def categorize_domain(ratio):
    if ratio >= 0.5:
        return 'spam_heavy'  # 50%+ spam
    else:
        return 'ham_heavy'  # <50% spam

domain_stats['category'] = domain_stats['spam_ratio'].apply(categorize_domain)

print(f"\n📊 Domain categories:")
print(domain_stats['category'].value_counts())

# Split domains (not messages!) 80/20 with stratification
print(f"\n✂️ Splitting domains 80/20...")

train_domains, test_domains = train_test_split(
    domain_stats['primary_domain'].values,
    test_size=0.2,
    random_state=42,
    stratify=domain_stats['category'].values
)

print(f"✓ Train domains: {len(train_domains):,}")
print(f"✓ Test domains: {len(test_domains):,}")

# Verify ZERO overlap
overlap = set(train_domains) & set(test_domains)
print(f"✓ Domain overlap: {len(overlap)} (should be 0!)")

if len(overlap) > 0:
    print(f"❌ ERROR: Found {len(overlap)} overlapping domains!")
    print("   First 10 overlapping domains:")
    for domain in list(overlap)[:10]:
        print(f"     - {domain}")
    exit(1)

# Split data based on domain assignment
train_with_domain = df_with_domain[df_with_domain['primary_domain'].isin(train_domains)]
test_with_domain = df_with_domain[df_with_domain['primary_domain'].isin(test_domains)]

# Split no-domain messages 80/20
train_no_domain, test_no_domain = train_test_split(
    df_no_domain,
    test_size=0.2,
    random_state=42,
    stratify=df_no_domain['label']
)

# Combine
train_df = pd.concat([train_with_domain, train_no_domain], ignore_index=True)
test_df = pd.concat([test_with_domain, test_no_domain], ignore_index=True)

# Shuffle
train_df = train_df.sample(frac=1, random_state=42).reset_index(drop=True)
test_df = test_df.sample(frac=1, random_state=42).reset_index(drop=True)

# Statistics
print(f"\n📊 Split statistics:")
print(f"\nTRAIN SET:")
print(f"  Total: {len(train_df):,} messages")
print(f"  Spam: {(train_df['label'] == 'spam').sum():,} ({(train_df['label'] == 'spam').sum()/len(train_df)*100:.1f}%)")
print(f"  Ham: {(train_df['label'] == 'ham').sum():,} ({(train_df['label'] == 'ham').sum()/len(train_df)*100:.1f}%)")
print(f"  Unique domains: {train_df['primary_domain'].nunique():,}")

print(f"\nTEST SET:")
print(f"  Total: {len(test_df):,} messages")
print(f"  Spam: {(test_df['label'] == 'spam').sum():,} ({(test_df['label'] == 'spam').sum()/len(test_df)*100:.1f}%)")
print(f"  Ham: {(test_df['label'] == 'ham').sum():,} ({(test_df['label'] == 'ham').sum()/len(test_df)*100:.1f}%)")
print(f"  Unique domains: {test_df['primary_domain'].nunique():,}")

# Verify label balance
train_spam_pct = (train_df['label'] == 'spam').sum() / len(train_df) * 100
test_spam_pct = (test_df['label'] == 'spam').sum() / len(test_df) * 100
balance_diff = abs(train_spam_pct - test_spam_pct)

print(f"\n⚖️ Label balance:")
print(f"  Train spam: {train_spam_pct:.1f}%")
print(f"  Test spam: {test_spam_pct:.1f}%")
print(f"  Difference: {balance_diff:.1f}%")

if balance_diff < 2:
    print(f"  ✅ Excellent balance!")
elif balance_diff < 5:
    print(f"  ✅ Good balance")
else:
    print(f"  ⚠️ Some imbalance")

# Show domain category distribution
print(f"\n📊 Domain category distribution:")

train_domain_categories = domain_stats[domain_stats['primary_domain'].isin(train_domains)]['category'].value_counts()
test_domain_categories = domain_stats[domain_stats['primary_domain'].isin(test_domains)]['category'].value_counts()

print(f"\nTRAIN domains:")
for cat, count in train_domain_categories.items():
    pct = count / len(train_domains) * 100
    print(f"  {cat:15s}: {count:6,} ({pct:5.1f}%)")

print(f"\nTEST domains:")
for cat, count in test_domain_categories.items():
    pct = count / len(test_domains) * 100
    print(f"  {cat:15s}: {count:6,} ({pct:5.1f}%)")

# Show sample domains from each split
print(f"\n📝 Sample TRAIN domains:")
train_sample = domain_stats[domain_stats['primary_domain'].isin(train_domains)].head(10)
for _, row in train_sample.iterrows():
    print(f"  {row['primary_domain']:40s}: {row['total']:3d} msgs (spam: {row['spam_ratio']*100:.0f}%)")

print(f"\n📝 Sample TEST domains:")
test_sample = domain_stats[domain_stats['primary_domain'].isin(test_domains)].head(10)
for _, row in test_sample.iterrows():
    print(f"  {row['primary_domain']:40s}: {row['total']:3d} msgs (spam: {row['spam_ratio']*100:.0f}%)")

# Critical verification: Check for domain leakage
print(f"\n🔒 CRITICAL VERIFICATION:")
print(f"  ✓ Train domains: {len(train_domains):,}")
print(f"  ✓ Test domains: {len(test_domains):,}")
print(f"  ✓ Overlap: {len(overlap)}")

if len(overlap) == 0:
    print(f"  ✅ ZERO OVERLAP CONFIRMED - True generalization test!")
else:
    print(f"  ❌ OVERLAP DETECTED - Split invalid!")

# Save splits
print(f"\n💾 Saving train/test splits...")

train_path = 'Datasets/train_domain_stratified.csv'
test_path = 'Datasets/test_domain_stratified.csv'

train_df.to_csv(train_path, index=False)
test_df.to_csv(test_path, index=False)

print(f"✓ Train set saved to: {train_path}")
print(f"✓ Test set saved to: {test_path}")

# Save domain lists for reference
print(f"\n💾 Saving domain lists...")

domain_lists = {
    'train_domains': list(train_domains),
    'test_domains': list(test_domains),
    'train_count': len(train_domains),
    'test_count': len(test_domains),
    'overlap': list(overlap)
}

import json
with open('Datasets/domain_split_info.json', 'w') as f:
    json.dump(domain_lists, f, indent=2)

print(f"✓ Domain lists saved to: Datasets/domain_split_info.json")

# Summary
print("\n" + "="*80)
print("📋 SPLITTING SUMMARY")
print("="*80)

print(f"\n✅ Total dataset: {len(df):,} messages")
print(f"✅ Train set: {len(train_df):,} messages ({len(train_df)/len(df)*100:.1f}%)")
print(f"✅ Test set: {len(test_df):,} messages ({len(test_df)/len(df)*100:.1f}%)")

print(f"\n🔒 Domain separation:")
print(f"  Train domains: {len(train_domains):,}")
print(f"  Test domains: {len(test_domains):,}")
print(f"  Overlap: {len(overlap)} ✅")

print(f"\n⚖️ Label distribution:")
print(f"  Train: {train_spam_pct:.1f}% spam / {100-train_spam_pct:.1f}% ham")
print(f"  Test: {test_spam_pct:.1f}% spam / {100-test_spam_pct:.1f}% ham")

print(f"\n🎯 Quality checks:")
if len(overlap) == 0:
    print(f"  ✅ ZERO domain overlap - True generalization test")
else:
    print(f"  ❌ Domain overlap detected - INVALID SPLIT")

if balance_diff < 2:
    print(f"  ✅ Excellent label balance ({balance_diff:.1f}% diff)")
elif balance_diff < 5:
    print(f"  ✅ Good label balance ({balance_diff:.1f}% diff)")
else:
    print(f"  ⚠️ Label imbalance ({balance_diff:.1f}% diff)")

# Calculate expected performance impact
print(f"\n💡 Expected impact:")
print(f"  - Model will train on {len(train_domains):,} domains")
print(f"  - Model will be tested on {len(test_domains):,} COMPLETELY UNSEEN domains")
print(f"  - This ensures model learns PATTERNS, not specific domains")
print(f"  - Test accuracy represents TRUE real-world performance")

print("\n" + "="*80)
print("✅ STEP 4 COMPLETE: Domain-stratified splits created!")
print("="*80)
print(f"\n📁 Outputs:")
print(f"  - {train_path}")
print(f"  - {test_path}")
print(f"  - Datasets/domain_split_info.json")
