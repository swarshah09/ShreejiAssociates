# Vercel Frontend Deployment - Quick Reference

## Vercel Configuration

### Project Settings
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

### Required Environment Variable

Add to Vercel dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** 
- Replace `your-backend-name` with your actual Render backend URL
- Include `/api` at the end
- No trailing slash

### Custom Domain (Optional)
- Go to Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions
- Update `FRONTEND_URL` in Render backend after domain is active

### Important Notes

1. **Build Process:**
   - Vercel automatically detects Vite
   - Builds are fast (usually < 1 minute)
   - Automatic deployments on git push

2. **Environment Variables:**
   - Variables starting with `VITE_` are exposed to frontend
   - Set `VITE_API_URL` to your Render backend URL
   - Changes require redeployment

3. **Routing:**
   - `vercel.json` handles SPA routing
   - All routes redirect to `index.html`
   - Works automatically with React Router

4. **Performance:**
   - Vercel uses CDN for fast global delivery
   - Automatic HTTPS
   - Automatic optimization

### Deployment URLs
- Production: `https://your-project.vercel.app`
- Preview: Each PR gets a preview URL
- Custom Domain: Your configured domain

