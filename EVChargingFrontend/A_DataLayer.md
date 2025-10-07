# Data Layer & API Documentation

## API Configuration

### Base Configuration
- **Base URL**: `http://localhost:5189` (configurable via `VITE_API_BASE_URL`)
- **Content Type**: `application/json`
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Automatic 401 redirect to login

### Axios Interceptors

#### Request Interceptor
```javascript
// Automatically adds Bearer token to all requests
config.headers.Authorization = `Bearer ${token}`
```

#### Response Interceptor
```javascript
// Handles 401 errors by clearing auth and redirecting to login
if (error.response?.status === 401) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}
```

## API Endpoints

### Authentication Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/api/auth/login` | User login | `{username, password}` | `{success, data: {token, role, userId, nic}}` |
| POST | `/api/auth/register` | EV owner registration | `{nic, name, email, phone}` | `{success, data: {user}}` |
| POST | `/api/auth/refresh` | Token refresh | `{}` | `{success, data: {token}}` |

### User Management Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/user` | Get users (paginated) | Query: `{page, size, search}` | `{success, data: {items, totalCount, totalPages}}` |
| GET | `/api/user/{id}` | Get user by ID | - | `{success, data: {user}}` |
| POST | `/api/user` | Create user | `{username, password, role}` | `{success, data: {user}}` |
| PUT | `/api/user/{id}` | Update user | `{username, password, role}` | `{success, data: {user}}` |
| DELETE | `/api/user/{id}` | Delete user | - | `{success, message}` |

### EV Owner Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/evowner` | Get EV owners (paginated) | Query: `{page, size, search}` | `{success, data: {items, totalCount, totalPages}}` |
| GET | `/api/evowner/{nic}` | Get owner by NIC | - | `{success, data: {owner}}` |
| POST | `/api/evowner` | Create EV owner | `{nic, name, email, phone, address}` | `{success, data: {owner}}` |
| PUT | `/api/evowner/{nic}` | Update EV owner | `{name, email, phone, address}` | `{success, data: {owner}}` |
| POST | `/api/evowner/{nic}/deactivate` | Deactivate owner | - | `{success, message}` |
| POST | `/api/evowner/{nic}/reactivate` | Reactivate owner | - | `{success, message}` |

### Station Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/station` | Get all stations | Query: `{lat, lng}` (optional) | `{success, data: [{station}]}` |
| GET | `/api/station/{id}` | Get station by ID | - | `{success, data: {station}}` |
| GET | `/api/station/nearby` | Get nearby stations | Query: `{lat, lng}` | `{success, data: [{station}]}` |
| POST | `/api/station` | Create station | `{name, type, totalSlots, location: {lat, lng, address}}` | `{success, data: {station}}` |
| PUT | `/api/station/{id}` | Update station | `{name, type, totalSlots, location}` | `{success, data: {station}}` |
| PUT | `/api/station/{id}/schedule` | Update station schedule | `{schedule: [{day, startTime, endTime}]}` | `{success, data: {station}}` |
| DELETE | `/api/station/{id}` | Deactivate station | - | `{success, message}` |

### Booking Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/booking/{id}` | Get booking by ID | - | `{success, data: {booking}}` |
| GET | `/api/booking/owner/{nic}` | Get owner's bookings | Query: `{page, size}` | `{success, data: {items, totalCount}}` |
| GET | `/api/booking/dashboard/{nic}` | Get owner dashboard stats | - | `{success, data: {stats}}` |
| POST | `/api/booking` | Create booking | `{stationId, reservationDateTime, duration}` | `{success, data: {booking}}` |
| PUT | `/api/booking/{id}` | Update booking | `{reservationDateTime, duration}` | `{success, data: {booking}}` |
| DELETE | `/api/booking/{id}` | Cancel booking | - | `{success, message}` |
| POST | `/api/booking/{id}/approve` | Approve booking | - | `{success, data: {booking}}` |
| POST | `/api/booking/complete` | Complete booking via QR | `{qrPayload}` | `{success, data: {booking}}` |

## Data Models

### User Model
```javascript
{
  id: string,
  username: string,
  role: 'Backoffice' | 'StationOperator',
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### EV Owner Model
```javascript
{
  nic: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Station Model
```javascript
{
  id: string,
  name: string,
  type: 'AC' | 'DC',
  totalSlots: number,
  availableSlots: number,
  location: {
    latitude: number,
    longitude: number,
    address: string
  },
  schedule: [{
    day: string,
    startTime: string,
    endTime: string
  }],
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Booking Model
```javascript
{
  id: string,
  stationId: string,
  stationName: string,
  ownerNic: string,
  reservationDateTime: string,
  duration: number,
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled',
  qrCode: string,
  createdAt: string,
  updatedAt: string
}
```

## React Query Configuration

### Query Client Setup
```javascript
{
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    },
    mutations: {
      retry: false
    }
  }
}
```

### Query Keys
- `['users', { page, size, search }]` - User list queries
- `['owners', { page, size, search }]` - Owner list queries
- `['stations']` - Station list queries
- `['bookings', { page, size }]` - Booking list queries
- `['booking', id]` - Individual booking queries

### Mutation Patterns
- **Optimistic Updates**: Cache invalidation after successful mutations
- **Error Handling**: Toast notifications for success/error states
- **Loading States**: Button loading indicators during mutations

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (redirect to login)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (business logic errors)
- **500**: Internal Server Error

### Error Response Format
```javascript
{
  success: false,
  message: string,
  errors?: [{
    field: string,
    message: string
  }]
}
```

### Client-Side Error Handling
- **Network Errors**: Retry mechanisms and offline detection
- **Validation Errors**: Field-level error display
- **Business Logic Errors**: User-friendly error messages
- **Authentication Errors**: Automatic logout and redirect

## Caching Strategy

### Query Caching
- **Stale Time**: 5 minutes for most queries
- **Cache Time**: Default React Query cache time
- **Background Refetch**: Enabled for active queries
- **Cache Invalidation**: After mutations

### Data Freshness
- **Real-time Updates**: Manual refetch on user actions
- **Optimistic Updates**: Immediate UI updates with rollback
- **Cache Invalidation**: Targeted invalidation by query key

## Performance Optimizations

### Request Optimization
- **Pagination**: Server-side pagination for large datasets
- **Filtering**: Server-side search and filtering
- **Debouncing**: Search input debouncing
- **Lazy Loading**: Component-level code splitting

### Caching Optimizations
- **Query Deduplication**: Automatic request deduplication
- **Background Updates**: Silent data refreshing
- **Optimistic Updates**: Immediate UI feedback
- **Cache Persistence**: Local storage for critical data
