import jwt from 'jsonwebtoken';

// Authentication middleware for admin-only routes
// Protects POST/PUT/DELETE endpoints for plot configurations

export const requireAdmin = (req, res, next) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin access required. Please login as admin.'
    });
  }

  // Extract token
  const token = authHeader.replace('Bearer ', '');
  
  // Verify JWT token
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin role required'
      });
    }
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    // Handle legacy token format for backward compatibility during migration
    if (token === 'admin-authenticated' && process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Using legacy authentication token. Please update frontend to use JWT.');
      next();
      return;
    }
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

// Optional: Public access for viewing (GET requests don't need this)
export const optionalAuth = (req, res, next) => {
  // Allow public access, but extract user info if token exists
  next();
};
