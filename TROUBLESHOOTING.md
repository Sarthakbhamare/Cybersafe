# 🆘 Deployment Troubleshooting Guide

---

## 🔴 Common Issues & Solutions

---

## Issue 1: "Git not found" or Git commands don't work

### Symptoms:
```
'git' is not recognized as an internal or external command
```

### Solution:
1. Install Git from: https://git-scm.com/download/win
2. Use installer defaults
3. **Restart PowerShell** (close and open new window)
4. Try `git --version` again

---

## Issue 2: "fatal: not a git repository"

### Symptoms:
```
fatal: not a git repository (or any of the parent directories): .git
```

### Solution:
```powershell
cd E:\CyberSafe1
git init
```

Then continue with:
```powershell
git add .
git commit -m "Initial commit"
```

---

## Issue 3: "Permission denied" on GitHub push

### Symptoms:
```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

### Solution:

**Option A: Use HTTPS instead of SSH**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/CyberSafe.git
git push -u origin main
# GitHub will ask for username/password
```

**Option B: Use Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Check **"repo"** permission
4. Copy token (save it!)
5. When GitHub asks for password, paste the token

---

## Issue 4: "error: src refspec main does not exist"

### Symptoms:
```
error: src refspec main does not exist
fatal: 'origin' does not appear to be a 'git' repository
```

### Solution:
```powershell
# Create first commit
git add .
git commit -m "Initial commit"

# Create main branch
git branch -M main

# Then push
git push -u origin main
```

---

## Issue 5: Vercel deployment fails

### Symptoms:
```
Deployment failed
```

### Solution:

1. **Check the error log on Vercel**:
   - Go to Vercel dashboard
   - Click on failed deployment
   - Scroll down to see error message

2. **Common reasons**:

**Error: "Cannot find module 'express'"**
- Make sure `npm install` works locally: 
  ```
  cd backend
  npm install
  ```
- Check `package.json` exists

**Error: "server.js not found"**
- Make sure `Root Directory` is set to `backend` in Vercel

**Error: "ENOENT: no such file or directory"**
- Check `.env` variables are set in Vercel (not needed for build)

---

## Issue 6: Frontend cannot connect to backend

### Symptoms:
- Login page appears
- Try to register
- Get error like "Network error" or "Cannot reach server"

### Solution:

**Step 1: Check VITE_API_URL**
1. Go to Vercel → Frontend project
2. Settings → Environment Variables
3. Make sure `VITE_API_URL` = your backend URL
4. Redeploy frontend

**Step 2: Check backend is running**
1. Open backend URL in browser (e.g., `https://cybersafe-backend-xxxxx.vercel.app`)
2. Should not show 404 error
3. If it does, check Vercel logs

**Step 3: Check CORS on backend**
Your `backend/server.js` should have:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cybersafe-frontend-xxxxx.vercel.app'  // Your frontend URL
  ],
  credentials: true
}));
```

If CORS is wrong, requests will be blocked.

---

## Issue 7: MongoDB connection error

### Symptoms:
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
or
```
Can't resolve DNS
```

### Solution:

**If using MongoDB Atlas (cloud):**

1. **Check connection string** in Vercel environment:
   ```
   mongodb+srv://cybersafe-admin:PASSWORD@cybersafe.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
   ```
   - Replace `PASSWORD` with actual password
   - Make sure no typos in cluster name

2. **Check IP whitelist**:
   - Go to MongoDB Atlas
   - Network Access
   - Should have `0.0.0.0/0` (allow all)
   - If not, add it

3. **Check database user credentials**:
   - Go to MongoDB Atlas
   - Database Access
   - Username should be `cybersafe-admin`
   - Make sure user exists and password is correct

4. **Check password special characters**:
   - If password has `@`, `#`, `%`, etc., you might need to encode it
   - Use this tool: https://www.urlencoder.org/

---

## Issue 8: Login fails but no error message

### Symptoms:
- Try to login
- Page doesn't show error
- Page doesn't navigate to dashboard

### Solution:

**Step 1: Check backend logs**
1. Go to Vercel backend project
2. Click on deployment
3. Look for error messages

**Step 2: Open browser console**
1. Press `F12` in browser
2. Go to **Console** tab
3. Try to login
4. See what error appears

**Step 3: Check network request**
1. Press `F12` in browser
2. Go to **Network** tab
3. Try to login
4. Look for requests to `/api/auth/login`
5. Click it and see response

---

## Issue 9: "Cannot find module" error

### Symptoms:
```
Cannot find module 'express'
Cannot find module 'mongoose'
```

### Solution:

**Step 1: Install dependencies locally**
```powershell
cd E:\CyberSafe1\backend
npm install
npm list  # shows what's installed
```

**Step 2: Push to GitHub**
```powershell
git add .
git commit -m "Add node_modules"  # DON'T do this
```

