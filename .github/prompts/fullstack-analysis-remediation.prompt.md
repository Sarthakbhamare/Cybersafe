---
name: "Full Stack Analysis And Remediation"
description: "Use when you need a detailed analysis of frontend, backend, and model issues with prioritized fixes, performance improvements, and delivery plan."
argument-hint: "Optional focus: UX, API speed, Redis BullMQ, auth, learning module"
agent: "agent"
---
Run a comprehensive engineering analysis of this project and produce a prioritized remediation plan.

Scope
- Frontend, backend, and model service.
- Product quality, architecture, reliability, performance, and security.
- The chat argument should be treated as extra focus and merged into this default scope.

Must cover these areas explicitly
- Frontend UX issues, including clickable boxes creating ugly blue focus borders.
- API performance optimization opportunities end to end.
- Redis and BullMQ adoption plan for background jobs and scalability.
- Email verification workflow with BullMQ.
- Google login implementation plan.
- Forgot password flow implementation plan.
- Learning-section flaws across user types.
- XP counter correctness and user-level isolation bugs.
- Interactive simulator reliability across user types.
- Active learning tutorial coverage gaps.
- Exam quit behavior and attempt-consumption policy.
- Practical frontend improvements for usability and consistency.

Execution requirements
1. Discover and map architecture
- Identify key routes, controllers, models, services, and frontend pages/components.
- Map request flows: frontend to backend, backend to model, and async/background paths.

2. Reproduce and validate issues
- Confirm each issue with evidence where possible.
- If an issue cannot be reproduced, mark it as unverified and list what evidence is needed.

3. Provide findings first, ordered by severity
- Critical, High, Medium, Low.
- For each finding include:
  - Symptom
  - Root cause
  - Impact
  - Exact file targets
  - Recommended fix

4. Performance and architecture optimization
- API-level optimizations: query/indexing, payload size, caching, batching, rate limiting, and timeout/retry strategy.
- Backend throughput and latency risks.
- Frontend render/perceived performance bottlenecks.
- Model-serving latency and reliability improvements.

5. Redis and BullMQ design
- Define queue names, job payload contracts, retry/backoff, dead-letter handling, and monitoring.
- Specify where Redis helps immediately (cache, sessions, queueing, throttling, OTP/token state).
- Include migration steps with low-risk rollout.

6. Authentication and account workflows
- Google OAuth login flow (frontend + backend + DB changes).
- Email verification flow with queued email sending.
- Forgot/reset password flow with secure token handling and expiration.
- Security controls: token invalidation, brute-force mitigation, audit logging.

7. Learning and gamification correctness
- Explain why XP appears identical across users and propose an isolated per-user model.
- Recommend data model and API changes to persist progress correctly.
- Define simulator fixes and tutorial activation logic per user type.
- Propose exam state machine to handle quit/resume/attempt consumption rules.

8. Output format
- Section A: Executive summary (max 12 bullets)
- Section B: Findings by severity
- Section C: File-level fix plan (concrete edits grouped by frontend/backend/model)
- Section D: Redis and BullMQ implementation blueprint
- Section E: Auth feature blueprint (Google login, email verification, forgot password)
- Section F: Learning and simulator remediation blueprint
- Section G: Performance plan with expected gains and metrics to track
- Section H: Phased delivery plan
  - Phase 1: quick wins (1 to 3 days)
  - Phase 2: medium changes (1 to 2 weeks)
  - Phase 3: structural improvements (2 to 6 weeks)
- Section I: Test plan (unit, integration, e2e, load, and security)
- Section J: Risks, assumptions, and open questions

Output quality bar
- Prefer concrete, file-targeted recommendations over generic advice.
- Do not hide uncertainty; label assumptions clearly.
- Keep recommendations implementable by a small team.
- Do not implement code unless explicitly asked in the chat request.
additional constraints for api performance optimizations
- Prioritize optimizations that yield the highest impact for the least effort.
- Consider both backend processing time and frontend perceived performance.
- Include monitoring and metrics to validate the impact of optimizations.
ensure the bckend only return what the frontend needs and not extra data that is not used in the UI, to reduce payload size and improve performance.