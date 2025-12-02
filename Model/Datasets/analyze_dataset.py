"""
Analyze dataset to see if we need more typosquatting examples
"""
import pandas as pd
import re

# Load dataset
print("Loading dataset...")
df = pd.read_csv('unified_ml_dataset_full.csv', low_memory=False)
print(f"Dataset shape: {df.shape}")
print(f"\nLabel distribution:")
print(df['label'].value_counts())

# Check for WhatsApp-related messages
print("\n" + "="*80)
print("Searching for WhatsApp-related messages...")
print("="*80)

whatsapp_msgs = df[df['text'].str.contains('whatsapp|whats app|wa\\.me', case=False, na=False, regex=True)]
print(f"\nFound {len(whatsapp_msgs)} WhatsApp-related messages")
print(f"  - Spam: {len(whatsapp_msgs[whatsapp_msgs['label']=='spam'])}")
print(f"  - Ham: {len(whatsapp_msgs[whatsapp_msgs['label']=='ham'])}")

if len(whatsapp_msgs) > 0:
    print("\nSample WhatsApp messages:")
    for i, (idx, row) in enumerate(whatsapp_msgs.head(10).iterrows(), 1):
        print(f"\n{i}. [{row['label'].upper()}] {row['text'][:150]}")

# Check for brand names
print("\n" + "="*80)
print("Checking for brand-related phishing...")
print("="*80)

brands = ['paypal', 'amazon', 'apple', 'netflix', 'microsoft', 'google', 'facebook', 'bank']
for brand in brands:
    brand_msgs = df[df['text'].str.contains(brand, case=False, na=False)]
    spam_count = len(brand_msgs[brand_msgs['label']=='spam'])
    if spam_count > 0:
        print(f"{brand.capitalize()}: {spam_count} spam messages")

# Check for verification/code messages
print("\n" + "="*80)
print("Checking for verification code patterns...")
print("="*80)

verification_msgs = df[df['text'].str.contains('verification|verify|code is|your code', case=False, na=False, regex=True)]
print(f"\nFound {len(verification_msgs)} verification-related messages")
print(f"  - Spam: {len(verification_msgs[verification_msgs['label']=='spam'])}")
print(f"  - Ham: {len(verification_msgs[verification_msgs['label']=='ham'])}")

print("\nSample verification messages (SPAM):")
spam_verif = verification_msgs[verification_msgs['label']=='spam']['text'].head(5)
for i, msg in enumerate(spam_verif, 1):
    print(f"\n{i}. {msg[:120]}...")

print("\nSample verification messages (HAM):")
ham_verif = verification_msgs[verification_msgs['label']=='ham']['text'].head(5)
for i, msg in enumerate(ham_verif, 1):
    print(f"\n{i}. {msg[:120]}...")

# Summary
print("\n" + "="*80)
print("ANALYSIS SUMMARY")
print("="*80)
print(f"Total messages: {len(df):,}")
print(f"Spam messages: {len(df[df['label']=='spam']):,}")
print(f"Ham messages: {len(df[df['label']=='ham']):,}")
print(f"\nWhatsApp phishing examples: {len(whatsapp_msgs[whatsapp_msgs['label']=='spam'])}")
print(f"Verification code examples: {len(verification_msgs)}")

if len(whatsapp_msgs[whatsapp_msgs['label']=='spam']) < 10:
    print("\n⚠️ WARNING: Very few WhatsApp phishing examples!")
    print("   Recommendation: Add more typosquatting examples to training data")
