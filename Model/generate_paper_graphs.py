import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import json
import os

# Load data
with open('Model/reports/metrics.json', 'r') as f:
    metrics = json.load(f)

df_weights = pd.read_csv('Model/reports/global_feature_weights.csv')

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams.update({'font.size': 12})

# 1. Feature Importance Plot
plt.figure(figsize=(12, 8))
# Get top 10 positive (scam) and top 10 negative (legitimate)
top_scam = df_weights[df_weights['direction'] == 'scam_positive'].head(10)
top_legit = df_weights[df_weights['direction'] == 'scam_negative'].head(10)
# Combine and sort
plot_data = pd.concat([top_scam, top_legit]).sort_values('coefficient', ascending=True)

colors = ['#ef4444' if x > 0 else '#22c55e' for x in plot_data['coefficient']]
plt.barh(plot_data['feature'], plot_data['coefficient'], color=colors)
plt.title('Top Predictive Features: Scam (Red) vs. Legitimate (Green)')
plt.xlabel('Model Coefficient (Weight)')
plt.axvline(0, color='black', linewidth=0.8)
plt.tight_layout()
plt.savefig('Model/reports/feature_importance.png', dpi=300)
print("Generated feature_importance.png")

# 2. Robustness Comparison Plot
plt.figure(figsize=(10, 6))
robustness = metrics['robustness']
categories = ['Accuracy', 'Precision', 'Recall', 'F1']
baseline = [robustness['baseline'][k.lower()] for k in categories]
adversarial = [robustness['adversarial'][k.lower()] for k in categories]

x = range(len(categories))
width = 0.35

plt.bar([i - width/2 for i in x], baseline, width, label='Baseline (Clean Data)', color='#3b82f6')
plt.bar([i + width/2 for i in x], adversarial, width, label='Adversarial (Obfuscated)', color='#f59e0b')

plt.ylabel('Score')
plt.title('Model Robustness: Clean vs. Adversarial Attacks')
plt.xticks(x, categories)
plt.ylim(0.7, 1.0)
plt.legend()
plt.tight_layout()
plt.savefig('Model/reports/robustness_comparison.png', dpi=300)
print("Generated robustness_comparison.png")
