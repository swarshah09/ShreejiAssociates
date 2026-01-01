# Deploy AI Polygon Service to Render Using Docker

This guide will walk you through deploying the AI polygon detection service to Render using Docker.

## Prerequisites

✅ Dockerfile is already created in `ai-polygon-service/Dockerfile`  
✅ All Python dependencies are in `requirements.txt`  
✅ Service code is ready in `main.py`

---

## Step-by-Step Deployment Guide

### Step 1: Verify Dockerfile

The Dockerfile is located at: `ai-polygon-service/Dockerfile`

It includes:
- Python 3.11 base image
- Tesseract OCR installation
- All Python dependencies
- Application code
- Health check endpoint

**You don't need to modify anything - it's ready to use!**

---

### Step 2: Push Code to GitHub

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add AI polygon service Dockerfile"
git push origin main
```

---

### Step 3: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up or log in
3. Click **"Connect Account"** and connect your GitHub account

---

### Step 4: Create New Web Service

1. In Render Dashboard, click **"New +"** button
2. Select **"Web Service"**

---

### Step 5: Connect Repository

1. Select **"Connect a repository"**
2. Find and select your repository: `ShreeJi Associates`
3. Click **"Connect"**

---

### Step 6: Configure Service Settings

Fill in the following settings:

#### Basic Information
- **Name:** `ai-polygon-service` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch:** `main` (or your default branch)

#### Build & Deploy Settings

**Environment:**
- Select **"Docker"** (Important: Not "Python 3")

**Root Directory:**
- Leave **empty** (Render will use the Dockerfile path)

**Dockerfile Path:**
- Enter: `ai-polygon-service/Dockerfile`

**OR** if Render doesn't have a separate Dockerfile path field:
- Set **Root Directory:** `ai-polygon-service`
- Render will automatically detect the Dockerfile in that directory

**Docker Build Context:**
- Leave as `.` (default)

**Docker Command:**
- Leave **empty** (Render uses the CMD from Dockerfile)

#### Advanced Settings

Click **"Advanced"** to add environment variables:

**Environment Variables:**
```env
PORT=10000
```

**Note:** Render will automatically set PORT, but setting it explicitly is good practice.

---

### Step 7: Select Plan

- Choose **"Free"** plan for testing (or paid plan for production)
- **Note:** Free tier may have cold starts (15+ seconds on first request)

---

### Step 8: Create Service

1. Click **"Create Web Service"**
2. Render will start building and deploying

---

### Step 9: Monitor Deployment

1. You'll see the build logs in real-time
2. The build process will:
   - Pull Python 3.11 Docker image
   - Install system dependencies (Tesseract OCR, etc.)
   - Install Python packages
   - Copy application code
   - Start the service

**Expected build time:** 3-5 minutes (first deployment)

---

### Step 10: Get Service URL

Once deployment completes:

1. You'll see: **"Your service is live at: `https://ai-polygon-service.onrender.com`"**
2. **Copy this URL** - you'll need it for the backend configuration

**Note:** Your actual URL will be: `https://ai-polygon-service-XXXX.onrender.com` (XXXX is random)

---

### Step 11: Test the Service

1. **Health Check:**
   Open in browser: `https://your-ai-service-url.onrender.com/health`
   
   Should return:
   ```json
   {"status": "ok"}
   ```

2. **Test Plot Detection (using curl):**
   ```bash
   curl -X POST https://your-ai-service-url.onrender.com/detect-plots \
     -F "file=@path/to/test-image.png"
   ```

---

### Step 12: Update Backend Configuration

1. Go to your **backend service** on Render (the main Node.js service)
2. Navigate to **"Environment"** tab
3. Add new environment variable:

   **Key:** `PLOT_DETECTOR_URL`  
   **Value:** `https://your-ai-service-url.onrender.com/detect-plots`

   **Important:** Include `/detect-plots` at the end!

4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## Verification Checklist

- [ ] Service builds successfully on Render
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Service URL is accessible
- [ ] `PLOT_DETECTOR_URL` added to backend environment variables
- [ ] Backend redeployed with new environment variable
- [ ] Test plot detection from admin panel

---

## Troubleshooting

### Build Fails

**Error: "Cannot find Dockerfile"**
- **Solution:** Check that Dockerfile path is correct
- Try setting Root Directory to `ai-polygon-service`

**Error: "Failed to install Tesseract"**
- **Solution:** Dockerfile already includes Tesseract installation
- Check build logs for specific error

### Service Won't Start

**Error: "Port binding failed"**
- **Solution:** Ensure Dockerfile uses `PORT` environment variable (already configured)
- Render automatically sets PORT, service should use it

**Error: "Health check failed"**
- **Solution:** Check service logs in Render dashboard
- Verify service is listening on correct port
- Test health endpoint manually

### Slow First Request (Free Tier)

**Issue:** First request takes 30-60 seconds
- **Explanation:** Free tier services spin down after 15 minutes of inactivity
- **Solution:** 
  - Acceptable for development/testing
  - Consider paid plan for production
  - Or use Railway/Google Cloud Run (better free tier)

---

## Service URLs Summary

After deployment, you'll have:

1. **AI Service:** `https://ai-polygon-service-XXXX.onrender.com`
2. **Backend Service:** `https://your-backend.onrender.com`
3. **Frontend:** `https://your-frontend.vercel.app`

---

## Next Steps

1. ✅ AI service deployed and tested
2. ✅ Backend updated with `PLOT_DETECTOR_URL`
3. ✅ Test plot detection feature in admin panel
4. ✅ Verify automatic plot detection works

---

## Cost Considerations

**Render Free Tier:**
- ✅ Free forever
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ✅ Good for development/testing

**Render Paid Plans:**
- $7/month per service (Starter)
- Services stay always-on
- Better for production

**Alternative Free Options:**
- **Railway:** Better free tier (no forced spin-down)
- **Google Cloud Run:** Generous free tier
- **Fly.io:** Good free tier

---

## Need Help?

- Check Render logs: Dashboard → Your Service → Logs
- Verify Dockerfile syntax
- Test locally first: `docker build -t ai-service . && docker run -p 8080:8080 ai-service`
- Check service health endpoint

Good luck with your deployment! 🚀

