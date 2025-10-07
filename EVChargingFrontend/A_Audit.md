# Project A Frontend Audit Report

## Tech Stack & Project Meta

### Framework & Tooling
- **Framework**: React 19.1.1 with Vite 7.1.7
- **Language**: JavaScript (ES6+ modules)
- **Package Manager**: npm
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS 4.1.14 with PostCSS
- **Linting**: ESLint 9.36.0 with React hooks plugin

### Key Dependencies
- **UI Framework**: Headless UI 2.2.9 (modals, dropdowns)
- **Icons**: Heroicons 2.2.0
- **Forms**: React Hook Form 7.63.0 + Zod 4.1.11 validation
- **Data Fetching**: TanStack React Query 5.90.2
- **HTTP Client**: Axios 1.12.2
- **Routing**: React Router DOM 7.9.3
- **Date Handling**: Day.js 1.11.18
- **State Management**: React Context + useReducer

### Development Tools
- **TypeScript**: @types/react, @types/react-dom (for type checking)
- **CSS Processing**: PostCSS with Autoprefixer
- **ESLint Plugins**: React hooks, React refresh

## Repository Structure

```
src/
├── api/                    # API layer
│   ├── auth.js            # Authentication endpoints
│   ├── axios.js           # Axios configuration
│   ├── bookings.js        # Booking management
│   ├── owners.js          # EV owner management
│   ├── stations.js        # Station management
│   └── users.js           # User management
├── app/                   # Application state
│   ├── queryClient.js     # React Query configuration
│   └── store.jsx          # Auth context & reducer
├── components/            # Reusable components
│   ├── Layout/           # Layout components
│   │   ├── AppShell.jsx  # Main app layout
│   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   └── Topbar.jsx    # Top navigation bar
│   └── UI/               # UI components
│       ├── Badge.jsx     # Status badges
│       ├── Button.jsx    # Button component
│       ├── Card.jsx      # Card container
│       ├── Input.jsx     # Form inputs
│       ├── Modal.jsx     # Modal dialogs
│       ├── Table.jsx     # Data tables
│       └── Toast.jsx     # Toast notifications
├── features/             # Feature modules
│   ├── auth/            # Authentication
│   ├── bookings/        # Booking management
│   ├── owners/          # EV owner management
│   ├── stations/        # Station management
│   └── users/           # User management
├── hooks/               # Custom hooks
│   └── useToast.js      # Toast notification hook
├── pages/               # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   └── NotFound.jsx    # 404 page
├── routes/              # Routing configuration
│   └── AppRoutes.jsx   # Route definitions
├── styles/              # Global styles
│   └── index.css       # Tailwind + custom styles
└── utils/               # Utility functions
    └── cn.js           # Class name utility
```

## Dependencies & Scripts

### Production Dependencies
- `@headlessui/react@^2.2.9` - Unstyled UI components
- `@heroicons/react@^2.2.0` - Icon library
- `@hookform/resolvers@^5.2.2` - Form validation resolvers
- `@tanstack/react-query@^5.90.2` - Data fetching & caching
- `axios@^1.12.2` - HTTP client
- `dayjs@^1.11.18` - Date manipulation
- `react@^19.1.1` - React framework
- `react-dom@^19.1.1` - React DOM
- `react-hook-form@^7.63.0` - Form handling
- `react-router-dom@^7.9.3` - Client-side routing
- `zod@^4.1.11` - Schema validation

### Development Dependencies
- `@eslint/js@^9.36.0` - ESLint core
- `@tailwindcss/postcss@^4.1.14` - Tailwind PostCSS plugin
- `@types/react@^19.1.13` - React TypeScript types
- `@types/react-dom@^19.1.9` - React DOM TypeScript types
- `@vitejs/plugin-react@^5.0.3` - Vite React plugin
- `autoprefixer@^10.4.21` - CSS vendor prefixes
- `eslint@^9.36.0` - JavaScript linter
- `eslint-plugin-react-hooks@^5.2.0` - React hooks linting
- `eslint-plugin-react-refresh@^0.4.20` - React refresh linting
- `globals@^16.4.0` - Global variables
- `postcss@^8.5.6` - CSS processor
- `tailwindcss@^4.1.14` - Utility-first CSS framework
- `vite@^7.1.7` - Build tool

### Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Design System & Styles

