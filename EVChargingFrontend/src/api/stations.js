import { api } from './axios'

export const stationsAPI = {
  // Get all stations with pagination and filters
  getStations: async (params = {}) => {
    const response = await api.get('/stations', { params })
    return response.data
  },

  // Get a specific station by ID
  getStation: async (id) => {
    const response = await api.get(`/stations/${id}`)
    return response.data
  },

  // Create a new station
  createStation: async (data) => {
    const response = await api.post('/stations', data)
    return response.data
  },

  // Update a station
  updateStation: async (id, data) => {
    const response = await api.put(`/stations/${id}`, data)
    return response.data
  },

  // Delete a station
  deleteStation: async (id) => {
    const response = await api.delete(`/stations/${id}`)
    return response.data
  },

  // Get station schedules
  getStationSchedules: async (id) => {
    const response = await api.get(`/stations/${id}/schedules`)
    return response.data
  },

  // Create station schedule
  createStationSchedule: async (id, data) => {
    const response = await api.post(`/stations/${id}/schedules`, data)
    return response.data
  },

  // Update station schedule
  updateStationSchedule: async (stationId, scheduleId, data) => {
    const response = await api.put(`/stations/${stationId}/schedules/${scheduleId}`, data)
    return response.data
  },

  // Delete station schedule
  deleteStationSchedule: async (stationId, scheduleId) => {
    const response = await api.delete(`/stations/${stationId}/schedules/${scheduleId}`)
    return response.data
  },

  // Get station bookings
  getStationBookings: async (id, params = {}) => {
    const response = await api.get(`/stations/${id}/bookings`, { params })
    return response.data
  },

  // Get station statistics
  getStationStats: async (id) => {
    const response = await api.get(`/stations/${id}/stats`)
    return response.data
  },

  // Get available time slots for a station
  getAvailableSlots: async (id, date) => {
    const response = await api.get(`/stations/${id}/available-slots`, {
      params: { date }
    })
    return response.data
  },

  // Toggle station status
  toggleStationStatus: async (id) => {
    const response = await api.post(`/stations/${id}/toggle-status`)
    return response.data
  },

  // Get nearby stations
  getNearbyStations: async (latitude, longitude, radius = 10) => {
    const response = await api.get('/stations/nearby', {
      params: { latitude, longitude, radius }
    })
    return response.data
  }
}
