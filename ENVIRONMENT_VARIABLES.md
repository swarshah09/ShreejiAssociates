# Environment Variables Configuration

This document lists all required and optional environment variables for the Shree Ji Associates project.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Required Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Email Configuration (for enquiry form)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_or_smtp_password
ENQUIRY_EMAIL_RECIPIENT=recipient@example.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Optional Variables

```env
# SMS Recipients (comma-separated, optional)
ENQUIRY_SMS_RECIPIENTS=+1234567890,+0987654321

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Configuration (alternative to Gmail)
SMTP_HOST=smtp.example.com
SMTP_PORT=587

# AI Polygon Detection Service (optional)
PLOT_DETECTOR_URL=https://your-ai-service-url.com/detect-plots
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## Production Environment Variables

For production deployment, ensure all variables are set with production values:

### Backend Production `.env`

```env
MONGODB_URI=your_production_mongodb_uri
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_production_password
JWT_SECRET=very_long_random_secret_key_minimum_32_characters
EMAIL_USER=your_production_email@yourdomain.com
EMAIL_PASSWORD=your_production_email_password
ENQUIRY_EMAIL_RECIPIENT=enquiries@yourdomain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Production `.env.production`

```env
VITE_API_URL=https://your-backend-api.com/api
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for `ADMIN_PASSWORD` and `JWT_SECRET`
3. **Rotate secrets regularly** in production
4. **Use App Passwords** for Gmail (not your regular password)
5. **Restrict MongoDB access** by IP whitelist in MongoDB Atlas
6. **Use HTTPS** in production for all URLs

## Getting Started

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`

3. For Gmail App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password
   - Use the generated password in `EMAIL_PASSWORD`

4. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Verification

After setting up environment variables, verify:

1. Backend starts without errors
2. MongoDB connection succeeds
3. Admin login works
4. Email sending works (test with enquiry form)

