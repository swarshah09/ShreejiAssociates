import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import projectRoutes from './routes/projectRoutes.js';
import plotDetectionRoutes from './routes/plotDetectionRoutes.js';
import plotShapeRoutes from './routes/plotShapeRoutes.js';
import imageUploadRoutes from './routes/imageUploadRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
// CORS configuration - restrict to frontend URL in production
const corsOptions = {
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
  credentials: true,
  optionsSuccessStatus: 200
};

// In production, require FRONTEND_URL to be set
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('⚠️  WARNING: FRONTEND_URL not set in production. CORS may be restricted.');
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for large images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for large images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/plot-detection', plotDetectionRoutes);
app.use('/api/plot-shapes', plotShapeRoutes);
app.use('/api/images', imageUploadRoutes);
app.use('/api/enquiry', enquiryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  } else {
    console.log(`📡 API available at /api`);
    console.log(`🏥 Health check: /api/health`);
  }
});

