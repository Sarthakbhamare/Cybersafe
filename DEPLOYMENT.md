# CyberSafe Deployment Guide

## 📦 GitHub Deployment

### 1. Initialize Git Repository

```powershell
# Navigate to project root
cd E:\CyberSafe1

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CyberSafe AI-powered cybersecurity platform"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `CyberSafe` (public/private)
3. **Do NOT** initialize with README (we have one)

### 3. Push to GitHub

```powershell
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/CyberSafe.git

# Push code
git branch -M main
git push -u origin main
```

### 4. Verify Upload
- Check repository at: `https://github.com/YOUR_USERNAME/CyberSafe`
- Ensure `.env` files are NOT committed (gitignore protects them)

---

## ☁️ GCP Deployment (Cloud Run)

### Prerequisites
- GCP account with billing enabled
- `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install

### 1. Setup GCP Project

```powershell
# Login to GCP
gcloud auth login

# Create new project (or use existing)
gcloud projects create cybersafe-prod --name="CyberSafe Platform"

# Set project
gcloud config set project cybersafe-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Setup MongoDB (MongoDB Atlas)

Since Cloud Run is stateless, use MongoDB Atlas for database:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Whitelist IP: `0.0.0.0/0` (allow all - for Cloud Run)
4. Create database user
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/cybersafe`

### 3. Set Environment Variables

```powershell
# Set secrets in Secret Manager
gcloud secrets create jwt-secret --data-file=-
# Paste your JWT secret (min 32 chars), press Ctrl+Z then Enter

gcloud secrets create mongodb-uri --data-file=-
# Paste your MongoDB Atlas URI, press Ctrl+Z then Enter

# Optional: API keys
gcloud secrets create virustotal-api-key --data-file=-
gcloud secrets create gemini-api-key --data-file=-
```

### 4. Deploy ML Service First

```powershell
# Navigate to model directory
cd model

# Build and deploy
gcloud run deploy cybersafe-ml `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --memory 1Gi `
  --timeout 60

# Note the service URL (e.g., https://cybersafe-ml-xxx-uc.a.run.app)
```

### 5. Deploy Backend

```powershell
cd ../backend

# Deploy with secrets
gcloud run deploy cybersafe-backend `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --set-secrets "JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest" `
  --set-env-vars "ML_SERVICE_URL=https://cybersafe-ml-xxx-uc.a.run.app,PORT=5000"

# Note the backend URL (e.g., https://cybersafe-backend-xxx-uc.a.run.app)
```

### 6. Deploy Frontend

```powershell
cd ../frontend

# Build with production API URL
echo "VITE_API_URL=https://cybersafe-backend-xxx-uc.a.run.app/api" > .env.production

# Deploy
gcloud run deploy cybersafe-frontend `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated

# Frontend URL: https://cybersafe-frontend-xxx-uc.a.run.app
```

### 7. Configure CORS in Backend

Update `backend/server.js` CORS to include Cloud Run URLs:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://cybersafe-frontend-xxx-uc.a.run.app' // Add your frontend URL
  ],
  credentials: true
};
```

Then redeploy backend.

---

## 🔄 Automated Deployment (CI/CD)

### Option 1: Cloud Build Trigger

```powershell
# Connect GitHub repo to Cloud Build
gcloud builds triggers create github `
  --repo-name=CyberSafe `
  --repo-owner=YOUR_USERNAME `
  --branch-pattern="^main$" `
  --build-config=cloudbuild.yaml
```

Now every push to `main` branch automatically deploys!

### Option 2: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: Deploy to Cloud Run
        run: |
          gcloud builds submit --config cloudbuild.yaml
```

---

## 🧪 Local Testing with Docker

```powershell
# Build and run all services
docker-compose up --build

# Access:
# Frontend: http://localhost:80
# Backend: http://localhost:5000
# ML: http://localhost:8000
```

---

## 📊 Cost Estimation (GCP Free Tier)

- **Cloud Run**: 2M requests/month free, then $0.40/million
- **MongoDB Atlas**: 512MB free tier (shared cluster)
- **Container Registry**: 0.5GB free storage
- **Estimated monthly cost**: $0-5 (within free tier for small traffic)

---

## 🔒 Security Checklist

- [ ] All `.env` files added to `.gitignore`
- [ ] Secrets stored in GCP Secret Manager (not hardcoded)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS configured with production URLs only
- [ ] JWT secret is 32+ characters random string
- [ ] Cloud Run IAM permissions reviewed

---

## 🐛 Troubleshooting

### "Container failed to start"
- Check logs: `gcloud run logs read --service=cybersafe-backend --limit=50`
- Verify environment variables set correctly
- Check Dockerfile EXPOSE matches PORT env

### "CORS error in browser"
- Ensure backend CORS includes frontend URL
- Check if `credentials: true` in fetch requests matches backend

### "MongoDB connection failed"
- Verify Atlas connection string format
- Check IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions

### "ML model not found"
- Ensure `model/artifacts/` contains `.joblib` files
- Run training script before deployment
- Check model loading path in FastAPI

---

## 📞 Support

For deployment issues, check:
- GCP Status: https://status.cloud.google.com
- Cloud Run Docs: https://cloud.google.com/run/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas

---

**🎉 Deployment Complete!**

Your CyberSafe platform is now live at:
- Frontend: `https://cybersafe-frontend-xxx-uc.a.run.app`
- API: `https://cybersafe-backend-xxx-uc.a.run.app`
