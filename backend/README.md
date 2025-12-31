# Backend API - Shree Ji Associates

Express.js backend with MongoDB for storing project and plot configuration data.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure your `.env` file with required environment variables:
```bash
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

**⚠️  IMPORTANT:** Never commit `.env` files to version control. All credentials must be set via environment variables.

3. Start MongoDB:
```bash
# Local MongoDB
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

4. Run the server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Plot Configurations
- `GET /api/plot-configurations/:projectId` - Get plot config
- `POST /api/plot-configurations/:projectId` - Save plot config
- `PUT /api/plot-configurations/:projectId` - Update plot config
- `DELETE /api/plot-configurations/:projectId` - Delete plot config

## Database Schema

### Project Model
```javascript
{
  name: String,
  location: String,
  status: String, // 'upcoming', 'present', 'past'
  type: String,
  units: Number,
  image: String,
  map: String, // Site layout plan URL
  excelUrl: String,
  facilities: [String],
  advantages: [String],
  plots: Map // Static plot data
}
```

### PlotConfiguration Model
```javascript
{
  projectId: ObjectId,
  imageUrl: String,
  imageDimensions: { width, height },
  plotAreas: [{
    id: String,
    plotNumber: String,
    coordinates: [[Number]], // Polygon coordinates
    status: String,
    area: String,
    dimensions: String,
    direction: String,
    type: String,
    price: String,
    negotiable: String
  }]
}
```

## Example API Calls

### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shree Residency",
    "location": "Rajkot, Gujarat",
    "status": "present",
    "type": "3BHK & 4BHK",
    "units": 120,
    "image": "https://example.com/image.jpg",
    "map": "https://example.com/map.png"
  }'
```

### Save Plot Configuration
```bash
curl -X POST http://localhost:5000/api/plot-configurations/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/map.png",
    "imageDimensions": { "width": 1000, "height": 800 },
    "plotAreas": [
      {
        "id": "plot-01",
        "plotNumber": "01",
        "coordinates": [[100, 100], [200, 100], [200, 200], [100, 200]],
        "status": "Available"
      }
    ]
  }'
```

