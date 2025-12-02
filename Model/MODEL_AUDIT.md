# CyberSafe ML & AI Model Audit

Date: 2025-11-08
Scope: Repository inspection of implemented and declared ML/AI components, their specifications, current integration status, risks, and recommended next steps.

---
## 1. Executive Summary
The codebase claims (in `UPDATED_RESEARCH_PAPER.md`) deployment of a TF-IDF + Logistic Regression scam detection pipeline and an auxiliary Multinomial Naive Bayes model. In the current repository:
- No FastAPI ML service or serialized model artifacts are present.
- Frontend chatbot (`CyberSecurityChatBot.jsx`) contains a stubbed Gemini integration returning canned responses; real API calls are disabled.
- VirusTotal threat reputation checks are implemented client-side (`frontend/src/utils/virusTotalService.js`) with hardcoded API key and local rate limiting + cache.
- Backend (Node/Express) has no ML-related endpoints or libraries.

Result: Documented ML architecture is only partially realized; detection and generative AI functions are not truly integrated. Threat intelligence relies on direct external API usage.

---
## 2. Implemented Components
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Scam Text Classifier (LogReg) | NOT IMPLEMENTED | (missing) | Only described in research paper. |
| Contact/Phone Pattern NB Model | NOT IMPLEMENTED | (missing) | Described; no code artifacts. |
| FastAPI ML Service | NOT PRESENT | (missing) | No Python service folder, no `joblib` models. |
| Gemini Chatbot Integration | STUB ONLY | `frontend/src/pages/CyberSecurityChatBot.jsx` | Offline stub returns static tip; uses `callGeminiAPI` placeholder. |
| VirusTotal Reputation | IMPLEMENTED CLIENT-SIDE | `frontend/src/utils/virusTotalService.js` | Hardcoded key, Map cache, rate-limit logic (15s spacing). |
| PII Redaction | PARTIAL | `backend/utils/helper.js` (implied) | Redaction used when creating stories; code not audited here. |
| Story / Comment Reactions | IMPLEMENTED | Backend controllers/models | Non-ML engagement features. |

---
## 3. Declared ML Model Specifications (From Paper)
### 3.1 Scam Detector
- Algorithm: Logistic Regression (binary classification) over TF-IDF (unigram + bigram; max_features=5000; sublinear TF).
- Preprocessing: lowercase, URL token replacement, special char removal, whitespace normalization.
- Metrics (claimed): Accuracy 82.4%, Precision 84.7%, Recall 88.2%, F1 86.4%, ROC-AUC 0.891.
- Output: `{"prediction": "scam" | "legitimate", "confidence": float}`.
- Latency (claimed): 30–55 ms server-side inference.
### 3.2 Auxiliary Contact Detector
- Algorithm: Multinomial Naive Bayes with character n-grams (2–4).
- Purpose: Phone/email pattern classification or enrichment (not wired).
### 3.3 Generative Assistant (Gemini)
- Intended: Cybersecurity Q&A, guidance, dynamic prompts.
- Actual: Stubbed; no API calls, no streaming, no safety middleware.

---
## 4. Architecture vs Implementation Gap
| Dimension | Intended | Actual | Gap |
|-----------|----------|--------|-----|
| ML Service | FastAPI microservice | Absent | Need Python app + models. |
| Frontend → ML | REST calls to `/predict-scam` | None | Add client wrapper & endpoint. |
| Generative AI | Live Gemini responses | Stubbed | Implement backend proxy & real calls. |
| Threat Intel | Server-mediated | Client-side direct VT calls | Secret leakage, policy risk. |
| Explainability | LIME/SHAP planned | None | No interpretability layer. |
| Model Ops | Versioning, telemetry | None | Need metrics & feedback loop. |

---
## 5. Security & Privacy Risks
1. Hardcoded VirusTotal key in client → Exposed to all users; susceptible to abuse & quota exhaustion.
2. Gemini API key in frontend `.env` (exposed when building) → Same leakage risk.
3. Lack of server proxy prevents centralized rate limiting, logging, and PII scrubbing before third-party calls.
4. No input sanitization layer for future ML endpoints—potential injection/adversarial text issues unmitigated.
5. Absent abuse monitoring: repeated large inputs could DoS a future ML service.

---
## 6. Operational & Quality Gaps
- No automated evaluation harness or confusion matrix regeneration on fresh data.
- No dataset growth pipeline (current training data not present). 
- No drift detection, no threshold tuning interface, no feedback capture (“mark as misclassified”).
- Missing structured logging (prediction latencies, confidence distributions).
- Missing test cases for ML API integration (unit & integration). 

