"""
Step 3: Balance Domain Distribution
Limit each domain to max 100 examples to prevent memorization
"""

import pandas as pd
import numpy as np
from collections import Counter

print("="*80)
print("⚖️ STEP 3: BALANCING DOMAIN DISTRIBUTION")
print("="*80)

# Load cleaned dataset
print("\n📂 Loading cleaned dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train_cleaned.csv')
print(f"✓ Loaded: {len(df):,} messages")

# Initial statistics
print("\n📊 Initial statistics:")
print(f"  Total messages: {len(df):,}")
print(f"  Spam: {(df['label'] == 'spam').sum():,}")
print(f"  Ham: {(df['label'] == 'ham').sum():,}")

if 'primary_domain' in df.columns:
    domains_with_data = df['primary_domain'].notna().sum()
    unique_domains = df['primary_domain'].nunique()
    print(f"  Messages with domains: {domains_with_data:,}")
    print(f"  Unique domains: {unique_domains:,}")
else:
    print("\n⚠️ No 'primary_domain' column - will skip domain balancing")
    print("   Saving original dataset as balanced version...")
    df.to_csv('Datasets/unified_ml_dataset_train_balanced.csv', index=False)
    exit(0)

# Analyze domain frequency
print("\n🔍 Analyzing domain frequency...")
domain_counts = df['primary_domain'].value_counts()

# Domains appearing > different thresholds
over_1000 = (domain_counts > 1000).sum()
over_500 = (domain_counts > 500).sum()
over_100 = (domain_counts > 100).sum()

print(f"\n📈 Domain frequency distribution:")
print(f"  Domains appearing >1000 times: {over_1000}")
print(f"  Domains appearing >500 times: {over_500}")
print(f"  Domains appearing >100 times: {over_100}")

# Show top offenders
print(f"\n🚨 Top 20 most frequent domains:")
for i, (domain, count) in enumerate(domain_counts.head(20).items(), 1):
    pct = (count / len(df)) * 100
    print(f"  {i:2d}. {domain:40s}: {count:6,} ({pct:5.2f}%)")

# Strategy: Limit each domain to max 100 examples
MAX_EXAMPLES_PER_DOMAIN = 100

print(f"\n⚖️ Applying domain balancing strategy...")
print(f"  Strategy: Limit each domain to max {MAX_EXAMPLES_PER_DOMAIN} examples")

# Separate messages with and without domains
df_with_domain = df[df['primary_domain'].notna()].copy()
df_no_domain = df[df['primary_domain'].isna()].copy()

print(f"\n  Messages with domains: {len(df_with_domain):,}")
print(f"  Messages without domains: {len(df_no_domain):,}")

# Balance domains using groupby for efficiency
balanced_samples = []

# Group by domain
grouped = df_with_domain.groupby('primary_domain')

print(f"\n  Processing {len(grouped)} unique domains...")

# Process each domain group
for domain, group in grouped:
    if len(group) > MAX_EXAMPLES_PER_DOMAIN:
        # Sample MAX_EXAMPLES_PER_DOMAIN examples, stratified by label
        spam_samples = group[group['label'] == 'spam']
        ham_samples = group[group['label'] == 'ham']
        
        # Maintain spam/ham ratio
        spam_ratio = len(spam_samples) / len(group)
        spam_count = min(len(spam_samples), int(MAX_EXAMPLES_PER_DOMAIN * spam_ratio))
        ham_count = MAX_EXAMPLES_PER_DOMAIN - spam_count
        
        # Sample
        if len(spam_samples) > spam_count and spam_count > 0:
            spam_samples = spam_samples.sample(spam_count, random_state=42)
        if len(ham_samples) > ham_count and ham_count > 0:
            ham_samples = ham_samples.sample(ham_count, random_state=42)
        
        balanced_samples.append(pd.concat([spam_samples, ham_samples]))
    else:
        # Keep all samples if under limit
        balanced_samples.append(group)

# Combine balanced samples
df_balanced_with_domain = pd.concat(balanced_samples, ignore_index=True)

print(f"\n✓ Balanced domains:")
print(f"  Before: {len(df_with_domain):,} messages")
print(f"  After: {len(df_balanced_with_domain):,} messages")
print(f"  Removed: {len(df_with_domain) - len(df_balanced_with_domain):,} messages")

# Combine with messages without domains
df_balanced = pd.concat([df_balanced_with_domain, df_no_domain], ignore_index=True)

print(f"\n📊 Final balanced dataset:")
print(f"  Total: {len(df_balanced):,} messages")
print(f"  Spam: {(df_balanced['label'] == 'spam').sum():,}")
print(f"  Ham: {(df_balanced['label'] == 'ham').sum():,}")

# Check new domain distribution
print(f"\n🔍 Verifying domain balance...")
new_domain_counts = df_balanced['primary_domain'].value_counts()
max_domain_count = new_domain_counts.max()
domains_over_limit = (new_domain_counts > MAX_EXAMPLES_PER_DOMAIN).sum()

print(f"  Max examples per domain: {max_domain_count}")
print(f"  Domains over {MAX_EXAMPLES_PER_DOMAIN} limit: {domains_over_limit}")

if domains_over_limit > 0:
    print(f"\n⚠️ Some domains still over limit:")
    over_limit = new_domain_counts[new_domain_counts > MAX_EXAMPLES_PER_DOMAIN]
    for domain, count in over_limit.head(10).items():
        print(f"     {domain}: {count}")
else:
    print(f"\n✅ All domains within {MAX_EXAMPLES_PER_DOMAIN} example limit!")

# Show new top domains
print(f"\n📊 Top 20 domains after balancing:")
for i, (domain, count) in enumerate(new_domain_counts.head(20).items(), 1):
    pct = (count / len(df_balanced)) * 100
    print(f"  {i:2d}. {domain:40s}: {count:6,} ({pct:5.2f}%)")

# Calculate concentration metrics
top_10_count = new_domain_counts.head(10).sum()
top_10_pct = (top_10_count / df_balanced['primary_domain'].notna().sum()) * 100

top_100_count = new_domain_counts.head(100).sum()
top_100_pct = (top_100_count / df_balanced['primary_domain'].notna().sum()) * 100

print(f"\n📈 Domain concentration after balancing:")
print(f"  Top 10 domains: {top_10_count:,} messages ({top_10_pct:.1f}%)")
print(f"  Top 100 domains: {top_100_count:,} messages ({top_100_pct:.1f}%)")

# Check label balance
spam_count = (df_balanced['label'] == 'spam').sum()
ham_count = (df_balanced['label'] == 'ham').sum()
balance_diff = abs(spam_count - ham_count) / len(df_balanced) * 100

print(f"\n⚖️ Label balance:")
print(f"  Spam: {spam_count:,} ({spam_count/len(df_balanced)*100:.1f}%)")
print(f"  Ham: {ham_count:,} ({ham_count/len(df_balanced)*100:.1f}%)")
print(f"  Difference: {balance_diff:.2f}%")

if balance_diff > 5:
    print(f"\n⚠️ Labels became imbalanced - rebalancing...")
    
    # Downsample majority class
    if spam_count > ham_count:
        df_spam = df_balanced[df_balanced['label'] == 'spam'].sample(ham_count, random_state=42)
        df_ham = df_balanced[df_balanced['label'] == 'ham']
    else:
        df_spam = df_balanced[df_balanced['label'] == 'spam']
        df_ham = df_balanced[df_balanced['label'] == 'ham'].sample(spam_count, random_state=42)
    
    df_balanced = pd.concat([df_spam, df_ham], ignore_index=True)
    
    print(f"  After rebalancing: {len(df_balanced):,} messages")
    print(f"  Spam: {(df_balanced['label'] == 'spam').sum():,} ({(df_balanced['label'] == 'spam').sum()/len(df_balanced)*100:.1f}%)")
    print(f"  Ham: {(df_balanced['label'] == 'ham').sum():,} ({(df_balanced['label'] == 'ham').sum()/len(df_balanced)*100:.1f}%)")

# Shuffle dataset
df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)

