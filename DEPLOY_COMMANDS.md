# 📺 Video Tutorial References & Step-by-Step Commands

Use these exact commands in the order shown. Copy & paste them!

---

## STEP 1️⃣: Push to GitHub

### 1.1: Open PowerShell
```
Windows Key + R
powershell
Enter
```

### 1.2: Navigate to project folder
```powershell
cd E:\CyberSafe1
```

### 1.3: Check if git is installed
```powershell
git --version
```
Should show version like `git version 2.43.0`

If not: Download from https://git-scm.com/download/win and install

### 1.4: Configure git (FIRST TIME ONLY)
```powershell
git config --global user.email "your-email@gmail.com"
git config --global user.name "Your Name"
```
Replace with YOUR actual email and name!

### 1.5: Initialize git
```powershell
git init
```

### 1.6: Add all files
```powershell
git add .
```

### 1.7: Create first commit
```powershell
git commit -m "Initial CyberSafe deployment"
```

### 1.8: Rename branch to main (if needed)
```powershell
git branch -M main
```

### 1.9: Add GitHub remote
```powershell
git remote add origin https://github.com/YOUR-USERNAME/CyberSafe.git
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

### 1.10: Push to GitHub
```powershell
git push -u origin main
```

When asked:
- **Username**: Your GitHub username
- **Password**: Your GitHub password (or personal access token)

### 1.11: Verify on GitHub
Open browser and go to:
```
https://github.com/YOUR-USERNAME/CyberSafe
```

You should see your code! ✅

---

## STEP 2️⃣: Set Up MongoDB Atlas

### 2.1: Create Account
Go to: https://www.mongodb.com/cloud/atlas/register

### 2.2: Create Free Cluster
1. Click **"Build a Database"**
2. Select **M0 Free** tier
3. Choose nearest region
4. Name: `cybersafe`
5. Click **"Create"**
6. Wait 2-3 minutes...

### 2.3: Create Database User
1. Click **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. **Username**: `cybersafe-admin`
4. **Password**: Let MongoDB generate one, then copy it
5. **Role**: `Read and write to any database`
6. Click **"Add User"**
7. **Save the password!** ⬅️ Important!

### 2.4: Allow All IPs
1. Click **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Click **"Confirm"**

### 2.5: Get Connection String
1. Click **"Databases"** (top)
2. Click **"Connect"** button
3. Choose **"Connect your application"**
4. Copy the string
5. Replace `<password>` with actual password
6. Add `/cybersafe` before `?retryWrites`

**Final string looks like:**
```
mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
```

**Save this!** ⬅️ You'll need it next

---

## STEP 3️⃣: Deploy Backend to Vercel

### 3.1: Create Vercel Account
Go to: https://vercel.com/signup
Click **"Continue with GitHub"**

### 3.2: Import Project
1. Go to: https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select `CyberSafe`

### 3.3: Configure for Backend
1. **Framework Preset**: None
2. **Root Directory**: Change to `backend`
3. Click **"Continue"**

### 3.4: Add Environment Variables
Click **"Environment Variables"** and add these:

**Variable 1:**
```
Name: MONGODB_URI
Value: mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
```

**Variable 2:**
```
Name: JWT_SECRET
Value: db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1
```

**Variable 3:**
```
Name: ML_SERVICE_URL
Value: http://localhost:8004
```

**Variable 4:**
```
Name: CLIENT_URL
Value: (leave blank for now)
```

**Variable 5:**
```
Name: GEMINI_API_KEY
Value: AIzaSyA594Wk24v32DNQmXqwVqRHt_mD3CjQqAg
```

**Then click: "Deploy"**

### 3.5: Wait for Deployment
Green checkmark = Success! ✅

Copy your backend URL (looks like):
```
https://cybersafe-backend-xxxxx.vercel.app
```

**Save this!** ⬅️ You'll need it next

---

## STEP 4️⃣: Deploy Frontend to Vercel

### 4.1: Add New Project
1. Go to: https://vercel.com/dashboard
2. Click **"Add New Project"** again
3. Click **"Import Git Repository"**
4. Select `CyberSafe`

### 4.2: Configure for Frontend
1. **Framework**: Vite
2. **Root Directory**: Change to `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Click **"Continue"**

### 4.3: Add Environment Variable
Click **"Environment Variables"** and add:

```
Name: VITE_API_URL
Value: https://cybersafe-backend-xxxxx.vercel.app
```

(Use the backend URL from Step 3.5)

**Then click: "Deploy"**

### 4.4: Wait for Deployment
Green checkmark = Success! ✅

Your frontend URL (looks like):
```
https://cybersafe-frontend-xxxxx.vercel.app
```

---

## STEP 5️⃣: Test Your App

### 5.1: Open Frontend
Go to:
```
https://cybersafe-frontend-xxxxx.vercel.app
```

### 5.2: Try to Register
1. Click **"Sign Up"**
2. Enter email, password
3. Click **"Register"**
4. Should create account (no error)

### 5.3: Try to Login
1. Enter email and password you just used
2. Click **"Login"**
3. Should see dashboard

### 5.4: Check Protected Pages
1. Try to view exam (without logging out)
2. Should show exam
3. Log out
4. Try to view exam again
5. Should redirect to login

✅ **If all works, you're DONE!**

---

## 🔄 How to Update Your App

Every time you make changes:

### In PowerShell:
```powershell
cd E:\CyberSafe1
git add .
git commit -m "Description of changes"
git push origin main
```

**Vercel will automatically redeploy in 1-2 minutes!**

---

## 📋 Command Summary

### Quick Copy-Paste Sequence

**GitHub Setup:**
```powershell
cd E:\CyberSafe1
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
git init
git add .
git commit -m "Initial CyberSafe deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/CyberSafe.git
git push -u origin main
```

**Local Testing (Optional):**
```powershell
cd E:\CyberSafe1\backend
npm install
npm start

# In another PowerShell window:
cd E:\CyberSafe1\frontend
npm install
npm run dev
```

**Update after changes:**
```powershell
cd E:\CyberSafe1
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🎯 Checklist Summary

- [ ] Git installed on computer
- [ ] GitHub account created
- [ ] Code pushed to GitHub (Step 1)
- [ ] MongoDB cluster created (Step 2)
- [ ] MongoDB connection string saved (Step 2.5)
- [ ] Backend deployed to Vercel (Step 3)
- [ ] Backend URL saved (Step 3.5)
- [ ] Frontend deployed to Vercel (Step 4)
- [ ] Frontend URL saved (Step 4.4)
- [ ] Registration works (Step 5.2)
- [ ] Login works (Step 5.3)
- [ ] App is LIVE! 🎉

---

## ⏱️ Estimated Time

| Step | Time | Status |
|------|------|--------|
| GitHub setup | 5 min | ⏳ |
| MongoDB | 10 min | ⏳ |
| Backend deploy | 5 min | ⏳ |
| Frontend deploy | 5 min | ⏳ |
| Testing | 5 min | ⏳ |
| **TOTAL** | **~30 min** | 🚀 |

---

**Ready to deploy? Follow the steps above!** 🚀

If you get stuck, check: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
