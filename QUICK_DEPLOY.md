# Quick Deployment Checklist

Use this as a quick reference while deploying.

## 🔵 Backend (Render) - Environment Variables

Copy these to Render → Environment Variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_uri
ADMIN_EMAIL=admin@sja2024.com
ADMIN_PASSWORD=ShreeJi@2024#Secure
JWT_SECRET=your_secure_jwt_secret_32_chars_min
EMAIL_USER=sswar3939@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ENQUIRY_EMAIL_RECIPIENT=sswar3939@gmail.com
FRONTEND_URL=https://your-frontend.vercel.app
PLOT_DETECTOR_URL=https://your-ai-service.onrender.com/detect-plots (optional)
```

**Render Settings:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

---

## 🟢 Frontend (Vercel) - Environment Variable

Copy this to Vercel → Environment Variables:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Vercel Settings:**
- Root Directory: `frontend`
- Framework: Vite (auto-detected)
- Build Command: `npm run build` (auto-detected)

---

## 📝 Deployment Order

1. ✅ Deploy backend to Render
2. ✅ Note backend URL (e.g., `https://shreeji-backend.onrender.com`)
3. ✅ Deploy frontend to Vercel with `VITE_API_URL` = backend URL + `/api`
4. ✅ Note frontend URL (e.g., `https://shreeji-associates.vercel.app`)
5. ✅ Update backend `FRONTEND_URL` in Render with frontend URL
6. ⚠️ **Optional:** Deploy AI polygon service (if using automatic plot detection)
7. ✅ Test deployment

### AI Polygon Service (Optional)

If you use automatic plot detection:
- Deploy `ai-polygon-service` to Render (or Railway, Google Cloud Run, etc.)
- Add `PLOT_DETECTOR_URL` to backend environment variables
- See `ai-polygon-service/DEPLOYMENT.md` for details

**Note:** You can skip this if you only use manual plot configuration.

---

## ✅ Post-Deployment Tests

- [ ] Backend health: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Admin login works
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors
- [ ] Enquiry form works

---

**Need detailed steps?** See `DEPLOYMENT_GUIDE.md`

