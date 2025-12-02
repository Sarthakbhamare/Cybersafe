CyberSafe: An AI‑Powered Multi‑Demographic Platform for Real‑Time Cyber Threat Detection and Digital Safety Education in India

ABSTRACT -
India’s accelerating digitization has expanded services and, in parallel, exposure to crafted online fraud. CyberSafe is a web platform that combines lightweight, interpretable text‑based detection with demographically tailored education, interactive practice, and community reporting. A TF‑IDF + linear classification pipeline provides real‑time screening, while a modern three‑tier web stack supports scalable delivery. Five audience‑specific interfaces (students, professionals, senior citizens, homemakers, rural users) are aligned to observed risks and accessibility needs. Simulation tools, a certification path, and a community reputation layer promote practical learning and shared vigilance. Early experiments indicate competitive detection accuracy and low user‑perceived latency. The contribution is the integration of production‑ready models with human‑centered design reflecting India’s linguistic and demographic diversity.

Keywords – Cybersecurity Education, Scam Detection, Text Classification, User‑Centered Design, Community Intelligence, Multilingual Interfaces, India

I. INTRODUCTION
Digital platforms now mediate routine tasks across India, aided by low‑cost data and mobile adoption. As participation grows, attackers increasingly lean on social engineering—urgency, authority, and contextual cues—often targeting specific groups. Public reports consistently show increases in cyber incidents, with financial fraud forming a major share. Prior work attributes a large fraction of successful attacks to human factors, suggesting that technical defenses should be paired with education that is timely, engaging, and accessible.

CyberSafe addresses this gap by coupling text‑based scam detection with demographically informed education and a community reporting channel. The approach avoids one‑size‑fits‑all interfaces and links detection outcomes to teachable moments. Contributions include: (i) an integrated architecture for detection and instruction, (ii) five audience interfaces grounded in observed vulnerabilities, (iii) a fast, interpretable ML pipeline suitable for real‑time use, and (iv) interactive tools that encourage active learning and reporting.

This paper reviews related work (Section II), outlines methodology and architecture (Section III), summarizes implementation (Section IV), presents results (Section V), and concludes with limitations and future directions (Section VI).

II. LITERATURE SURVEY
Research on phishing/spam shows that supervised learning with content features achieves strong accuracy on curated datasets [1], [2]. Linear models and ensembles remain practical baselines, while neural approaches offer gains with large, representative corpora [3]. In text classification, high‑dimensional sparse features such as TF‑IDF over uni/bi‑grams are competitive for speed and interpretability [4], [5], even as transformer models set benchmarks on broader NLP tasks [6].

Usable security emphasizes aligning defenses with user mental models, minimizing friction, and providing actionable, well‑timed guidance [7], [8]. Demographics shape security preferences and behaviors; personalization and gamification can improve engagement and learning outcomes across groups [9], [10].

Community‑driven intelligence provides earlier visibility into malicious content and accounts but requires aggregation and moderation that consider reporter reliability [11], [12]. Weighted consensus methods routinely outperform simple majority voting in noisy settings [13]. These threads motivate CyberSafe’s blend of lightweight models, user‑aware design, and community input.

III. METHODOLOGY
A. System Overview
CyberSafe adopts a three‑tier design: a React frontend for presentation; an application layer with an Express API and a separate FastAPI inference service; and MongoDB for persistence. This separation enables independent scaling and service evolution.

B. Data Flow
1) Authentication: Registration and login implement adaptive hashing and token‑based access. Clients attach tokens to protected requests.
2) Detection: Client text is normalized, vectorized via TF‑IDF, and scored by a logistic regression classifier, returning a label and confidence.
3) Community Stories: Anonymous submissions are sanitized for sensitive fields and published to a public feed with comments and upvotes.
4) Reputation Checks: Third‑party lookups (e.g., URL/IP) are rate‑limited and cached for short‑term reuse.

C. Demographic Interfaces
Five interfaces reflect distinct patterns of use and exposure: students (scholarship/internship scams; gamified practice), professionals (BEC/impersonation; checklists, scenarios), senior citizens (larger text, step‑by‑step KYC/banking guidance), homemakers (shopping/prize scams; narrative tips), and rural users (icon‑first, localized language, offline‑friendly). Accessibility targets WCAG conformance with typography and contrast tailored to each audience.

