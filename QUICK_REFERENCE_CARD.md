# ⚡ 30-MINUTE DEPLOYMENT QUICK CARD

Print this or bookmark it! Follow these exact steps.

---

## 📋 STEP 1: GitHub (5 min)

**Open PowerShell and run:**

```powershell
cd E:\CyberSafe1

git config --global user.email "YOUR@EMAIL.COM"
git config --global user.name "Your Name"

git init
git add .
git commit -m "Initial CyberSafe deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/CyberSafe.git
git push -u origin main
```

**Replace**:
- `YOUR@EMAIL.COM` with your email
- `Your Name` with your name
- `YOUR-USERNAME` with GitHub username

**Check**: Go to `https://github.com/YOUR-USERNAME/CyberSafe` ✅

---

## 📋 STEP 2: MongoDB Atlas (10 min)

1. Go to: https://www.mongodb.com/cloud/atlas
2. **Create free account** (use GitHub account to sign up faster)
3. Click **"Build a Database"** → **M0 Free** tier
4. Choose nearest region
5. Name: `cybersafe`
6. Create cluster (wait 2-3 min)
7. Click **"Database Access"**
8. Click **"Add New Database User"**
   - Username: `cybersafe-admin`
   - Password: Generate (MongoDB gives you one)
   - Role: `Read and write to any database`
9. Click **"Add User"**
10. **COPY AND SAVE THE PASSWORD** ← Important!
11. Click **"Network Access"**
12. Click **"Add IP Address"** → **"Allow Access from Anywhere"**
13. Click **"Databases"** → **"Connect"**
14. Copy connection string
15. Replace `<password>` with actual password
16. Add `/cybersafe` before `?retryWrites`

**Final URL format:**
```
mongodb+srv://cybersafe-admin:YOUR-PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
```

**Save this!** ⬅️

---

## 📋 STEP 3: Backend Deploy (5 min)

1. Go to: https://vercel.com/signup → **"Continue with GitHub"**
2. Go to: https://vercel.com/dashboard
3. Click **"Add New Project"**
4. Select `CyberSafe` repository
5. **Framework Preset**: None
6. **Root Directory**: `backend`
7. Click **"Continue"**
8. Click **"Environment Variables"** and add:

```
MONGODB_URI = mongodb+srv://cybersafe-admin:PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority

JWT_SECRET = db45c8d4-f0ed-4e2c-b7ad-71bbc0eaa9a1

ML_SERVICE_URL = http://localhost:8004

GEMINI_API_KEY = AIzaSyA594Wk24v32DNQmXqwVqRHt_mD3CjQqAg
```

9. Click **"Deploy"**
10. Wait for green checkmark ✅
11. **Copy backend URL**:
```
https://cybersafe-backend-xxxxx.vercel.app
```

**Save this!** ⬅️

---

## 📋 STEP 4: Frontend Deploy (5 min)

1. Go to: https://vercel.com/dashboard
2. Click **"Add New Project"** again
3. Select `CyberSafe` (again)
4. **Framework**: `Vite`
5. **Root Directory**: `frontend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Click **"Continue"**
9. Click **"Environment Variables"** and add:

```
VITE_API_URL = https://cybersafe-backend-xxxxx.vercel.app
```

(Use the URL from Step 3)

10. Click **"Deploy"**
11. Wait for green checkmark ✅
12. **Copy frontend URL**:
```
https://cybersafe-frontend-xxxxx.vercel.app
```

---

## 📋 STEP 5: Test (5 min)

1. Open: `https://cybersafe-frontend-xxxxx.vercel.app`
2. Click **"Sign Up"**
3. Enter email and password
4. Click **"Register"**
5. Should work! ✅
6. Try to **Login**
7. Should see dashboard! ✅

---

## ✅ DONE! Your App is Live!

| Component | URL |
|-----------|-----|
| **Code** | https://github.com/YOUR-USERNAME/CyberSafe |
| **Frontend** | https://cybersafe-frontend-xxxxx.vercel.app |
| **Backend** | https://cybersafe-backend-xxxxx.vercel.app |
| **Database** | MongoDB Atlas (cloud) |

---

## 🔄 How to Update

```powershell
cd E:\CyberSafe1
git add .
git commit -m "Your changes here"
git push origin main
```

Vercel redeploys automatically in 1-2 minutes! ✨

---

## ⚠️ If Something Breaks

### Cannot connect to API:
- Check `VITE_API_URL` in Vercel frontend settings
- Check backend URL is correct

### MongoDB connection error:
- Check password in MongoDB connection string
- Check `0.0.0.0/0` is allowed in Network Access

### Deployment failed:
- Check Vercel logs (click deployment → scroll down)
- Fix the error shown
- Redeploy

### More issues:
→ See: TROUBLESHOOTING.md

---

## 📚 Full Guides

Want more details?
- **Quick Overview**: START_HERE_DEPLOYMENT.md
- **Detailed Guide**: DEPLOYMENT_GUIDE_BEGINNER.md
- **Problem Solving**: TROUBLESHOOTING.md
- **Architecture**: ARCHITECTURE_DIAGRAM.md
- **Index of All Docs**: DEPLOYMENT_INDEX.md

---

## ✨ Key Points

✅ **Your app is on the INTERNET**
✅ **Anyone can access it**
✅ **Users MUST login to see exams**
✅ **All data is SAFE** (encrypted)
✅ **Everything is FREE** (until you scale)
✅ **You're a web developer!** 🚀

---

**Print this! Reference while deploying!**

⏱️ **Total Time: ~30 minutes**
