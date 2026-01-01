# Deployment Guide - Shree Ji Associates

This guide will help you deploy the backend to Render and frontend to Vercel.

## Prerequisites Completed ✅

- ✅ All security fixes applied
- ✅ Environment variables configured
- ✅ CORS properly configured
- ✅ Deployment configuration files created
- ✅ Build scripts verified

---

## Step 1: Prepare Your Repository

### 1.1 Commit All Changes
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Important:** Make sure your `.env` files are NOT committed (they should be in `.gitignore`)

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up or log in (can use GitHub account)

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `ShreeJi Associates`

### 2.3 Configure Backend Service

**Basic Settings:**
- **Name:** `shreeji-backend` (or your preferred name)
- **Environment:** `Node`
- **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Click **"Advanced"** → **"Environment Variables"** and add:

```env
NODE_ENV=production
PORT=10000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Admin Authentication
ADMIN_EMAIL=admin@sja2024.com
ADMIN_PASSWORD=ShreeJi@2024#Secure
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters

# Email Configuration
EMAIL_USER=sswar3939@gmail.com
EMAIL_PASSWORD=your_email_app_password
ENQUIRY_EMAIL_RECIPIENT=sswar3939@gmail.com

# Frontend URL (will get this after deploying frontend)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# AI Polygon Service (optional - add after deploying AI service in Step 6)
PLOT_DETECTOR_URL=https://your-ai-service-url.onrender.com/detect-plots
```

**Important Notes:**
- Generate a strong `JWT_SECRET`: Use a long random string (minimum 32 characters)
- Get MongoDB URI from MongoDB Atlas (if using cloud database)
- Get email app password from Gmail settings

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-3 minutes)
4. Note your backend URL: `https://shreeji-backend.onrender.com` (or your custom domain)

### 2.5 Verify Backend Deployment
1. Open your backend URL: `https://your-backend-name.onrender.com/api/health`
2. Should return: `{"success": true, "message": "Server is running", ...}`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in (can use GitHub account)

### 3.2 Import Project
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository: `ShreeJi Associates`

### 3.3 Configure Frontend Project

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**Environment Variables:**
Click **"Environment Variables"** and add:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** Replace `your-backend-name` with your actual Render backend URL!

### 3.4 Deploy Frontend
1. Click **"Deploy"**
2. Vercel will build and deploy (usually 1-2 minutes)
3. You'll get a URL like: `https://shreeji-associates.vercel.app`

### 3.5 Verify Frontend Deployment
1. Open your Vercel URL
2. Website should load
3. Try accessing `/admin/login`

---

## Step 4: Update Backend CORS with Frontend URL

After deploying frontend, you need to update the backend's `FRONTEND_URL`:

### 4.1 Update Render Environment Variable
1. Go to Render dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Find `FRONTEND_URL` variable
5. Update value to your Vercel URL: `https://your-frontend-domain.vercel.app`
6. Click **"Save Changes"**
7. Render will automatically redeploy

### 4.2 Verify CORS
1. Try accessing your frontend URL
2. Frontend should be able to call backend API
3. Check browser console for any CORS errors

---

## Step 5: Test the Deployment

### 5.1 Test Admin Login
1. Go to: `https://your-frontend.vercel.app/admin/login`
2. Login with:
   - Email: `admin@sja2024.com`
   - Password: `ShreeJi@2024#Secure`
3. Should redirect to admin dashboard

### 5.2 Test Enquiry Form
1. Go to homepage
2. Click "Enquiry" button
3. Fill and submit the form
4. Check if email is received

### 5.3 Test API Endpoints
- Health: `https://your-backend.onrender.com/api/health`
- Projects: `https://your-backend.onrender.com/api/projects`

---

## Step 6: Deploy AI Polygon Service (Optional but Recommended)

The AI polygon detection service is used for automatic plot detection from images. If you use this feature, deploy it separately.

### 6.1 Deploy to Render (Easiest)

1. **Create New Web Service on Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure:**
   - **Name:** `ai-polygon-service`
   - **Environment:** `Docker` (recommended) or `Python 3`
   - **Root Directory:** `ai-polygon-service`
   - **Dockerfile Path:** `ai-polygon-service/Dockerfile` (if using Docker)
   - **Build Command:** `pip install -r requirements.txt` (if Python)
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables:**
   ```env
   PORT=10000
   ```

4. **Note:** The Dockerfile includes Tesseract OCR installation. If using Python directly, you may need to install Tesseract on the system.

5. **Copy the service URL** (e.g., `https://ai-polygon-service.onrender.com`)

### 6.2 Update Backend Configuration

1. Go to your **backend service** on Render
2. Add environment variable:
   ```env
   PLOT_DETECTOR_URL=https://your-ai-service-url.onrender.com/detect-plots
   ```
3. Save and redeploy backend

### 6.3 Alternative: Skip AI Service (Manual Plot Configuration)

If you don't need automatic plot detection, you can skip this step. The admin can still configure plots manually using the Grid Mode or Manual Mode tools in the admin panel.

**See:** `ai-polygon-service/DEPLOYMENT.md` for detailed deployment options.

---

## Step 7: Custom Domains (Optional)

### 6.1 Backend Custom Domain (Render)
1. In Render dashboard → **"Settings"** → **"Custom Domains"**
2. Add your domain
3. Follow DNS configuration instructions

### 6.2 Frontend Custom Domain (Vercel)
1. In Vercel dashboard → **"Settings"** → **"Domains"**
2. Add your domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` in Render backend settings

---

## Troubleshooting

### Backend Issues

**Deployment Fails:**
- Check build logs in Render
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script

**Database Connection Error:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Verify database user credentials

**CORS Errors:**
- Ensure `FRONTEND_URL` matches your Vercel URL exactly
- Check for trailing slashes (should be no trailing slash)
- Restart backend service after updating `FRONTEND_URL`

### Frontend Issues

**Build Fails:**
- Check build logs in Vercel
- Verify `VITE_API_URL` is set correctly
- Ensure all dependencies are in `package.json`

**API Calls Fail:**
- Check `VITE_API_URL` matches backend URL
- Verify backend is running (check health endpoint)
- Check browser console for errors

**404 Errors on Routes:**
- Vercel should automatically handle this with the `vercel.json` configuration
- If issues persist, check `vercel.json` rewrites

---

## Environment Variables Checklist

### Render (Backend) - Required:
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGODB_URI`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`
- [ ] `JWT_SECRET`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `ENQUIRY_EMAIL_RECIPIENT`
- [ ] `FRONTEND_URL` (update after frontend deployment)

### Vercel (Frontend) - Required:
- [ ] `VITE_API_URL` (your Render backend URL + `/api`)

---

## Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] API calls from frontend succeed
- [ ] Enquiry form submits successfully
- [ ] Email notifications work
- [ ] No CORS errors in browser console
- [ ] All routes work (no 404 errors)

---

## Estimated Deployment Time

- Render backend: 5-10 minutes
- Vercel frontend: 3-5 minutes
- Configuration: 5 minutes
- Testing: 5-10 minutes

**Total: ~20-30 minutes**

---

## Support

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Check browser console for frontend errors
4. Test backend endpoints directly using curl or Postman

Good luck with your deployment! 🚀

