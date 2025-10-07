# Route Map & User Flows

## Route Structure

### Public Routes
| Path | Component | Description | Access |
|------|-----------|-------------|---------|
| `/login` | LoginPage | Authentication page | Public |

### Protected Routes (Requires Authentication)
| Path | Component | Description | Role Required | Layout |
|------|-----------|-------------|---------------|---------|
| `/` | Navigate to `/dashboard` | Root redirect | Any | AppShell |
| `/dashboard` | Dashboard | Main dashboard with stats | Any | AppShell |
| `/users` | UsersList | User management | Backoffice | AppShell |
| `/owners` | OwnersList | EV owner management | Any | AppShell |
| `/owners/:nic` | OwnerDetails | Individual owner details | Any | AppShell |
| `/stations` | StationsList | Charging station management | Any | AppShell |
| `/bookings` | BookingsList | Booking management | Any | AppShell |
| `/bookings/:id` | BookingDetails | Individual booking details | Any | AppShell |
| `/owner-dashboard` | OwnerDashboard | Owner-specific dashboard | Any | AppShell |

### Error Routes
| Path | Component | Description |
|------|-----------|-------------|
| `*` | NotFound | 404 page for unknown routes |

## User Flow Summary

### Authentication Flow
1. **Unauthenticated User** → `/login`
2. **Login Success** → Redirect to intended page or `/dashboard`
3. **Login Failure** → Stay on `/login` with error message
4. **Token Expiry** → Auto-redirect to `/login`

### Role-Based Navigation

#### Backoffice User Flow
1. **Login** → Dashboard (full stats)
2. **Navigation Options**:
   - Users (create, edit, delete users)
   - EV Owners (manage owner accounts)
   - Stations (create, edit, deactivate stations)
   - Bookings (view all bookings)

#### Station Operator Flow
1. **Login** → Dashboard (limited stats)
2. **Navigation Options**:
   - Stations (view and edit stations)
   - Bookings (manage station bookings)

#### EV Owner Flow
1. **Login** → Dashboard (personal stats)
2. **Navigation Options**:
   - Stations (view available stations)
   - Bookings (create and manage bookings)
   - Owner Dashboard (personal analytics)

### Route Guards

#### ProtectedRoute
- **Purpose**: Ensures user is authenticated
- **Behavior**: Redirects to `/login` if not authenticated
- **Loading State**: Shows spinner while checking auth

#### RoleGuard
- **Purpose**: Restricts access based on user role
- **Usage**: Wraps role-specific routes
- **Behavior**: Redirects to `/dashboard` if insufficient permissions

### Navigation Structure

#### Sidebar Navigation (AppShell)
- **Dashboard**: Available to all authenticated users
- **Users**: Backoffice only
- **EV Owners**: All authenticated users
- **Stations**: All authenticated users
- **Bookings**: All authenticated users

#### Topbar Navigation
- **User Menu**: Profile dropdown with logout
- **Notifications**: Bell icon (placeholder)
- **Mobile Menu**: Hamburger menu for mobile

### Route Parameters

#### Dynamic Routes
- `/owners/:nic` - EV owner NIC (National ID Card)
- `/bookings/:id` - Booking ID

#### Query Parameters
- **Pagination**: `page`, `size` for list views
- **Search**: `search` for filtering
- **Location**: `lat`, `lng` for nearby stations

### Route Transitions

#### Navigation Patterns
- **Internal Links**: React Router Link components
- **External Redirects**: window.location.href for auth redirects
- **Programmatic**: useNavigate hook for form submissions

#### State Management
- **Location State**: Pass data between routes
- **URL State**: Query parameters for filters
- **Global State**: React Query cache for data persistence

### Error Handling

#### Route Errors
- **404**: NotFound component for unknown routes
- **Auth Errors**: Redirect to login with error message
- **Permission Errors**: Redirect to dashboard with warning

#### Loading States
- **Route Loading**: Spinner during auth checks
- **Data Loading**: Skeleton loaders for async data
- **Form Loading**: Disabled states during submissions

### Mobile Responsiveness

#### Navigation
- **Desktop**: Full sidebar navigation
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Responsive grid layout

#### Route Accessibility
- **Keyboard Navigation**: Tab order and focus management
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color schemes
