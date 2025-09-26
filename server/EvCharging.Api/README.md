# EV Charging Station Booking System - Backend API

A .NET 8 Web API backend for the EV Charging Station Booking System with MongoDB integration.

## Prerequisites

- .NET 8 SDK
- MongoDB (running on localhost:27017 by default)

## Configuration

The application uses environment variables and configuration files:

### appsettings.json
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "EvChargingDb"
  },
  "AllowedCorsOrigins": [
    "http://localhost:5173"
  ]
}
```

### Environment Variables
You can override configuration using environment variables:
- `MongoDb__ConnectionString`
- `MongoDb__DatabaseName`
- `AllowedCorsOrigins__0`, `AllowedCorsOrigins__1`, etc.

## Running the API

1. Ensure MongoDB is running on your system
2. Navigate to the project directory:
   ```bash
   cd server/EvCharging.Api
   ```
3. Restore dependencies:
   ```bash
   dotnet restore
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger` (Development only)

## API Endpoints

### Health Check
- `GET /api/health` - Returns API status and timestamp

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:5173` (Vite development server)

## Project Structure

```
EvCharging.Api/
├── Controllers/          # API Controllers
├── Domain/Models/        # Domain models (placeholder)
├── Application/Services/ # Application services (empty)
├── Infrastructure/       # MongoDB configuration
├── Program.cs           # Application entry point
└── appsettings.json    # Configuration
```

## Development Notes

- MongoDB connection is configured via `MongoSettings`
- CORS is enabled for frontend communication
- Swagger is available in Development environment
- All endpoints are prefixed with `/api`