---
## 7. Recommended Action Plan (Phased)
### Phase 1 (Foundations)
- Create `ml-service/` with FastAPI, add `requirements.txt` (scikit-learn, joblib, pydantic, uvicorn).
- Add serialized baseline model + vectorizer (`scam_detector_model.joblib`, `scam_tfidf_vectorizer.joblib`).
- Implement `/predict-scam` endpoint with input validation & error handling.
- Move VirusTotal calls to backend: new route `/intel/indicator` with server-side key usage.
- Migrate API keys to environment variables (`.env` or OS secrets); remove from frontend bundle.
### Phase 2 (Integration & UX)
- Add frontend utility `scamClassifier.js` calling backend.
- Surface confidence and highlight suspicious tokens (top weighted features for positive class).
- Wire real Gemini responses via backend proxy: endpoint `/chat/ask`; apply safety filters & length caps.
### Phase 3 (Observability & Feedback)
- Add structured logging (prediction time, confidence, anonymized hash of input).
- Implement a feedback endpoint `/predict-scam/feedback` for user corrections.
- Build admin dashboard metrics: false positive / false negative review queue.
### Phase 4 (Enhancement)
- Expand dataset (target 50k messages) with crowdsourced & synthetic examples.
- Run periodic retraining, maintain `MODEL_VERSION` and changelog.
- Introduce multilingual support (code-mixed handling or mBERT variant) after data scaling.
### Phase 5 (Advanced)
- Integrate LIME/SHAP explanation microservice.
- Adversarial augmentation (character substitutions) for robustness.
- Add role-based access control for internal analytics endpoints.

---
## 8. Immediate High-Impact Fixes
| Priority | Task | Rationale |
|----------|------|-----------|
| High | Remove client-side API keys | Prevent public exposure & abuse. |
| High | Backend proxy for VirusTotal | Centralize rate limiting & logging. |
| High | Stand up minimal FastAPI /predict-scam | Make claimed feature real. |
| Medium | Logging + feedback API | Foundation for quality improvement. |
| Medium | Confidence + token highlight UI | Improves user trust & learning. |
| Low | Explainability (LIME/SHAP) | Adds transparency; not critical early. |

---
## 9. Sample Backend Proxy Sketches
### 9.1 VirusTotal Proxy (Express)
```js
router.post('/intel/indicator', authOptional, async (req, res) => {
  const { indicator, type } = req.body;
  // validate type in ['url','ip','email']
  // server-side fetch using process.env.VT_API_KEY
  // cache in Redis (planned) or in-memory
});
```
### 9.2 Scam Prediction (FastAPI)
```python
@app.post('/predict-scam')
async def predict(req: PredictionRequest):
    cleaned = preprocess_text(req.text)
    X = vectorizer.transform([cleaned])
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    label = 'scam' if pred == 1 else 'legitimate'
    confidence = proba[1] if pred == 1 else proba[0]
    return { 'prediction': label, 'confidence': round(float(confidence), 3) }
```

---
## 10. Metrics & Monitoring Blueprint
- Counters: total requests, average latency, scam vs legitimate distribution.
- Quality: rolling precision/recall estimates via sampled human review.
- Drift Indicator: KS test on feature distributions monthly vs training baseline.
- Alerting: spike in prediction latency or sudden swing in class balance triggers notification.

---
## 11. Risk Register (Selected)
| Risk | Impact | Mitigation |
|------|--------|------------|
| API key leakage | Abuse & quota lock | Backend proxy, remove keys from client. |
| Model drift | Rising false negatives | Scheduled evaluation & retraining. |
| Adversarial inputs | Misclassification | Augment training with adversarial examples. |
| Data privacy | PII sent to external APIs | Scrub email/phone before external requests. |
| Lack of feedback loop | Slow improvement | Implement user correction capture. |

---
## 12. Quick Integration Checklist
- [ ] Move VirusTotal logic server-side.
- [ ] Delete hardcoded VT key from frontend util.
- [ ] Add environment variables: `VT_API_KEY`, `GEMINI_API_KEY` (server only).
- [ ] Create FastAPI service + deploy locally (port e.g. 8001).
- [ ] Add backend proxy routes: `/ml/predict-scam`, `/chat/ask`.
- [ ] Add frontend wrappers; replace stubbed calls.
- [ ] Implement logging & minimal feedback endpoint.

---
## 13. Summary
The repository currently under-delivers on its documented ML ambitions: baseline classifiers and generative assistant are conceptual, not concretely integrated. Securing external API keys, introducing the promised lightweight ML service, and establishing observability pipelines are immediate, high-leverage actions. The outlined phased roadmap and checklist provide a clear path to production-grade, trustworthy AI functionality aligned with the platform vision.

---
## 14. Next Optional Steps (If Approved)
I can scaffold the FastAPI service and backend proxy in a follow-up. Indicate which phase to start and I will implement directly.

---
*End of Report*
