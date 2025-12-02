"""
Step 1: Clean Corrupted Dataset
Remove pre-tokenized messages containing [URL], [EMAIL], [PHONE] tokens
"""

import pandas as pd
import numpy as np
import re

print("="*80)
print("🧹 STEP 1: CLEANING CORRUPTED DATASET")
print("="*80)

# Load original dataset
print("\n📂 Loading original dataset...")
df = pd.read_csv('Datasets/unified_ml_dataset_train.csv')
print(f"✓ Loaded: {len(df):,} messages")

# Show initial label distribution
print("\n📊 Initial label distribution:")
print(df['label'].value_counts())

# Identify corrupted messages
print("\n🔍 Identifying corrupted messages (pre-tokenized)...")

# Patterns to detect pre-tokenized data
tokenized_patterns = [
    r'\[URL\]',
    r'\[EMAIL\]',
    r'\[PHONE\]',
    r'HTTPURL',
    r'WWWURL',
    r'EMAILADDR',
    r'PHONENUM',
    r'\bURL\b(?![a-z])',  # URL as standalone word (not in middle of word)
    r'\bEMAIL\b(?![a-z])',
    r'\bPHONE\b(?![a-z])'
]

# Combine patterns
combined_pattern = '|'.join(tokenized_patterns)

# Find corrupted messages
corrupted_mask = df['text'].str.contains(combined_pattern, case=False, regex=True, na=False)
corrupted_count = corrupted_mask.sum()

print(f"\n❌ Found {corrupted_count:,} corrupted messages ({corrupted_count/len(df)*100:.1f}%)")

# Show examples of corrupted messages
print("\n📝 Examples of corrupted messages:")
corrupted_samples = df[corrupted_mask]['text'].head(10)
for i, msg in enumerate(corrupted_samples, 1):
    print(f"\n{i}. {msg[:150]}...")

# Remove corrupted messages
print("\n🗑️ Removing corrupted messages...")
df_clean = df[~corrupted_mask].copy()

print(f"✓ Removed: {corrupted_count:,} messages")
print(f"✓ Remaining: {len(df_clean):,} messages")

# Check label distribution after cleaning
print("\n📊 Label distribution after cleaning:")
label_dist_clean = df_clean['label'].value_counts()
print(label_dist_clean)

# Calculate percentage change
spam_before = df[df['label'] == 'spam'].shape[0]
ham_before = df[df['label'] == 'ham'].shape[0]
spam_after = df_clean[df_clean['label'] == 'spam'].shape[0]
ham_after = df_clean[df_clean['label'] == 'ham'].shape[0]

print(f"\n📉 Changes:")
print(f"  Spam: {spam_before:,} → {spam_after:,} (removed {spam_before - spam_after:,})")
print(f"  Ham: {ham_before:,} → {ham_after:,} (removed {ham_before - ham_after:,})")

# Check for any remaining issues
print("\n🔍 Checking for remaining issues...")

# Missing values
missing_text = df_clean['text'].isna().sum()
missing_label = df_clean['label'].isna().sum()
print(f"  Missing text: {missing_text}")
print(f"  Missing labels: {missing_label}")

# Empty or very short messages
short_msgs = df_clean['text'].apply(lambda x: len(str(x).strip()) < 5).sum()
print(f"  Very short messages (<5 chars): {short_msgs}")

# Remove very short messages
if short_msgs > 0:
    print(f"\n🗑️ Removing {short_msgs} very short messages...")
    df_clean = df_clean[df_clean['text'].apply(lambda x: len(str(x).strip()) >= 5)].copy()
    print(f"✓ Final count: {len(df_clean):,} messages")

# Remove any NaN labels
if missing_label > 0:
    print(f"\n🗑️ Removing {missing_label} messages with missing labels...")
    df_clean = df_clean.dropna(subset=['label'])
    print(f"✓ Final count: {len(df_clean):,} messages")

# Reset index
df_clean = df_clean.reset_index(drop=True)

# Save cleaned dataset
print("\n💾 Saving cleaned dataset...")
output_path = 'Datasets/unified_ml_dataset_train_cleaned.csv'
df_clean.to_csv(output_path, index=False)
print(f"✓ Saved to: {output_path}")

# Summary statistics
print("\n" + "="*80)
print("📊 CLEANING SUMMARY")
print("="*80)

print(f"\n✅ Original dataset: {len(df):,} messages")
print(f"❌ Corrupted (pre-tokenized): {corrupted_count:,} messages ({corrupted_count/len(df)*100:.1f}%)")
print(f"❌ Very short messages: {short_msgs:,} messages")
print(f"✅ Clean dataset: {len(df_clean):,} messages ({len(df_clean)/len(df)*100:.1f}%)")

print(f"\n📊 Final label distribution:")
print(f"  Spam: {spam_after:,} ({spam_after/len(df_clean)*100:.1f}%)")
print(f"  Ham: {ham_after:,} ({ham_after/len(df_clean)*100:.1f}%)")

# Check balance
balance_diff = abs(spam_after/len(df_clean) - ham_after/len(df_clean)) * 100
if balance_diff < 5:
    print(f"\n✅ Dataset is well balanced (difference: {balance_diff:.1f}%)")
else:
    print(f"\n⚠️ Dataset has some imbalance (difference: {balance_diff:.1f}%)")

# Show sample of cleaned data
print("\n📝 Sample of cleaned data:")
print("\nSPAM examples:")
spam_samples = df_clean[df_clean['label'] == 'spam']['text'].head(5)
for i, msg in enumerate(spam_samples, 1):
    print(f"\n{i}. {msg[:150]}...")

print("\nHAM examples:")
ham_samples = df_clean[df_clean['label'] == 'ham']['text'].head(5)
for i, msg in enumerate(ham_samples, 1):
    print(f"\n{i}. {msg[:150]}...")

print("\n" + "="*80)
print("✅ STEP 1 COMPLETE: Dataset cleaned!")
print("="*80)
print(f"\n📁 Output: {output_path}")
print(f"📊 Total: {len(df_clean):,} clean messages ready for training")
