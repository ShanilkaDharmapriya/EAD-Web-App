import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../app/store.jsx'
import { queryClient } from '../app/queryClient'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import RoleGuard from '../features/auth/RoleGuard'
import AppShell from '../components/Layout/AppShell'
import LoginPage from '../features/auth/LoginPage'
import Dashboard from '../pages/Dashboard'
import UsersList from '../features/users/UsersList'
import OwnersList from '../features/owners/OwnersList'
import OwnerDetails from '../features/owners/OwnerDetails'
import OwnerForm from '../features/owners/OwnerForm'
import StationsList from '../features/stations/StationsList'
import StationForm from '../features/stations/StationForm'
import StationScheduleEditor from '../features/stations/StationScheduleEditor'
import BookingsList from '../features/bookings/BookingsList'
import BookingDetails from '../features/bookings/BookingDetails'
import BookingForm from '../features/bookings/BookingForm'
import OwnerDashboard from '../features/bookings/OwnerDashboard'
import NotFound from '../pages/NotFound'

const AppRoutes = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Backoffice only routes */}
              <Route path="users" element={
                <RoleGuard allowedRoles={['Backoffice']}>
                  <UsersList />
                </RoleGuard>
              } />
              
              {/* All authenticated users can access these */}
              <Route path="owners" element={<OwnersList />} />
              <Route path="owners/new" element={<OwnerForm />} />
              <Route path="owners/:nic" element={<OwnerDetails />} />
              <Route path="owners/:nic/edit" element={<OwnerForm />} />
              <Route path="stations" element={<StationsList />} />
              <Route path="stations/new" element={<StationForm />} />
              <Route path="stations/:id/edit" element={<StationForm />} />
              <Route path="stations/:id/schedule" element={<StationScheduleEditor />} />
              <Route path="bookings" element={<BookingsList />} />
              <Route path="bookings/new" element={<BookingForm />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              <Route path="owner-dashboard" element={<OwnerDashboard />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default AppRoutes
