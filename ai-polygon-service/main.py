from io import BytesIO
from typing import List, Tuple, Optional
import re

import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class Point(BaseModel):
    x: float
    y: float


class DetectedPlot(BaseModel):
    id: str
    plotNumber: str
    status: str = "AVAILABLE"
    polygon: List[Point]


class DetectResponse(BaseModel):
    width: int
    height: int
    plots: List[DetectedPlot]


app = FastAPI(title="AI Plot Shape Detection Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_image(file_bytes: bytes) -> Tuple[np.ndarray, int, int]:
    """Decode bytes to BGR image and return image with (width, height)."""
    file_array = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(file_array, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    height, width = img.shape[:2]
    return img, width, height


def extract_plot_number(image: np.ndarray, polygon: np.ndarray) -> Optional[str]:
    """
    Extract plot number from the region inside a polygon using OCR.
    
    Args:
        image: Original BGR image
        polygon: Nx2 array of polygon vertices
    
    Returns:
        Detected plot number as string, or None if not found
    """
    try:
        # Get bounding rectangle of the polygon
        x, y, w, h = cv2.boundingRect(polygon.reshape(-1, 1, 2))
        
        # Add padding to ensure we capture text near boundaries
        padding = 10
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(image.shape[1] - x, w + 2 * padding)
        h = min(image.shape[0] - y, h + 2 * padding)
        
        # Extract region of interest
        roi = image[y:y+h, x:x+w]
        
        if roi.size == 0:
            return None
        
        # Convert to grayscale
        gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast for better OCR
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Try OCR with different configurations
        # Configuration for digits and numbers only
        custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=0123456789'
        
        # First try: digits only
        text = pytesseract.image_to_string(thresh, config=custom_config).strip()
        
        # If no digits found, try with default config (all characters)
        if not text:
            text = pytesseract.image_to_string(thresh, config='--oem 3 --psm 7').strip()
        
        # Clean and extract plot number
        # Look for numbers in the text
        numbers = re.findall(r'\d+', text)
        
        if numbers:
            # Return the first number found (usually the plot number)
            # Filter out very large numbers (likely not plot numbers)
            for num in numbers:
                num_int = int(num)
                if 1 <= num_int <= 9999:  # Reasonable plot number range
                    return str(num_int).zfill(3)  # Format as 001, 002, etc.
        
        return None
    except Exception as e:
        # If OCR fails, return None (will use sequential numbering as fallback)
        print(f"OCR error for polygon: {e}")
        return None


def detect_plot_polygons(image: np.ndarray) -> List[np.ndarray]:
    """
    GeeksforGeeks-style shape detection pipeline optimized for plot layout images.
    
    Steps (following GeeksforGeeks methodology):
    1. Convert to grayscale
    2. Bilateral filter (preserves edges while reducing noise)
    3. Canny edge detection
    4. Morphological operations to close gaps
    5. Find contours
    6. Filter by area, aspect ratio, and vertex count
    7. Approximate to polygons
    
    Returns list of polygons as Nx2 arrays of (x, y) points.
    """
    # Step 1: Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Step 2: Bilateral filter - preserves edges better than Gaussian blur
    # This is better for maintaining plot boundaries
    blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Step 3: Canny edge detection
    # Lower thresholds for better detection of faint plot lines
    edges = cv2.Canny(blurred, threshold1=30, threshold2=100, apertureSize=3)
    
    # Step 4: Morphological operations to close gaps in plot boundaries
    # This helps connect broken lines in plot borders
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Optional: Dilate slightly to ensure boundaries are connected
    dilated = cv2.dilate(closed, kernel, iterations=1)
    
    # Step 5: Find contours - use RETR_EXTERNAL to get outer boundaries only
    # Then switch to RETR_TREE if we need nested plots
    contours, hierarchy = cv2.findContours(
        dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    )
    
    polygons: List[np.ndarray] = []
    
    if hierarchy is None or len(contours) == 0:
        return polygons
    
    hierarchy = hierarchy[0]
    img_area = image.shape[0] * image.shape[1]
    
    # Step 6 & 7: Filter and approximate contours
    for idx, contour in enumerate(contours):
        # Calculate contour properties
        area = cv2.contourArea(contour)
        parent_idx = hierarchy[idx][3]
        
        # Filter 1: Skip very small contours (noise)
        min_area = max(500, img_area * 0.001)  # At least 0.1% of image or 500px
        if area < min_area:
            continue
        
        # Filter 2: Skip the outermost boundary (full layout outline)
        if parent_idx == -1 and area > img_area * 0.25:  # More than 25% of image
            continue
        
        # Filter 3: Skip contours that are too elongated (likely roads/lines, not plots)
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w) / h if h > 0 else 0
        if aspect_ratio > 10 or aspect_ratio < 0.1:  # Too elongated
            continue
        
        # Filter 4: Check solidity (how "filled" the contour is)
        # Plots should be relatively solid shapes
        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        if hull_area > 0:
            solidity = float(area) / hull_area
            if solidity < 0.5:  # Too irregular/hollow
                continue
        
        # Step 7: Approximate contour to polygon
        # Use adaptive epsilon based on perimeter
        peri = cv2.arcLength(contour, True)
        epsilon = 0.015 * peri  # Tighter approximation for cleaner polygons
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # Filter 5: Must have at least 3 vertices (triangle minimum)
        # But also filter out overly complex shapes (likely noise)
        if len(approx) < 3 or len(approx) > 20:
            continue
        
        # Convert to Nx2 array
        poly = approx.reshape(-1, 2)
        polygons.append(poly)
    
    # Sort by area (largest first) - helps with plot numbering
    polygons.sort(key=lambda p: cv2.contourArea(p.reshape(-1, 1, 2)), reverse=True)
    
    return polygons


@app.post("/detect-plots", response_model=DetectResponse)
async def detect_plots(file: UploadFile = File(...)) -> DetectResponse:
    """
    Accept a plot layout image (JPG/PNG) and return detected plot polygons.

    Response format is compatible with the frontend PlotShape model:
    - coordinates are in the original image pixel space
    - each polygon is an ordered list of (x, y) vertices
    """
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")

    try:
        contents = await file.read()
        image, width, height = load_image(contents)

        polygons = detect_plot_polygons(image)

        plots: List[DetectedPlot] = []
        detected_numbers = set()  # Track detected numbers to avoid duplicates
        sequential_idx = 1  # Fallback sequential counter
        
        for poly in polygons:
            # Try to detect plot number from the image region
            plot_number = extract_plot_number(image, poly)
            
            # If OCR failed or number already exists, use sequential numbering
            if plot_number is None or plot_number in detected_numbers:
                plot_number = str(sequential_idx).zfill(3)
                sequential_idx += 1
            else:
                detected_numbers.add(plot_number)
                # Update sequential counter to be higher than detected number
                try:
                    num_val = int(plot_number)
                    if num_val >= sequential_idx:
                        sequential_idx = num_val + 1
                except ValueError:
                    sequential_idx += 1
            
            points = [Point(x=float(x), y=float(y)) for x, y in poly]
            plots.append(
                DetectedPlot(
                    id=f"plot-{plot_number}",
                    plotNumber=plot_number,
                    status="AVAILABLE",
                    polygon=points,
                )
            )

        return DetectResponse(width=width, height=height, plots=plots)
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=500, detail=f"Failed to process image: {exc}") from exc


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)


