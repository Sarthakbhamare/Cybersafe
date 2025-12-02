# GitHub Pages Deployment Guide

This guide explains how to deploy the CyberSafe frontend to GitHub Pages using GitHub Actions.

## 🚀 Quick Setup

### 1. Enable GitHub Pages

1. Go to your repository: `https://github.com/Sarthakbhamare/Cybersafe`
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Add API URL Secret (Optional)

If you have a backend API deployed (e.g., on GCP Cloud Run):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_API_URL`
4. Value: Your backend URL (e.g., `https://cybersafe-backend-xxxxx.run.app`)
5. Click **Add secret**

If you skip this, the build will use a placeholder URL.

### 3. Trigger Deployment

The workflow will automatically trigger on every push to `main`. To deploy now:

```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

Or manually trigger from GitHub:
- Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## 📦 What Gets Deployed

- **Built React app** from `frontend/dist/`
- **Static assets** (CSS, JS, images)
- **Optimized production build** with minification and code splitting

## 🔗 Access Your Site

After deployment completes (~2-3 minutes):

**Live URL**: `https://sarthakbhamare.github.io/Cybersafe/`

## ⚙️ Configuration Files

### `.github/workflows/deploy-gh-pages.yml`
- Automated deployment workflow
- Builds frontend on every push to `main`
- Uploads to GitHub Pages

### `frontend/vite.config.js`
- Sets `base: '/Cybersafe/'` for production
- Ensures proper asset paths on GitHub Pages subdirectory

## 🔧 Troubleshooting

### Blank Page After Deployment

**Issue**: Assets not loading (404 errors)
**Solution**: Ensure `vite.config.js` has correct `base` path:
```javascript
base: mode === 'production' ? '/Cybersafe/' : '/'
```

### API Calls Failing

**Issue**: Frontend can't reach backend
**Solution**: 
1. Check `VITE_API_URL` secret is set correctly
2. Ensure backend CORS allows your GitHub Pages domain:
```javascript
// backend/server.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://sarthakbhamare.github.io'
];
```

### Workflow Fails

**Issue**: Build errors in Actions tab
**Solution**:
1. Check the workflow logs in **Actions** tab
2. Common fixes:
   - Missing dependencies: Ensure `frontend/package-lock.json` is committed
   - Build errors: Test locally with `cd frontend && npm run build`

## 🔄 Update Deployment

Every push to `main` branch automatically rebuilds and redeploys. No manual steps needed!

## 📊 Deployment Status

Check deployment status:
- **Actions** tab shows workflow runs
- Green checkmark = Successful deployment
- Red X = Failed (click for logs)

## 🌐 Custom Domain (Optional)

To use a custom domain like `cybersafe.yourdomain.com`:

1. Go to **Settings** → **Pages**
2. Add your custom domain
3. Configure DNS:
   - Add CNAME record: `cybersafe` → `sarthakbhamare.github.io`
4. GitHub will automatically provision SSL certificate

## 🔐 Security Notes

- GitHub Pages serves static files only (no backend)
- API calls go to your separate backend deployment (GCP/Vercel)
- Sensitive credentials should be in backend, not frontend
- All frontend code is publicly visible

## 📈 Monitoring

- **GitHub Actions**: Monitor deployment success/failures
- **GitHub Insights**: Track site traffic and views
- **Browser DevTools**: Debug API calls and console errors

## 💰 Cost

GitHub Pages is **100% FREE** for public repositories:
- Unlimited bandwidth
- Free SSL certificates
- No build limits for public repos

---

**Next Steps After Deployment:**
1. ✅ Frontend live on GitHub Pages
2. 🔄 Deploy backend to GCP Cloud Run (see [DEPLOYMENT.md](../DEPLOYMENT.md))
3. 🔗 Update `VITE_API_URL` secret with backend URL
4. 🔄 Redeploy to connect frontend → backend
