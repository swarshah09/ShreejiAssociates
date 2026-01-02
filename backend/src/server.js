import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
// Compression middleware - gzip responses for faster transfer
app.use(compression());
// CORS configuration - restrict to frontend URL in production
// Normalize FRONTEND_URL by removing trailing slash
const normalizeOrigin = (url) => {
  if (!url) return null;
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, health checks, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    // Get normalized frontend URL (without trailing slash)
    const allowedOrigin = normalizeOrigin(process.env.FRONTEND_URL);
    
    // In production, require FRONTEND_URL to be set
    if (process.env.NODE_ENV === 'production' && !allowedOrigin) {
      console.warn('⚠️  WARNING: FRONTEND_URL not set in production. CORS may be restricted.');
      return callback(new Error('CORS: FRONTEND_URL not configured'));
    }

    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = normalizeOrigin(origin);

    // Allow request if origins match (handles with/without trailing slash)
    if (normalizedOrigin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed. Expected: ${allowedOrigin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for large images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for large images

// Cache control middleware for API responses
app.use('/api/projects', (req, res, next) => {
  // Cache GET requests for 5 minutes, no cache for POST/PUT/DELETE
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.set('ETag', 'W/"projects"'); // Enable ETag for better caching
  }
  next();
});

// Cache static asset responses (if serving any)
app.use((req, res, next) => {
  // Cache static assets longer
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for static assets
  }
  next();
});

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

