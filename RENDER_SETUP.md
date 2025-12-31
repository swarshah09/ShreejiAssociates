# Render Backend Deployment - Quick Reference

## Render Configuration

### Service Type
- **Type:** Web Service
- **Environment:** Node

### Build & Start Commands
```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Required Environment Variables

Copy these to Render dashboard → Environment Variables:

```env
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=your_mongodb_connection_string

# Admin Auth
ADMIN_EMAIL=admin@sja2024.com
ADMIN_PASSWORD=ShreeJi@2024#Secure
JWT_SECRET=generate_secure_secret_minimum_32_chars

# Email
EMAIL_USER=sswar3939@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ENQUIRY_EMAIL_RECIPIENT=sswar3939@gmail.com

# CORS (update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Health Check
- **Path:** `/api/health`
- Render will use this to check if your service is running

### Important Notes

1. **Free Tier Limitations:**
   - Service may spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

2. **Port:**
   - Render uses port `10000` by default
   - Backend code uses `process.env.PORT || 5000`, which will use Render's port automatically

3. **Environment Variables:**
   - All secrets must be set in Render dashboard
   - Never commit `.env` files to git
   - Update `FRONTEND_URL` after deploying frontend

4. **Logs:**
   - View logs in Render dashboard → Logs tab
   - Check for any startup errors
   - Verify MongoDB connection success

