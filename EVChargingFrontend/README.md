# EV Charging Station Management System - Frontend

A modern React frontend application for managing EV charging station bookings, built with Vite, Tailwind CSS, and React Query.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Create and manage system users (Backoffice, StationOperator)
- **EV Owner Management**: Manage electric vehicle owners and their accounts
- **Station Management**: Create and manage charging stations with scheduling
- **Booking Management**: Create, view, and manage charging station bookings
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Form Validation**: Zod schema validation with react-hook-form
- **Toast Notifications**: User-friendly success/error notifications

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Day.js** - Date manipulation
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5189
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Default Login Credentials

- **Username**: `admin`
- **Password**: `Admin123!`
- **Role**: `Backoffice`

## Project Structure

```
src/
├── api/                    # API layer with Axios configuration
│   ├── axios.js           # Axios instance with interceptors
│   ├── auth.js            # Authentication API calls
│   ├── users.js           # User management API calls
│   ├── owners.js          # EV owner management API calls
│   ├── stations.js        # Station management API calls
│   └── bookings.js        # Booking management API calls
├── app/                   # Application state and configuration
│   ├── queryClient.js     # React Query client configuration
│   └── store.js           # Auth context and state management
├── components/            # Reusable UI components
│   ├── Layout/           # Layout components (AppShell, Sidebar, Topbar)
│   └── UI/               # Basic UI components (Button, Input, Modal, etc.)
├── features/             # Feature-based components
│   ├── auth/             # Authentication components
│   ├── users/            # User management components
│   ├── owners/           # EV owner management components
│   ├── stations/         # Station management components
│   └── bookings/         # Booking management components
├── hooks/                # Custom React hooks
│   └── useToast.js       # Toast notification hook
├── pages/                # Page components
│   ├── Dashboard.jsx     # Main dashboard
│   └── NotFound.jsx      # 404 page
├── routes/               # Routing configuration
│   └── AppRoutes.jsx     # Main routing setup
├── styles/               # Global styles
│   └── index.css         # Tailwind CSS imports and custom styles
├── utils/                # Utility functions
│   └── cn.js             # Class name utility
├── App.jsx               # Main App component
└── main.jsx              # Application entry point
```

## Role-Based Access Control

### Backoffice Role
- Full access to all features
- Can create/edit/delete users
- Can create/edit/delete stations
- Can manage EV owners (create, edit, deactivate, reactivate)
- Cannot approve bookings (only StationOperator can approve)

### StationOperator Role
- Read-only access to users
- Can edit station details and schedules
- Can view and approve bookings
- Cannot perform system admin actions

## API Integration

The frontend integrates with the following backend endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/user` (CRUD operations)
- **EV Owners**: `/api/evowner` (CRUD operations)
- **Stations**: `/api/station` (CRUD operations, scheduling)
- **Bookings**: `/api/booking` (CRUD operations, approval)

## Key Features

### Dashboard
- Role-based statistics and quick actions
- Recent bookings overview
- System status indicators

### User Management (Backoffice only)
- Create system users with roles
- Edit user details and roles
- Deactivate users

### EV Owner Management
- Create and manage EV owner accounts
- Search and filter owners
- Deactivate/reactivate accounts (Backoffice only)

### Station Management
- Create charging stations with location data
- Manage daily schedules
- Deactivate stations (with conflict checking)

### Booking Management
- Create bookings with 7-day window limit
- 12-hour modification rule enforcement
- Status-based filtering and actions
- Role-based approval workflow (StationOperator only)

## Form Validation

All forms use Zod schemas for validation:

- **User Form**: Username (3-50 chars), role selection, password (6+ chars)
- **Owner Form**: NIC (10-12 chars), name, email, phone, password
- **Station Form**: Name, type (AC/DC), slots (1-50), coordinates, address
- **Booking Form**: Station selection, future datetime, 7-day limit

## Error Handling

- Global error handling with Axios interceptors
- 401 errors automatically redirect to login
- Toast notifications for user feedback
- Form validation with inline error messages

## Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Collapsible sidebar on mobile
- Touch-friendly interface elements

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for React and JavaScript
- Consistent component structure
- Custom hooks for reusable logic
- TypeScript-style prop validation with PropTypes

## Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Ensure the backend API is accessible from the frontend domain
4. Update the `VITE_API_BASE_URL` environment variable for production

## Troubleshooting

### Common Issues

1. **API Connection Issues**: Verify the backend is running and `VITE_API_BASE_URL` is correct
2. **Authentication Issues**: Check if JWT token is being stored and sent correctly
3. **CORS Issues**: Ensure the backend allows requests from the frontend domain
4. **Build Issues**: Clear node_modules and reinstall dependencies

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and patterns
2. Use meaningful component and variable names
3. Add proper error handling and loading states
4. Test on multiple screen sizes
5. Follow the established ESLint rules

## License

This project is part of the EV Charging Station Management System.
