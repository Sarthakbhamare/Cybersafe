# Scam Message Detection Model Evaluation

Focus: Single binary classifier (scam vs legitimate) using TF-IDF features + Logistic Regression.
Scope: Provide structured evaluation across key categories: Performance, Generalization, Robustness, Efficiency, Complexity, Interpretability, Fairness, Data Quality, Stability, Deployment Readiness, Business Fit.

> NOTE: Adjust paths to your serialized artifacts (e.g. `scam_detector_model.joblib`, `scam_tfidf_vectorizer.joblib`) in `evaluate.py`.

---
## 1. Performance
Metrics computed on held-out test set (stratified split):
- Accuracy
- Precision (Positive = scam)
- Recall / Sensitivity
- F1-Score
- ROC-AUC
- PR-AUC
- Confusion Matrix (TP, FP, FN, TN)
- Threshold Sweep (optional) for precision/recall trade-offs.

Outputs: JSON summary + charts (`confusion_matrix.png`, `roc_curve.png`, `pr_curve.png`).

Success Criteria (baseline targets):
- Recall ≥ 0.85 (protect users by catching scams)
- Precision ≥ 0.80 (control false alerts)
- ROC-AUC ≥ 0.88

---
## 2. Generalization
Evaluation splits:
- Standard hold-out test
- k-fold cross-validation (k=5) mean ± std for F1/ROC-AUC
- Optional external validation subset (if available; placeholder path)

Signals of good generalization: small performance variance across folds (< 0.03 ROC-AUC std).

---
## 3. Robustness
Stress tests applied:
- Noise Injection: Random character substitutions (e.g. 'e'→'3', 'a'→'@')
- Punctuation Stripping: Remove punctuation entirely
- Case Variations: Random uppercase segments
- Adversarial Keyword Dilution: Insert benign filler words

Report delta in F1 and recall vs baseline. Identify largest degradation source.

---
## 4. Efficiency
Measured during evaluation:
- Inference latency (avg, p95) per message
- Batch inference latency (batch size 64, 256)
- Memory footprint: model object size + vectorizer size (estimated from `joblib` artifact byte size)

Target: < 75ms single inference (CPU), < 1ms per sample in batch.

---
## 5. Complexity
- Model type: Logistic Regression (linear classifier)
- Feature space size: up to 5,000 TF-IDF dimensions
- Parameter count: (#features + intercept) ~ 5,001 parameters
- FLOPs per inference: O(features) linear dot product (approx. 5k multiply-adds)

Conclusion: Lightweight; suitable for real-time use without GPU.

---
## 6. Interpretability
Methods:
- Global Feature Weights: Top + bottom 20 coefficients
- Local Explanation (LIME): 3 representative messages (TP, FP, FN) highlighting influential tokens

Deliverables: `global_feature_weights.csv`, `lime_example_[id].html`.

---
## 7. Fairness
Simplified proxy analysis (requires labeled subsets):
- Split test set by message length buckets (short <40 chars, medium 40-120, long >120)
- Optional language/code-mix flags (if annotated) — placeholder logic
- Compute per-group recall & false positive rate.

Flag gaps > 0.08 absolute difference in recall across groups.

---
## 8. Data Quality & Balance
Dataset summary:
- Class distribution (scam vs legitimate)
- Token vocabulary size
- Top 30 most frequent tokens
- Duplicate message count
- Average & median length

Outputs: `class_distribution.png`, `length_histogram.png`.

---
## 9. Stability
Run evaluation twice:
- Report metric variation (should be identical for deterministic pipeline)
If random components exist (e.g., cross-val shuffling) show mean ± std.

---
## 10. Deployment Readiness
Checklist:
- Deterministic inference ✔
- Latency within threshold ✔ (after measurement)
- Model artifact size small (<5MB) ✔ (to confirm)
- No heavy dependencies (no deep learning libs) ✔
- Updatable via drop-in artifact replacement ✔

---
## 11. Business Fit
Business goals (protect users from scams while minimizing false alarms):
- High recall prevents missed scam warnings.
- Sufficient precision avoids user distrust from excessive false positives.
- Lightweight architecture supports scaling to large user base without major infra.

Planned Enhancements:
- Confidence-based UI severity color coding
- User feedback loop for misclassification
- Continuous data augmentation from real user submissions

---
## 12. Usage
### 12.1 Install
```powershell
python -m venv .venv
& .venv\Scripts\Activate.ps1
pip install -r model/requirements.txt
```

### 12.2 Place Artifacts
Copy your trained files into `model/artifacts/`:
- `scam_detector_model.joblib`
- `scam_tfidf_vectorizer.joblib`
- `dataset.csv` (columns: text,label) or adapt path inside script

### 12.3 Run Evaluation
```powershell
python model/evaluate.py --data model/artifacts/dataset.csv --model model/artifacts/scam_detector_model.joblib --vectorizer model/artifacts/scam_tfidf_vectorizer.joblib --out model/reports
```

Optional flags:
- `--cv-folds 5`
- `--lime-explain 3`
- `--adversarial` (enable robustness tests)

### 12.4 Output Directory
`model/reports/` will contain:
- `metrics.json`
- `confusion_matrix.png`, `roc_curve.png`, `pr_curve.png`
- `class_distribution.png`, `length_histogram.png`
- `global_feature_weights.csv`
- `lime_example_*.html` (if enabled)
- `robustness.json` (if adversarial tests run)

---
## 13. Reproducibility
- Fix random seeds (e.g., 42) in cross-validation.
- Document environment: Python version, library versions.
- Include artifact hash (`sha256`) in metrics output for traceability.

---
## 14. Extension Points
- Add SHAP summary plot (requires `shap` library) for global feature influence.
- Add bias evaluation by domain-specific subsets (e.g., financial vs non-financial messages).
- Integrate incremental training pipeline for new labeled messages.

---
## 15. Next Steps
1. Provide actual artifacts and dataset.
2. Run evaluation and capture reports.
3. Review robustness gaps; prioritize adversarial augmentation.
4. Implement feedback loop in production interface.

---
## 16. Training (Optional)
If you only have a labeled CSV and need to produce artifacts first:

```powershell
python model/train.py --data model/artifacts/dataset.csv --out model/artifacts
```
This will create `scam_detector_model.joblib` and `scam_tfidf_vectorizer.joblib` in `model/artifacts/`, plus a `training_report.txt`.

---
*End of README*
