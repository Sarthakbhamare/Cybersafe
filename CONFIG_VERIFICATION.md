# 🔧 Configuration Verification Checklist

Run through this to make sure everything is set up correctly BEFORE deploying.

---

## ✅ Backend Configuration

### File: `backend/server.js`
- [x] CORS is configured
- [x] Database connection is set up
- [x] All routes are imported
- [x] Error handling exists

**Status**: ✅ Ready

---

### File: `backend/.env`
Current values:
```
MONGODB_URI=mongodb://127.0.0.1:27017/cybersafe
JWT_SECRET=db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1
PORT=5000
ML_SERVICE_URL=http://localhost:8004
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=AIzaSyA594Wk24v32DNQmXqwVqRHt_mD3CjQqAg
```

**For Production (Vercel), change to:**
```
MONGODB_URI=mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
JWT_SECRET=db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1
PORT=5000
ML_SERVICE_URL=http://localhost:8004
CLIENT_URL=https://cybersafe-frontend-xxxxx.vercel.app
GEMINI_API_KEY=AIzaSyA594Wk24v32DNQmXqwVqRHt_mD3CjQqAg
```

**Note**: `.env` is NOT pushed to GitHub (it's in `.gitignore`) ✅

**Status**: ⚠️ Will need to update on Vercel dashboard

---

### File: `backend/vercel.json`
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
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Status**: ✅ Ready

---

### File: `backend/package.json`
- [x] Main: `server.js`
- [x] Type: `module`
- [x] Start script: `node server.js`
- [x] All dependencies listed

**Dependencies**:
- express ✅
- mongoose ✅
- cors ✅
- jsonwebtoken ✅
- bcryptjs ✅
- dotenv ✅
- helmet ✅
- morgan ✅

**Status**: ✅ Ready

---

## ✅ Frontend Configuration

### File: `frontend/vite.config.js`
Should have:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Status**: ✅ Ready (Vercel handles production builds)

---

### File: `frontend/.env.production` (Create if needed)
```
VITE_API_URL=https://cybersafe-backend-xxxxx.vercel.app
```

**Status**: ⏳ Need to create this before deployment

---

### File: `frontend/package.json`
- [x] Build script: `vite build`
- [x] Dev script: `vite`
- [x] All dependencies listed

**Key packages**:
- react ✅
- react-router-dom ✅
- i18next ✅
- react-icons ✅

**Status**: ✅ Ready

---

## ✅ Database Configuration

### MongoDB Atlas Setup
- [ ] Account created
- [ ] Cluster created (M0 free tier)
- [ ] Database user created
- [ ] IP whitelist allows `0.0.0.0/0`
- [ ] Connection string copied

**Connection String Format**:
```
mongodb+srv://cybersafe-admin:PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
```

**Status**: ⏳ Need to do this before Step 3

---

## ✅ GitHub Configuration

### .gitignore Check
Should contain:
```
node_modules/
.env
.env.local
.env.production.local
.env.development.local
dist/
build/
.DS_Store
```

**Status**: ✅ Ready

---

### Git Configuration
```bash
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

**Status**: ⏳ Do this before Step 2

---

## ✅ Vercel Configuration

### Backend Project
```
Repository: CyberSafe
Framework Preset: None
Root Directory: backend
```

**Environment Variables**:
```
MONGODB_URI = <from MongoDB Atlas>
JWT_SECRET = db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1
ML_SERVICE_URL = http://localhost:8004
CLIENT_URL = https://cybersafe-frontend-xxxxx.vercel.app
GEMINI_API_KEY = AIzaSyA594Wk24v32DNQmXqwVqRHt_mD3CjQqAg
```

**Status**: ⏳ Will do in Step 3

---

### Frontend Project
```
Repository: CyberSafe
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**Environment Variables**:
```
VITE_API_URL = <your backend URL from Step 3>
```

**Status**: ⏳ Will do in Step 4

---

## ✅ Local Testing (Before Deploying)

### Test Backend Locally
```powershell
cd E:\CyberSafe1\backend
npm install
npm start
```

Should see:
```
Server running on port 5000
MongoDB connected!
```

- [ ] Backend starts without errors
- [ ] Can see "MongoDB connected!" message

---

### Test Frontend Locally
```powershell
cd E:\CyberSafe1\frontend
npm install
npm run dev
```

Should see:
```
VITE v4.x.x ready in xxx ms

➜  Local: http://localhost:5173/
```

- [ ] Frontend starts without errors
- [ ] Can open http://localhost:5173

---

### Test Full Stack
1. Backend running on `localhost:5000`
2. Frontend running on `localhost:5173`
3. Try to register → Should create user in local MongoDB
4. Try to login → Should work
5. Try to access protected pages → Should require login

- [ ] Registration works
- [ ] Login works
- [ ] Protected pages are locked

---

## 🚀 Final Checklist Before Production

Before you run `git push`:

- [ ] All files are added: `git add .`
- [ ] Commit message is clear: `git commit -m "message"`
- [ ] `.env` is NOT in the commit
- [ ] `.gitignore` contains `.env`
- [ ] No console.log statements left (optional)
- [ ] Backend works locally
- [ ] Frontend works locally
- [ ] Full stack works together locally

---

## 📝 Deployment Checklist

### Step 1: GitHub
- [ ] Created GitHub account
- [ ] Created repository `CyberSafe`
- [ ] Pushed code to main branch
- [ ] Code appears on GitHub website

### Step 2: MongoDB
- [ ] Created MongoDB account
- [ ] Created free cluster
- [ ] Created database user
- [ ] Allowed all IPs
- [ ] Copied connection string

### Step 3: Backend on Vercel
- [ ] Created Vercel account
- [ ] Created backend project
- [ ] Added all environment variables
- [ ] Deployment successful
- [ ] Backend URL works in browser

### Step 4: Frontend on Vercel
- [ ] Created frontend project
- [ ] Added VITE_API_URL env var
- [ ] Deployment successful
- [ ] Frontend URL works in browser

### Step 5: Testing
- [ ] Can load frontend page
- [ ] Can register new user
- [ ] Can login
- [ ] Can see dashboard
- [ ] Can access exam/scores (only when logged in)

---

## ✅ You're Ready!

When all checkboxes are done, your app is LIVE! 🎉

---

**Next**: Follow [QUICK_DEPLOY_CHECKLIST.md](QUICK_DEPLOY_CHECKLIST.md) step by step
