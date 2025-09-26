# EV Charging Station Booking System - Frontend

A React + Vite frontend application for the EV Charging Station Booking System with Tailwind CSS.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Configuration

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5189/api
   ```

## Running the Application

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── layout/          # Layout components (Navbar, Sidebar, Shell)
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── Owners.jsx
│   ├── Stations.jsx
│   ├── Bookings.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
├── lib/
│   └── api.js          # Axios configuration
├── App.jsx             # Main app with routing
└── main.jsx           # Application entry point
```

## Features

- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS for modern UI
- **API Integration**: Axios configured for backend communication
- **Layout**: Responsive layout with sidebar navigation
- **Environment Variables**: Configurable API endpoints

## Available Pages

- `/` - Dashboard (with layout)
- `/owners` - Owners management (with layout)
- `/stations` - Stations management (with layout)
- `/bookings` - Bookings management (with layout)
- `/login` - Login page (without layout)
- `/*` - 404 Not Found page

## Development Notes

- All API calls use the configured base URL from environment variables
- The application is configured for SPA hosting with `public/_redirects`
- Tailwind CSS is configured to scan all JS/JSX files