# Save balanced dataset
print(f"\n💾 Saving balanced dataset...")
output_path = 'Datasets/unified_ml_dataset_train_balanced.csv'
df_balanced.to_csv(output_path, index=False)
print(f"✓ Saved to: {output_path}")

# Summary
print("\n" + "="*80)
print("📋 BALANCING SUMMARY")
print("="*80)

print(f"\n✅ Original dataset: {len(df):,} messages")
print(f"✅ Balanced dataset: {len(df_balanced):,} messages")
print(f"❌ Removed: {len(df) - len(df_balanced):,} messages ({(len(df) - len(df_balanced))/len(df)*100:.1f}%)")

print(f"\n📊 Domain statistics:")
print(f"  Unique domains: {df_balanced['primary_domain'].nunique():,}")
print(f"  Max per domain: {new_domain_counts.max()}")
print(f"  Avg per domain: {new_domain_counts.mean():.1f}")
print(f"  Top 10 concentration: {top_10_pct:.1f}%")

print(f"\n⚖️ Final label balance:")
spam_final = (df_balanced['label'] == 'spam').sum()
ham_final = (df_balanced['label'] == 'ham').sum()
print(f"  Spam: {spam_final:,} ({spam_final/len(df_balanced)*100:.1f}%)")
print(f"  Ham: {ham_final:,} ({ham_final/len(df_balanced)*100:.1f}%)")

# Quality check
print(f"\n🎯 Quality assessment:")
if new_domain_counts.max() <= MAX_EXAMPLES_PER_DOMAIN:
    print(f"  ✅ All domains ≤ {MAX_EXAMPLES_PER_DOMAIN} examples")
else:
    print(f"  ⚠️ Some domains > {MAX_EXAMPLES_PER_DOMAIN} examples")

if top_10_pct < 5:
    print(f"  ✅ Low domain concentration ({top_10_pct:.1f}%)")
elif top_10_pct < 10:
    print(f"  ✅ Good domain distribution ({top_10_pct:.1f}%)")
else:
    print(f"  ⚠️ Moderate concentration ({top_10_pct:.1f}%)")

if balance_diff < 2:
    print(f"  ✅ Excellent label balance ({balance_diff:.2f}% diff)")
elif balance_diff < 5:
    print(f"  ✅ Good label balance ({balance_diff:.2f}% diff)")
else:
    print(f"  ⚠️ Label imbalance ({balance_diff:.2f}% diff)")

print("\n" + "="*80)
print("✅ STEP 3 COMPLETE: Domain distribution balanced!")
print("="*80)
print(f"\n📁 Output: {output_path}")
print(f"📊 Total: {len(df_balanced):,} messages ready for domain-stratified splitting")
