# AI Polygon Detection Service

FastAPI service for automatic plot detection from site layout images using computer vision and OCR.

## Features

- Automatic polygon detection from plot layout images
- OCR-based plot number extraction
- Returns detected plots in format compatible with frontend

## Setup

### Prerequisites

- Python 3.9+
- Tesseract OCR installed on system

### Install Tesseract

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### Install Dependencies

```bash
cd ai-polygon-service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run Locally

```bash
python main.py
```

Service runs on `http://localhost:8080`

## API Endpoints

### Health Check
```
GET /health
```

### Detect Plots
```
POST /detect-plots
Content-Type: multipart/form-data
Body: file (image file)
```

**Response:**
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
        {"x": 200, "y": 200},
        {"x": 100, "y": 200}
      ]
    }
  ]
}
```

## Deployment

This service needs to be deployed separately from the main backend. See deployment options below.

