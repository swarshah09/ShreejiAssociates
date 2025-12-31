# Shree Ji Associates - Real Estate Platform

A premium real estate website with interactive plot mapping system.

## Project Structure

```
ShreeJi Associates/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API services
│   │   └── ...
│   └── package.json
│
└── backend/           # Express + MongoDB backend
    ├── src/
    │   ├── models/    # MongoDB models
    │   ├── routes/    # API routes
    │   ├── controllers/
    │   └── server.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the required environment variables (see `backend/.env.example` for template):
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ENQUIRY_EMAIL_RECIPIENT=recipient@example.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

**Note:** See `DEPLOYMENT_CHECKLIST.md` for detailed environment variable setup instructions.

5. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas cloud database
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Features

### For Users
- Browse projects
- View interactive site maps
- Click plots to see details
- Search plots by number

### For Admins
- Login to admin panel
- Manage projects
- **Configure plot maps (Grid Mode or Manual Mode)** - Admin only
- Upload Excel data for plots
- All configurations saved to database
- **Plot configuration tool is only accessible to logged-in admins**

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Plot Configurations
- `GET /api/plot-configurations/:projectId` - Get plot configuration
- `POST /api/plot-configurations/:projectId` - Save plot configuration
- `PUT /api/plot-configurations/:projectId` - Update plot configuration
- `DELETE /api/plot-configurations/:projectId` - Delete plot configuration

## Database Models

### Project
- Basic project information
- Facilities, advantages
- Image URLs
- Excel data URL

### PlotConfiguration
- Project reference
- Image URL and dimensions
- Array of plot areas with coordinates
- Timestamps and update tracking

## Admin Workflow

1. Login at `/admin/login` (Admin authentication required)
2. Go to Projects tab
3. Click "Setup Plot Configuration" button on any project detail page
4. Use Grid Mode or Manual Mode to create plots
5. Plots are automatically saved to MongoDB database
6. **All users can immediately see the configured plots** (read-only access)
7. Only admins can modify or delete plot configurations

## Access Control

- **Admin-Only**: Plot configuration tool, saving/updating/deleting plot configurations
- **Public Access**: Viewing configured plots, viewing project details
- **Database**: All plot configurations stored in MongoDB `PlotConfiguration` collection
- **API Security**: POST/PUT/DELETE endpoints protected with authentication middleware

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose

## Development

Run both frontend and backend:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Production Build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

