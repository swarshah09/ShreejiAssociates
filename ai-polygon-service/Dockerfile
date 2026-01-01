FROM python:3.11-slim

# Install system dependencies including Tesseract OCR and curl for health checks
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Expose port
EXPOSE 8080

# Health check (uses PORT env var, defaults to 8080)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD sh -c "curl -f http://localhost:${PORT:-8080}/health || exit 1"

# Run the application
# Use PORT environment variable (Render sets this automatically)
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"

