# Test AI Polygon Service Locally with Docker

Before deploying to Render, you can test the Docker container locally.

## Prerequisites

- Docker installed on your machine
- Test image file (JPG/PNG) for plot detection

## Step 1: Build Docker Image

Navigate to the ai-polygon-service directory:

```bash
cd ai-polygon-service
```

Build the Docker image:

```bash
docker build -t ai-polygon-service .
```

This will:
- Download Python 3.11 base image
- Install Tesseract OCR and dependencies
- Install Python packages
- Copy application code

**Expected time:** 2-3 minutes (first build)

## Step 2: Run Docker Container

Run the container:

```bash
docker run -p 8080:8080 ai-polygon-service
```

The service will start on `http://localhost:8080`

## Step 3: Test Health Endpoint

In another terminal:

```bash
curl http://localhost:8080/health
```

Should return:
```json
{"status": "ok"}
```

## Step 4: Test Plot Detection

Test with an image file:

```bash
curl -X POST http://localhost:8080/detect-plots \
  -F "file=@path/to/your/test-image.png"
```

Replace `path/to/your/test-image.png` with an actual plot layout image.

**Expected response:**
```json
{
  "width": 1200,
  "height": 800,
  "plots": [
    {
      "id": "plot-001",
      "plotNumber": "001",
      "status": "AVAILABLE",
      "polygon": [
        {"x": 100, "y": 100},
        {"x": 200, "y": 100},
        ...
      ]
    }
  ]
}
```

## Step 5: Stop Container

Press `Ctrl+C` in the terminal running the container, or:

```bash
docker ps  # Find container ID
docker stop <container-id>
```

## Troubleshooting

**Error: "Cannot find Dockerfile"**
- Make sure you're in the `ai-polygon-service` directory
- Verify Dockerfile exists: `ls -la Dockerfile`

**Error: "Port already in use"**
- Change port: `docker run -p 8081:8080 ai-polygon-service`
- Or stop other services using port 8080

**Error: "Tesseract not found"**
- This shouldn't happen as Dockerfile installs it
- Verify build completed successfully

**Service starts but requests fail**
- Check container logs: `docker logs <container-id>`
- Verify health endpoint works first

## Next Steps

Once local testing works:
1. Push code to GitHub
2. Deploy to Render using `RENDER_DOCKER_DEPLOYMENT.md` guide
3. Update backend `PLOT_DETECTOR_URL` environment variable

