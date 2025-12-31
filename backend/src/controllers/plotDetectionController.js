// URL of the Python AI service
const PYTHON_SERVICE_URL = process.env.PLOT_DETECTOR_URL || 'http://127.0.0.1:8080/detect-plots';

// Normalize Python response into frontend PlotShape format
const mapDetectedPlotsToShapes = (plots) => {
  return plots.map((plot) => {
    const points = [];
    for (const p of plot.polygon) {
      points.push(p.x);
      points.push(p.y);
    }

    return {
      id: plot.id,
      plotNumber: plot.plotNumber,
      status: plot.status || 'AVAILABLE',
      points,
    };
  });
};

export const detectPlotsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Use field name "file".',
      });
    }

    // Use native FormData (Node.js 18+) which works better with fetch
    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/png' });
    form.append('file', blob, req.file.originalname || 'layout.png');

    console.log(`Calling Python service at ${PYTHON_SERVICE_URL}...`);
    console.log(`File size: ${req.file.buffer.length} bytes, Content-Type: ${req.file.mimetype}`);
    
    const response = await fetch(PYTHON_SERVICE_URL, {
      method: 'POST',
      body: form,
      // Don't set Content-Type header - fetch will set it automatically with boundary
    });

    console.log(`Python service responded with status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error('Plot detection service error:', text);
      return res.status(502).json({
        success: false,
        message: 'Plot detection service failed',
        error: text || `HTTP ${response.status}`,
        pythonServiceUrl: PYTHON_SERVICE_URL,
      });
    }

    const data = await response.json();
    const shapes = mapDetectedPlotsToShapes(data.plots || []);

    return res.json({
      success: true,
      message: 'Plot shapes detected successfully',
      projectId,
      width: data.width,
      height: data.height,
      plots: shapes,
    });
  } catch (error) {
    console.error('Error detecting plots for project:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error detecting plot shapes',
      error: error.message,
      pythonServiceUrl: PYTHON_SERVICE_URL,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};


