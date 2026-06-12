# Chapter: Software and Hardware Requirements

## 1. Purpose of This Chapter

This chapter defines the infrastructure and software stack required to develop, test, and deploy the CyberSafe platform. The values are chosen from the current implementation and deployment pattern used in this project.

## 2. Hardware Requirements

### 2.1 Minimum Configuration (Development / Small Pilot)

- CPU: 4-core 64-bit processor (Intel i5 / Ryzen 5 class or equivalent)
- RAM: 8 GB
- Storage: 256 GB SSD
- Network: Stable broadband, 20 Mbps or higher
- OS: Windows 10/11, Ubuntu 22.04+, or equivalent Linux distribution

This setup is sufficient for local development, model testing, and moderate API traffic.

### 2.2 Recommended Configuration (Team Use / Staging)

- CPU: 6 to 8-core processor (Intel i7 / Ryzen 7 class)
- RAM: 16 GB
- Storage: 512 GB SSD (NVMe preferred)
- Network: 50 Mbps or higher with low packet loss
- Optional: External backup drive or cloud snapshot schedule

This setup handles parallel frontend, backend, database, and ML service execution with better stability.

### 2.3 Production-Oriented Baseline

- Backend runtime: containerized Node service
- ML runtime: isolated Python service container
- Database: MongoDB (managed or self-hosted with backup)
- Reverse proxy/web serving: Nginx for frontend assets
- Availability strategy: health checks + restart policy + periodic backups

### 2.4 GPU Requirement

GPU is not mandatory for the current deployment because the active inference flow uses lightweight artifacts suitable for CPU execution. A GPU may be required only if transformer-scale multilingual models are introduced in later phases.

## 3. Software Requirements

### 3.1 Core Languages and Runtimes

- JavaScript / Node.js for API and server logic
- Python 3.11 for ML training and inference services
- HTML/CSS/JavaScript for frontend interface

### 3.2 Frontend Stack

- React 18
- Vite 6
- Tailwind CSS 4
- i18next and react-i18next for localization
- Chart.js + react-chartjs-2 for analytics visualization
- Framer Motion for UI motion

### 3.3 Backend Stack

- Express 4
- Mongoose 8 for MongoDB integration
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Helmet for security headers
- CORS and Morgan middleware
- Redis client integration (optional caching/warm jobs)

### 3.4 ML and Data Stack

- scikit-learn
- NumPy
- Pandas
- SciPy
- joblib
- xgboost
- lime (explainability experiments)
- Flask / FastAPI and Uvicorn (service-level usage based on module)

### 3.5 Database and Storage

- MongoDB 8 (local container or managed cloud)
- Document collections for users, stories, reactions, chat history, and analytics data
- Serialized model artifacts (`.joblib`) and threshold configuration JSON files

### 3.6 Build and Deployment Tooling

- Docker and Docker Compose for local multi-service orchestration
- Nginx for frontend container serving
- Cloud Run / container hosting support (as documented in deployment files)
- Git + CI pipeline support for repeatable builds and deployment

## 4. Service Ports and Runtime Separation

Common runtime mapping in local/container workflows:

- Frontend: 80 (Nginx)
- Backend API: 5000
- ML service: 8000/5001 depending on selected service module
- MongoDB: 27017

Keeping services separate improves maintainability and avoids single-process bottlenecks.

## 5. Security and Compliance-Oriented Requirements

Minimum security controls required for deployment:

- HTTPS in production
- JWT secret management via environment variables/secrets manager
- Strict CORS allow-list in production mode
- Input sanitization and PII redaction before persistence
- Periodic dependency updates and vulnerability checks
- Database backup and retention policy

## 6. Performance and Capacity Notes

For early deployment, the stack can support regular educational traffic and community usage with low operational cost. If user volume increases, scale should be applied in this order:

1. Add backend instances.
2. Scale ML service independently.
3. Add Redis caching and queue-based workloads.
4. Move to managed MongoDB tier with monitoring and automatic backups.

## 7. Conclusion

The current CyberSafe implementation is resource-efficient and deployable on standard modern hardware. Its software stack is modular, production-viable, and suitable for progressive upgrades without major redesign. This makes it practical for academic deployment today and scalable for broader rollout in future phases.