# Project Structure

## Overview

This project consists of three main components:

1. **Frontend** - React + TypeScript (Vite)
2. **Backend** - Node.js + Express + MongoDB
3. **AI Polygon Service** - Python FastAPI (optional, for automatic plot detection)

---

## Directory Structure

```
ShreeJi Associates/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── server.js     # Main server file
│   └── package.json
│
├── ai-polygon-service/   # Python AI service (optional)
│   ├── main.py          # FastAPI application
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Docker configuration
│   └── README.md        # Service documentation
│
├── render.yaml          # Render deployment config
├── README.md            # Main documentation
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
└── ENVIRONMENT_VARIABLES.md # Environment variables guide
```

---

## Component Details

### Frontend (`frontend/`)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Backend (`backend/`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Deployment:** Render

### AI Polygon Service (`ai-polygon-service/`)
- **Framework:** FastAPI (Python)
- **Purpose:** Automatic plot detection from images
- **Deployment:** Render, Railway, or Google Cloud Run
- **Note:** Optional - only needed if using automatic plot detection feature

---

## Deployment Architecture

```
┌─────────────────┐
│   Vercel        │  Frontend (React)
│   (Frontend)    │  → Calls Backend API
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Render        │  Backend (Node.js)
│   (Backend)     │  → Calls AI Service (if needed)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Render/Other   │  AI Polygon Service (Python)
│   (AI Service)  │  → Optional, for plot detection
└─────────────────┘
```

---

## Services Communication

1. **Frontend → Backend:** REST API calls
2. **Backend → AI Service:** HTTP requests for plot detection (optional)
3. **Backend → MongoDB:** Database operations
4. **Backend → Email Service:** Nodemailer for enquiry emails

---

## Key Features

- **Public Website:** Browse projects, view plot maps
- **Admin Panel:** Manage projects, configure plots
- **Enquiry System:** Contact form with email notifications
- **Plot Detection:** Automatic or manual plot configuration
- **Interactive Maps:** Clickable plot areas with details

