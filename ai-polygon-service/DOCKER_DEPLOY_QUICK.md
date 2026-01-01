# Quick Guide: Deploy AI Service to Render with Docker

## TL;DR - Quick Steps

1. **Push code to GitHub** (make sure Dockerfile is committed)

2. **Create Render Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select your repository

3. **Configure Service:**
   - **Name:** `ai-polygon-service`
   - **Environment:** Select **"Docker"** (not Python!)
   - **Root Directory:** `ai-polygon-service`
   - Dockerfile will be auto-detected

4. **Environment Variables:**
   - Add: `PORT=10000` (optional, Render sets this automatically)

5. **Click "Create Web Service"**

6. **Wait for deployment** (3-5 minutes)

7. **Copy service URL** (e.g., `https://ai-polygon-service-xxxx.onrender.com`)

8. **Update Backend:**
   - Go to your backend service on Render
   - Environment → Add: `PLOT_DETECTOR_URL=https://your-ai-service-url.onrender.com/detect-plots`
   - Save (backend will redeploy)

9. **Test:**
   - Health: `https://your-ai-service-url.onrender.com/health`
   - Should return: `{"status": "ok"}`

## That's It! ✅

For detailed instructions, see: `RENDER_DOCKER_DEPLOYMENT.md`

