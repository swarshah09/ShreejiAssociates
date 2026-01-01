# AI Polygon Service Deployment Guide

This Python FastAPI service needs to be deployed separately from the main backend.

## Quick Links

- **Docker Deployment to Render:** See `RENDER_DOCKER_DEPLOYMENT.md` (Recommended)
- **Test Locally:** See `TEST_LOCALLY.md`

## Deployment Options

### Option 1: Render with Docker (Recommended - See RENDER_DOCKER_DEPLOYMENT.md)

1. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name:** `ai-polygon-service` (or your preferred name)
   - **Environment:** `Python 3`
   - **Root Directory:** `ai-polygon-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables:**
   ```env
   PORT=10000
   ```

4. **Note:** Render free tier may have limitations with system dependencies like Tesseract OCR. You may need to use a Dockerfile.

### Option 2: Railway

1. **Create New Project on Railway**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure:**
   - **Root Directory:** `ai-polygon-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables:**
   - Railway automatically sets `PORT`

### Option 3: Docker (Recommended for Production)

Create a `Dockerfile` in `ai-polygon-service/`:

```dockerfile
FROM python:3.11-slim

# Install system dependencies including Tesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Then deploy to:
- **Render** (with Dockerfile)
- **Railway** (with Dockerfile)
- **Google Cloud Run**
- **AWS ECS/Fargate**
- **DigitalOcean App Platform**

### Option 4: Google Cloud Run

1. Create `Dockerfile` (see above)
2. Build and deploy:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/ai-polygon-service
   gcloud run deploy ai-polygon-service --image gcr.io/PROJECT_ID/ai-polygon-service --platform managed
   ```

## Update Backend Configuration

After deploying the AI service, update your backend environment variable:

**In Render (Backend Service):**
```env
PLOT_DETECTOR_URL=https://your-ai-service-url.onrender.com/detect-plots
```

Or for other platforms:
```env
PLOT_DETECTOR_URL=https://your-ai-service-domain.com/detect-plots
```

## Testing

1. Test health endpoint:
   ```bash
   curl https://your-ai-service-url.com/health
   ```

2. Test plot detection:
   ```bash
   curl -X POST https://your-ai-service-url.com/detect-plots \
     -F "file=@path/to/layout-image.png"
   ```

## Important Notes

- **Tesseract OCR** must be installed on the deployment environment
- For Docker deployments, include Tesseract in the Dockerfile
- The service should be accessible from your backend (CORS is configured)
- Update `PLOT_DETECTOR_URL` in backend environment variables after deployment

