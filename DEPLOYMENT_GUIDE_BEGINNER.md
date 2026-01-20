# 🚀 CyberSafe Complete Deployment Guide (Beginner-Friendly)

**Last Updated**: January 2026

---

## 📋 What We're Deploying
- **Frontend**: React app (Vite) → Vercel
- **Backend**: Node.js/Express API → Vercel or Render
- **Database**: MongoDB → MongoDB Atlas (free)
- **ML Model**: Python service → Optional (local or Hugging Face)
- **Code**: GitHub (version control)

---

## PART 1: GitHub Setup (5 minutes)

### Step 1.1: Install Git
1. Download from: https://git-scm.com/download/win
2. Run installer, accept defaults
3. Open PowerShell and verify: `git --version`

### Step 1.2: Create GitHub Account
1. Go to https://github.com/signup
2. Sign up (free account is fine)
3. Create username (e.g., `your-username`)
4. Verify email

### Step 1.3: Push Your Code to GitHub

Open PowerShell and run:

```powershell
# Navigate to project
cd E:\CyberSafe1

# Check if git is already initialized
git status
# If error, initialize:
git init

# Configure git (use YOUR GitHub email/username)
git config --global user.email "your-email@example.com"
git config --global user.name "Your GitHub Username"

# Add all files
git add .

# First commit
git commit -m "Initial commit: CyberSafe AI platform - frontend, backend, and ML models"

# Create main branch (if needed)
git branch -M main
```

### Step 1.4: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `CyberSafe`
   - **Description**: "AI-powered cybersecurity exam platform with ML threat detection"
   - **Public** (so people can see your work)
   - **Add .gitignore**: Node
3. **DO NOT** initialize with README
4. Click **"Create repository"**

### Step 1.5: Upload Code to GitHub

GitHub will show you commands. Run these in PowerShell:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/CyberSafe.git
git branch -M main
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

✅ **Done!** Your code is now on GitHub at:
```
https://github.com/YOUR-USERNAME/CyberSafe
```

---

## PART 2: Database Setup (10 minutes)

### Step 2.1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** or sign in
3. Verify email if needed

### Step 2.2: Create Free Cluster
1. Click **"Build a Database"**
2. Select **"M0 Free"** tier (free forever)
3. Choose cloud (AWS, Azure, GCP - doesn't matter for free)
4. Choose region closest to you
5. **Cluster name**: `cybersafe`
6. Click **"Create"**
7. Wait 2-3 minutes for cluster to be ready

### Step 2.3: Create Database User
1. In left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Fill:
   - **Username**: `cybersafe-admin`
   - **Password**: Generate secure one (MongoDB will show)
   - **Built-in Role**: `Read and write to any database`
4. Click **"Add User"**
5. **Copy and save the password!** You'll need it

### Step 2.4: Allow Access
1. In left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Confirm

### Step 2.5: Get Connection String
1. Click **"Databases"** in sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Node.js** and version **5.5**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://cybersafe-admin:<password>@cybersafe.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: change end to `/cybersafe?retryWrites...`

**Final URL should look like:**
```
mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
```

✅ **Done!** You have your database connection string.

---

## PART 3: Backend Deployment (Vercel or Render)

### OPTION A: Deploy Backend to Vercel (Recommended for Beginners)

#### Step 3A.1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

#### Step 3A.2: Update Backend Configuration

Edit `backend/vercel.json` (should already exist):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "ML_SERVICE_URL": "@ml_service_url"
  }
}
```

#### Step 3A.3: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your `CyberSafe` repository
5. **Framework Preset**: None
6. **Root Directory**: `backend`
7. Click **"Continue"**

#### Step 3A.4: Set Environment Variables

Before deploying, click **"Environment Variables"** and add:

```
MONGODB_URI = mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority

JWT_SECRET = db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1

ML_SERVICE_URL = http://localhost:8004

CLIENT_URL = https://YOUR-FRONTEND-DOMAIN (add this after frontend is deployed)
```

**Important**: 
- Use your actual MongoDB password
- Keep `JWT_SECRET` the same as in `.env`
- Leave `ML_SERVICE_URL` for now (we'll update it)

#### Step 3A.5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. See your backend URL! (e.g., `https://cybersafe-backend.vercel.app`)

✅ **Your backend is live!**

---

### OPTION B: Deploy Backend to Render (Free Alternative)

If Vercel doesn't work:

1. Go to https://render.com/signup
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your `CyberSafe` repository
5. **Name**: `cybersafe-backend`
6. **Root Directory**: `backend`
7. **Runtime**: `Node`
8. **Build Command**: `npm install`
9. **Start Command**: `npm start`
10. Add same environment variables as above
11. Click **"Create Web Service"**

Your URL will be: `https://cybersafe-backend.onrender.com`