D. Security and Privacy
The platform employs password hashing and signed tokens for stateless authorization, validates inputs, and enforces CORS. Content routes redact emails, phone numbers, and card patterns on submission. Data collection is minimized; community features permit anonymity to reduce doxxing risk.

E. Performance
Bundles are code‑split and lazy‑loaded. Services are stateless and horizontally scalable. Frequently used queries are indexed; short‑lived caches reduce repeated external lookups. The inference service keeps models warm and supports single/batch predictions.

IV. IMPLEMENTATION
A. Frontend
A single‑page React application (Vite build, Tailwind CSS) provides route‑based code splitting. Views include real‑time screening, simulators, certification, and the community feed.

B. Backend
The Express API exposes authentication, content, and reputation routes with schema validation and sanitization. MongoDB stores user profiles (minimized), stories, and metadata with appropriate indexing.

C. Inference Service
FastAPI loads the vectorizer and classifier at startup and exposes a minimal `/predict` endpoint accepting raw text and returning label and confidence. The TF‑IDF (uni/bi‑grams, sublinear TF, vocabulary cap) + logistic regression pipeline balances speed, interpretability, and acceptable accuracy.

V. RESULTS
A. Model Performance
On a combined test set, the baseline attains accuracy in the low‑to‑mid 80s with higher recall than precision—appropriate for protective screening. Confusion matrices and ROC/PR curves guide threshold choices to mitigate alert fatigue. Errors concentrate in brief, context‑poor messages (false negatives) and legitimate notifications with urgency terms (false positives).

B. Latency
Local deployments show end‑to‑end detection typically well under 150 ms, inclusive of preprocessing and inference, supporting interactive use.

C. Data Quality and Robustness
Class balance, message‑length distributions, and duplicates are monitored to avoid skew. Adversarial checks with mild perturbations (e.g., character substitutions, spacing noise) inform augmentation and future robustness work.

VI. CONCLUSION
CyberSafe combines a lean, interpretable detection pipeline with demographically informed design and community input to address prevalent online scams in India. Early results indicate that practical accuracy and low latency can be achieved while maintaining accessible user experiences. Future work includes dataset expansion with quality controls, multilingual coverage, stronger adversarial robustness, calibrated probabilities, and field studies to measure learning and behavior change.

VII. REFERENCES
[1] I. Fette, N. Sadeh, and A. Tomasic, “Learning to detect phishing emails,” WWW, 2007.
[2] S. Abu‑Nimeh, D. Nappa, X. Wang, and S. Nair, “A comparison of machine learning techniques for phishing detection,” APWG eCrime, 2007.
[3] A. C. Bahnsen et al., “Classifying phishing URLs using Recurrent Neural Networks,” EEEIC, 2017.
[4] T. Joachims, “Text categorization with Support Vector Machines: Learning with many relevant features,” ECML, 1998.
[5] S. Wang and C. D. Manning, “Baselines and bigrams: Simple, good sentiment and topic classification,” ACL, 2012.
[6] J. Devlin, M.‑W. Chang, K. Lee, and K. Toutanova, “BERT: Pre‑training of Deep Bidirectional Transformers for Language Understanding,” NAACL, 2019.
[7] A. Whitten and J. D. Tygar, “Why Johnny can’t encrypt: A usability evaluation of PGP 5.0,” USENIX Security, 1999.
[8] L. F. Cranor, “A framework for reasoning about the human in the loop,” UPSEC, 2008.
[9] E. M. Redmiles, S. Kross, and M. L. Mazurek, “How well do my results generalize? Lessons from security and privacy user studies,” IEEE S&P, 2018.
[10] I. Granic, A. Lobel, and R. Engels, “The benefits of playing video games,” American Psychologist, 2014.
[11] T. Moore and R. Clayton, “Examining the impact of website take‑down on phishing,” APWG eCrime, 2007.
[12] G. Stringhini et al., “Follow the green: Growth and dynamics in Twitter spam,” IMC, 2013.
[13] X. L. Dong et al., “Knowledge‑based trust: Estimating the trustworthiness of web sources,” VLDB, 2015.