**Actually, DON'T commit node_modules!** Instead:

1. Check `.gitignore` has `node_modules/`
2. Vercel will run `npm install` automatically

**Step 3: On Vercel**
1. Go to settings
2. Build Command: `npm install && npm run build` (if needed)
3. Redeploy

---

## Issue 10: Frontend shows blank page

### Symptoms:
- Frontend URL loads
- Page is completely blank
- No error message

### Solution:

**Step 1: Check browser console**
1. Press `F12`
2. Go to **Console** tab
3. See any red errors?

**Step 2: Check Vercel build logs**
1. Go to Vercel frontend project
2. Click last deployment
3. Scroll down for build errors

**Step 3: Check index.html**
Make sure `frontend/index.html` has:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CyberSafe</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Issue 11: Changes not reflected after push

### Symptoms:
- Pushed to GitHub
- App still shows old version
- Waited 10 minutes but no change

### Solution:

**Step 1: Force Vercel to redeploy**
1. Go to Vercel dashboard
2. Click on the project
3. Click **"Redeploy"** button
4. Select latest commit
5. Click **"Redeploy"** again

**Step 2: Clear browser cache**
1. Press `Ctrl + Shift + Delete`
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"
5. Reload page

**Step 3: Check deployment status**
1. Go to Vercel deployments tab
2. Make sure latest deployment says "Ready"
3. If it says "Failed", click it to see error

---

## Issue 12: ML Model not working

### Symptoms:
- Feature that uses ML returns error
- Error message says "Cannot reach ML service"

### Solution:

**Option 1: Run ML service locally**
```powershell
cd E:\CyberSafe1\Model
python predict.py
```

Backend must connect to `http://localhost:8004`

**Option 2: Disable ML for now**
Edit `backend/server.js` to not call ML service until you deploy it

**Option 3: Deploy ML service** (advanced)
See: [DEPLOYMENT_GUIDE_BEGINNER.md](DEPLOYMENT_GUIDE_BEGINNER.md#part-7-ml-model-deployment-optional)

---

## Issue 13: "Vercel free tier limit exceeded"

### Symptoms:
- Deployment fails
- Message about tier limits

### Solution:

You likely have too many serverless functions or too much data.

**To fix:**
1. Upgrade to Hobby plan ($5/month) - https://vercel.com/dashboard/settings/team/billing
2. Or delete old deployments to free up space

---

## Issue 14: "CORS error" in browser console

### Symptoms:
```
Access to XMLHttpRequest at 'https://backend.com' from origin 'https://frontend.com' has been blocked by CORS policy
```

### Solution:

Edit `backend/server.js`:

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://cybersafe-frontend-xxxxx.vercel.app'  // ADD YOUR FRONTEND URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Then:
```powershell
git add .
git commit -m "Fix CORS for production"
git push origin main
```

---

## Issue 15: Database shows no users after registration

### Symptoms:
- Registration appears to work
- But user is not in MongoDB
- Login doesn't work

### Solution:

**Step 1: Check MongoDB connection**
- Check connection string is correct
- Check IP whitelist allows all

**Step 2: Check user collection**
1. Go to MongoDB Atlas
2. Click your cluster
3. Click **"Browse Collections"**
4. Look for `users` collection
5. Should have documents in it

**Step 3: Check registration code**
Your `backend/controller/authController.js` should create users.

If users aren't being saved, check:
- User.create() is being called
- No errors are being thrown
- Response is sent back

---

## 🚑 Still Stuck?

### Getting Help:

1. **Check Vercel Logs**:
   - Vercel dashboard → Project → Latest deployment → Logs

2. **Check MongoDB Atlas**:
   - MongoDB dashboard → Activity tab → See what failed

3. **Check Network tab** (F12):
   - See actual error response from server

4. **Search the error**:
   - Copy exact error message
   - Paste into Google
   - Usually Stack Overflow has answer

5. **Ask for help**:
   - Include: error message, what you did, where it failed
   - Include: link to your GitHub repo

---

## 📋 Quick Debug Checklist

When something breaks:

1. [ ] Check Vercel deployment logs
2. [ ] Check browser console (F12)
3. [ ] Check network requests (F12 Network tab)
4. [ ] Check MongoDB data
5. [ ] Try reloading page (Ctrl+F5)
6. [ ] Try different browser
7. [ ] Check GitHub repo has latest code
8. [ ] Try manual Vercel redeploy
9. [ ] Check environment variables are set correctly
10. [ ] Check error isn't a typo in code

---

**Most problems are:**
- ✅ Wrong environment variables
- ✅ CORS misconfiguration
- ✅ MongoDB connection string
- ✅ Deployment not complete yet

**Give Vercel 2-3 minutes to fully deploy!**