### Color Palette
- **Primary**: Blue scale (50-900) - #eff6ff to #1e3a8a
- **Success**: Green scale (50-900) - #f0fdf4 to #14532d
- **Warning**: Yellow scale (50-900) - #fffbeb to #78350f
- **Danger**: Red scale (50-900) - #fef2f2 to #7f1d1d

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Base Styles**: Applied via Tailwind's base layer
- **Text Colors**: Gray scale (50-900)

### Component Classes
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`
- **Forms**: `.input`, `.input-error`, `.label`, `.error-text`
- **Layout**: `.card` (white background, rounded corners, shadow)
- **Status**: `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

### Spacing & Layout
- **Container**: Max width with responsive padding
- **Grid**: CSS Grid and Flexbox for layouts
- **Spacing**: Tailwind's spacing scale (4, 8, 16, 24, 32px)

## State Management & Data

### State Management
- **Auth State**: React Context + useReducer
- **Global State**: React Query for server state
- **Local State**: useState for component state

### Data Fetching
- **Library**: TanStack React Query v5
- **Configuration**: 5-minute stale time, no retry on failure
- **Caching**: Automatic background refetching
- **Mutations**: Optimistic updates with cache invalidation

### API Layer
- **Base URL**: Configurable via VITE_API_BASE_URL
- **Interceptors**: Automatic token injection, 401 error handling
- **Error Handling**: Centralized error responses
- **Endpoints**: RESTful API with consistent patterns

## Authentication & Authorization

### Auth Flow
1. **Login**: POST /api/auth/login with credentials
2. **Token Storage**: localStorage for token and user data
3. **Auto-login**: Token validation on app load
4. **Logout**: Clear localStorage and redirect to login

### Role-Based Access
- **Backoffice**: Full system access (users, owners, stations, bookings)
- **StationOperator**: Limited access (stations, bookings)
- **EV Owner**: Owner dashboard and booking management

### Route Protection
- **ProtectedRoute**: Requires authentication
- **RoleGuard**: Role-based route access
- **Auto-redirect**: Unauthorized users redirected to login

## Environment & Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:5189)

### Build Configuration
- **Vite**: React plugin, port 3000, auto-open browser
- **Tailwind**: Content paths for all JS/JSX files
- **PostCSS**: Tailwind and Autoprefixer plugins
- **ESLint**: React hooks rules, browser globals

## Tooling

### Development
- **Hot Reload**: Vite's HMR for instant updates
- **Linting**: ESLint with React-specific rules
- **Formatting**: Prettier integration (via ESLint)

### Build Process
- **Bundling**: Vite with ES modules
- **Optimization**: Tree shaking, code splitting
- **Assets**: Static asset handling

## Assets & Icons

### Icons
- **Library**: Heroicons (outline variants)
- **Usage**: Tree-shaken imports from @heroicons/react/24/outline
- **Components**: Used in navigation, buttons, and status indicators

### Images
- **Handling**: Static assets in public/ directory
- **Optimization**: Vite's asset pipeline

## Conventions

### File Naming
- **Components**: PascalCase (Button.jsx, UserForm.jsx)
- **Hooks**: camelCase with 'use' prefix (useAuth, useToast)
- **Utilities**: camelCase (cn.js)
- **Pages**: PascalCase (Dashboard.jsx, LoginPage.jsx)

### Code Organization
- **Feature-based**: Grouped by domain (auth, bookings, stations)
- **Component Structure**: Layout + UI components separation
- **API Layer**: Centralized API functions by resource

### State Management Patterns
- **Context**: Global auth state
- **React Query**: Server state management
- **Local State**: Component-specific state

### Form Handling
- **Validation**: Zod schemas with React Hook Form
- **Error Display**: Consistent error messaging
- **Submission**: Optimistic updates with rollback

## TODO Items

### Missing Implementations
- **Testing**: No test files found (TODO: Add Jest/Vitest setup)
- **Error Boundaries**: No error boundary components (TODO: Add error handling)
- **Loading States**: Some components lack loading indicators (TODO: Add skeleton loaders)
- **Accessibility**: Limited ARIA attributes (TODO: Improve a11y)
- **PWA**: No service worker or manifest (TODO: Add PWA capabilities)

### Potential Improvements
- **TypeScript**: Consider migrating to TypeScript for better type safety
- **Storybook**: Add component documentation and testing
- **Performance**: Add React.memo for expensive components
- **Security**: Add CSRF protection and input sanitization
