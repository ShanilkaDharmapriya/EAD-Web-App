# EV Charging Station Booking System

A full-stack web application for managing EV charging station bookings, built with React + Vite frontend and .NET 8 Web API backend with MongoDB.

## Project Structure

```
EAD/
├── frontend/              # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # Layout components
│   │   ├── pages/         # Page components
│   │   ├── lib/          # API configuration
│   │   └── ...
│   └── README.md
├── server/                # Backend (.NET 8 Web API)
│   └── EvCharging.Api/
│       ├── Controllers/   # API Controllers
│       ├── Domain/        # Domain models
│       ├── Infrastructure/ # MongoDB setup
│       └── README.md
└── README.md             # This file
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- .NET 8 SDK
- MongoDB

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend Setup
```bash
cd server/EvCharging.Api
dotnet restore
dotnet run
```

## Features (Scaffold Only)

### Frontend
- ✅ React + Vite + Tailwind CSS
- ✅ React Router for navigation
- ✅ Responsive layout with sidebar
- ✅ Placeholder pages (Dashboard, Owners, Stations, Bookings, Login)
- ✅ Axios API configuration
- ✅ Environment variable support

### Backend
- ✅ .NET 8 Web API
- ✅ MongoDB integration
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Swagger documentation (Development)
- ✅ Environment variable support

## API Endpoints

- `GET /api/health` - Health check

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5189/api
```

### Backend (appsettings.json)
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "EvChargingDb"
  },
  "AllowedCorsOrigins": ["http://localhost:5173"]
}
```

## Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5189/api
- Swagger UI: http://localhost:5189/swagger (Development only)

## Next Steps

This is a scaffold-only implementation. Future development will include:
- User authentication and authorization
- CRUD operations for Owners, Stations, and Bookings
- Business logic implementation
- Database schema design
- API endpoints for all features
