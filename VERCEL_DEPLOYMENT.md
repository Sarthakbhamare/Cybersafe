# Vercel Backend Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register

---

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Cluster** (if not already done):
   - Go to: https://cloud.mongodb.com
   - Click **"Build a Database"** → Select **Free (M0)** tier
   - Choose a cloud provider and region (closest to you)
   - Cluster name: `cybersafe-cluster`
   - Click **"Create"**

2. **Create Database User**:
   - Go to **Database Access** (left sidebar)
   - Click **"Add New Database User"**
   - Username: `cybersafe-admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **"Read and write to any database"**
   - Click **"Add User"**

3. **Whitelist All IPs** (for serverless):
   - Go to **Network Access** (left sidebar)
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0` (auto-filled)
   - Click **"Confirm"**

4. **Get Connection String**:
   - Go to **Database** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://cybersafe-admin:<password>@cybersafe-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: change `/?retryWrites` to `/cybersafe?retryWrites`
   - **Final format**:
     ```
     mongodb+srv://cybersafe-admin:YOUR_PASSWORD@cybersafe-cluster.xxxxx.mongodb.net/cybersafe?retryWrites=true&w=majority
     ```

---

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```
   Follow the prompts to authenticate (opens browser).

3. **Deploy Backend**:
   ```powershell
   cd E:\CyberSafe1\backend
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `cybersafe-backend` (or your choice)
   - In which directory is your code? **./backend** (or just press Enter if already in backend folder)
   - Want to override settings? **N**

5. **Add Environment Variables**:
   ```powershell
   vercel env add MONGODB_URI
   ```
   - Paste your MongoDB connection string
   - Environment: Select **Production, Preview, Development** (all)

   ```powershell
   vercel env add JWT_SECRET
   ```
   - Enter a random secure string (e.g., `your-super-secret-jwt-key-change-this`)
   - Environment: Select **Production, Preview, Development** (all)

   ```powershell
   vercel env add CLIENT_URL
   ```
   - Enter: `https://sarthakbhamare.github.io`
   - Environment: Select **Production, Preview, Development** (all)

6. **Redeploy with Environment Variables**:
   ```powershell
   vercel --prod
   ```

7. **Get Your Backend URL**:
   - After deployment completes, you'll see:
     ```
     ✅  Production: https://cybersafe-backend-xxxxx.vercel.app
     ```
   - Copy this URL!

---

### Option B: Vercel Dashboard (Web Interface)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/new
   - Click **"Add New..."** → **"Project"**

2. **Import Git Repository**:
   - Click **"Import"** next to your GitHub repository `Sarthakbhamare/Cybersafe`
   - If not listed, click **"Adjust GitHub App Permissions"** to grant access

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: Click **"Edit"** → Select `backend`
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables** (click "Environment Variables"):
   - **MONGODB_URI**: Your MongoDB connection string
   - **JWT_SECRET**: A secure random string
   - **CLIENT_URL**: `https://sarthakbhamare.github.io`
   - **NODE_ENV**: `production`

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 1-2 minutes for deployment to complete

6. **Get Your Backend URL**:
   - After deployment, you'll see your project dashboard
   - Copy the **Production URL** (e.g., `https://cybersafe-backend.vercel.app`)

---

## Step 3: Update Frontend with Backend URL

1. **Add Backend URL as GitHub Secret**:
   - Go to: `https://github.com/Sarthakbhamare/Cybersafe/settings/secrets/actions`
   - Click **"New repository secret"**
   - Name: `VITE_API_URL`
   - Value: Your Vercel backend URL (e.g., `https://cybersafe-backend-xxxxx.vercel.app`)
   - Click **"Add secret"**

2. **Trigger Redeploy**:
   - Make a small change (or just push):
     ```powershell
     cd E:\CyberSafe1
     git commit --allow-empty -m "Trigger redeploy with backend URL"
     git push origin main
     ```
   - GitHub Actions will rebuild with the new backend URL

3. **Wait for Deployment**:
   - Go to: `https://github.com/Sarthakbhamare/Cybersafe/actions`
   - Wait for the workflow to complete (~2-3 minutes)

---

## Step 4: Test Your Deployment

1. **Visit Your Site**:
   - Frontend: `https://sarthakbhamare.github.io/Cybersafe/`
   - Backend API: `https://your-backend.vercel.app/health`

2. **Test Signup**:
   - Go to: `https://sarthakbhamare.github.io/Cybersafe/signup`
   - Create a test account
   - Should work without "Failed to connect" error

3. **Test Login**:
   - Go to: `https://sarthakbhamare.github.io/Cybersafe/login`
   - Login with your test account
   - Should redirect to dashboard

---

## 🔧 Troubleshooting

### "Failed to connect to server"
**Issue**: Frontend can't reach backend
**Solutions**:
1. Check backend is live: Visit `https://your-backend.vercel.app/health`
2. Verify `VITE_API_URL` secret is set in GitHub
3. Check CORS settings in `backend/server.js` allow your frontend URL
4. Redeploy frontend after adding secret

### "MongooseError: Connection failed"
**Issue**: Backend can't connect to MongoDB
**Solutions**:
1. Verify `MONGODB_URI` in Vercel environment variables
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Verify database user password is correct in connection string
4. Check cluster is active in MongoDB Atlas dashboard

### "Cannot find module"
**Issue**: Missing dependencies
**Solutions**:
1. Run in backend folder:
   ```powershell
   cd backend
   npm install
   vercel --prod
   ```

### CORS Errors
**Issue**: Browser blocks requests
**Solutions**:
1. Add frontend URL to Vercel environment:
   ```powershell
   vercel env add CLIENT_URL
   # Value: https://sarthakbhamare.github.io
   ```
2. Redeploy:
   ```powershell
   vercel --prod
   ```

---

## 📊 Vercel Dashboard

Monitor your backend:
- **Deployments**: https://vercel.com/dashboard
- **Logs**: Click your project → **"Logs"** tab (real-time)
- **Environment Variables**: Project → **"Settings"** → **"Environment Variables"**

---

## 💰 Cost

**Vercel Free Tier**:
- ✅ 100 GB bandwidth/month
- ✅ 100 hours serverless execution/month
- ✅ Unlimited deployments
- ✅ Free SSL certificates

**MongoDB Atlas Free Tier**:
- ✅ 512 MB storage
- ✅ Shared cluster (M0)
- ✅ Unlimited connections

**Total Cost**: **$0/month** 🎉

---

## 🚀 Quick Commands Reference

```powershell
# Deploy backend
cd E:\CyberSafe1\backend
vercel --prod

# View logs
vercel logs https://your-backend.vercel.app

# List deployments
vercel ls

# Remove deployment
vercel rm cybersafe-backend

# Add environment variable
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CLIENT_URL
```

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created and database user configured
- [ ] Network access allows `0.0.0.0/0`
- [ ] MongoDB connection string obtained
- [ ] Vercel CLI installed and logged in
- [ ] Backend deployed to Vercel
- [ ] Environment variables added (MONGODB_URI, JWT_SECRET, CLIENT_URL)
- [ ] Backend URL obtained
- [ ] `VITE_API_URL` secret added to GitHub
- [ ] Frontend redeployed with backend URL
- [ ] Signup/Login tested successfully

---

**Next Steps**: Your full-stack CyberSafe application is now live! 🎉
- Frontend: `https://sarthakbhamare.github.io/Cybersafe/`
- Backend: `https://your-backend.vercel.app`
