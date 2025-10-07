import { api } from './axios'

export const bookingsAPI = {
  // Get all bookings with pagination and filters
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  // Get a specific booking by ID
  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  // Create a new booking
  createBooking: async (data) => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  // Update a booking
  updateBooking: async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data)
    return response.data
  },

  // Delete a booking
  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },

  // Get bookings for a specific owner
  getOwnerBookings: async (ownerNic, params = {}) => {
    const response = await api.get(`/bookings/owner/${ownerNic}`, { params })
    return response.data
  },

  // Get booking statistics for an owner
  getOwnerStats: async (ownerNic) => {
    const response = await api.get(`/bookings/owner/${ownerNic}/stats`)
    return response.data
  },

  // Get bookings for a specific station
  getStationBookings: async (stationId, params = {}) => {
    const response = await api.get(`/bookings/station/${stationId}`, { params })
    return response.data
  },

  // Get available time slots for a station
  getAvailableSlots: async (stationId, date) => {
    const response = await api.get(`/bookings/station/${stationId}/available-slots`, {
      params: { date }
    })
    return response.data
  },

  // Cancel a booking
  cancelBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason })
    return response.data
  },

  // Complete a booking
  completeBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/complete`)
    return response.data
  }
}