---

## PART 4: Frontend Deployment (10 minutes)

### Step 4.1: Update Frontend Configuration

Edit `frontend/vite.config.js` (check it exists):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://YOUR-BACKEND-URL', // Use your Vercel backend URL
        changeOrigin: true,
      }
    }
  }
})
```

### Step 4.2: Create `.env.production` in Frontend

Create file: `frontend/.env.production`

```
VITE_API_URL=https://YOUR-BACKEND-URL
```

Replace `YOUR-BACKEND-URL` with your actual backend URL (from Step 3A.5 or 3B)

### Step 4.3: Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select your `CyberSafe` repository
4. **Framework**: `Vite`
5. **Root Directory**: `frontend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://cybersafe-backend.vercel.app`)
9. Click **"Deploy"**

✅ **Your frontend is live!** (e.g., `https://cybersafe-frontend.vercel.app`)

---

## PART 5: Connect Frontend to Backend

### Step 5.1: Update API Calls

Your backend should receive requests from frontend. Check that:

1. **Backend CORS is configured** in `backend/server.js`:

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://YOUR-FRONTEND-URL'
  ],
  credentials: true
}));
```

2. **Frontend calls backend API** in components:

Example in React component:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});
```

### Step 5.2: Update Backend Environment Variables

Go back to Vercel/Render backend settings and update:
```
CLIENT_URL = https://YOUR-FRONTEND-URL
```

---

## PART 6: Testing the Deployment

### Test 1: Check if Backend is Running
Open in browser:
```
https://YOUR-BACKEND-URL/health
# or
https://YOUR-BACKEND-URL/api/auth/ping
```
Should return some response (not error)

### Test 2: Test Login
1. Go to your frontend URL
2. Try to **Register** a new user
3. Check if account was created
4. Try to **Login**
5. Check if you can see dashboard

### Test 3: Check Database
1. Go to MongoDB Atlas
2. Click your cluster
3. Click **"Browse Collections"**
4. Should see collections with user data

---

## PART 7: ML Model Deployment (Optional)

### If You Want to Deploy ML Model:

**Option 1: Keep Local (Easiest)**
- Run ML service on your computer
- Backend calls it via `http://localhost:8004`
- Works while you develop

**Option 2: Deploy to Hugging Face Spaces (Free)**
1. Create Hugging Face account: https://huggingface.co
2. Create a Space with Gradio
3. Upload your ML model files
4. Get URL and update `ML_SERVICE_URL` in Vercel env

**Option 3: Deploy to Railway**
1. Go to https://railway.app
2. Connect GitHub repo
3. Add custom Dockerfile for ML service
4. Get URL

For now, **use Option 1** (local) until everything works.

---

## PART 8: Future Updates & Maintenance

### Pushing Updates to GitHub
```powershell
cd E:\CyberSafe1
git add .
git commit -m "Description of changes"
git push origin main
```

### Redeploying Backend/Frontend
1. Push to GitHub (above)
2. Vercel will **auto-redeploy** in 1-2 minutes
3. Check deployment status on Vercel dashboard

### Updating Environment Variables
1. Go to Vercel backend project
2. Settings → Environment Variables
3. Change value
4. Vercel will redeploy automatically

---

## ⚠️ Security Tips

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Keep JWT_SECRET safe** - don't share it
3. **Use strong MongoDB password**
4. **Enable HTTPS** (Vercel does this automatically)
5. **Add rate limiting** to your backend (coming later)

---

## 🆘 Troubleshooting

### Frontend shows "Cannot connect to API"
- Check `VITE_API_URL` environment variable
- Check backend CORS settings
- Check if backend URL is correct

### Login not working
- Check MongoDB connection string
- Check if user collection exists in database
- Check backend logs in Vercel

### Database errors
- Verify IP whitelist (should be `0.0.0.0/0`)
- Check connection string password (no special chars that need encoding)
- Make sure username/password are correct

### Vercel deployment fails
- Check `vercel.json` is correct
- Check all dependencies are in `package.json`
- Check for missing imports in code

---

## 📊 Summary of Deployment

| Component | Platform | Status | URL |
|-----------|----------|--------|-----|
| Code | GitHub | ✅ | github.com/YOUR-USERNAME/CyberSafe |
| Backend | Vercel | ✅ | https://cybersafe-backend.vercel.app |
| Frontend | Vercel | ✅ | https://cybersafe-frontend.vercel.app |
| Database | MongoDB Atlas | ✅ | Cloud (you manage via dashboard) |
| ML Model | Local | ⏳ | On your computer |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Set up MongoDB
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Test everything works
6. 📝 Monitor for errors
7. 🔄 Update frequently

**You're done! Your app is on the internet!** 🎉

---

Need help? Check deployment logs in Vercel dashboard!
