import jwt from 'jsonwebtoken';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validate admin credentials
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if admin credentials are configured
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('Admin credentials not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Admin authentication not configured. Please contact administrator.'
      });
    }

    // Verify credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          email: ADMIN_EMAIL,
          role: 'admin',
          type: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            email: ADMIN_EMAIL,
            name: 'Admin User',
            role: 'admin'
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify admin token
export const verifyAdmin = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin role required'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            email: decoded.email,
            role: decoded.role
          }
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

