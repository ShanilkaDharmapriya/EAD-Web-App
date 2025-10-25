import api from './axios'

export const bookingsAPI = {
  // Get all bookings (for Backoffice/StationOperator)
  getBookings: async (params = {}) => {
    const response = await api.get('/api/booking', { params })
    return response.data
  },

  // Get booking by ID
  getBooking: async (id) => {
    const response = await api.get(`/api/booking/${id}`)
    return response.data
  },

  // Get owner's bookings
  getOwnerBookings: async (nic, params = {}) => {
    const response = await api.get(`/api/booking/owner/${nic}`, { params })
    return response.data
  },

  // Get dashboard stats for owner
  getOwnerDashboard: async (nic) => {
    const response = await api.get(`/api/booking/dashboard/${nic}`)
    return response.data
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/api/booking', bookingData)
    return response.data
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/api/booking/${id}`, bookingData)
    return response.data
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await api.delete(`/api/booking/${id}`)
    return response.data
  },

  // Approve booking
  approveBooking: async (id) => {
    const response = await api.post(`/api/booking/${id}/approve`)
    return response.data
  },

  // Complete booking via QR
  completeBooking: async (qrPayload) => {
    const response = await api.post('/api/booking/complete', { qrPayload })
    return response.data
  },

  // Debug authentication
  debugAuth: async () => {
    const response = await api.get('/api/booking/debug-auth')
    return response.data
  },

  // Test booking creation
  testBooking: async () => {
    const response = await api.post('/api/booking/test-booking')
    return response.data
  },

  // Get available time slots for a station
  getAvailableSlots: async (stationId, date) => {
    const response = await api.get(`/api/booking/availability/${stationId}?date=${date}`)
    return response.data
  },
}
