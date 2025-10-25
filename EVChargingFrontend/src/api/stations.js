import api from './axios'

export const stationsAPI = {
  // Get all active stations
  getStations: async (params = {}) => {
    const response = await api.get('/api/ChargingStation', { params })
    return response.data
  },

  // Get station by ID
  getStation: async (id) => {
    const response = await api.get(`/api/ChargingStation/${id}`)
    return response.data
  },

  // Get nearby stations
  getNearbyStations: async (lat, lng) => {
    const response = await api.get('/api/ChargingStation/nearby', {
      params: { lat, lng }
    })
    return response.data
  },

  // Create new station (Backoffice only)
  createStation: async (stationData) => {
    const response = await api.post('/api/ChargingStation', stationData)
    return response.data
  },

  // Update station
  updateStation: async (id, stationData) => {
    const response = await api.put(`/api/ChargingStation/${id}`, stationData)
    return response.data
  },

  // Get station schedule (read-only)
  getStationSchedule: async (id) => {
    const response = await api.get(`/api/ChargingStation/${id}/schedule`)
    return response.data
  },

  // Update station schedule
  updateStationSchedule: async (id, scheduleData) => {
    const response = await api.put(`/api/ChargingStation/${id}/schedule`, scheduleData)
    return response.data
  },

  // Deactivate station (soft delete - sets isActive to false)
  deactivateStation: async (id) => {
    try {
      const response = await api.patch(`/api/ChargingStation/${id}/deactivate`)
      return response.data
    } catch (error) {
      // Re-throw the error with additional context
      error.operation = 'deactivate'
      throw error
    }
  },

  // Activate station
  activateStation: async (id) => {
    const response = await api.post(`/api/ChargingStation/${id}/activate`)
    return response.data
  },

  // Permanently delete station (Backoffice only)
  deleteStation: async (id) => {
    try {
      const response = await api.delete(`/api/ChargingStation/${id}`)
      return response.data
    } catch (error) {
      // Re-throw the error with additional context
      error.operation = 'delete'
      throw error
    }
  },

  // Get station utilization data
  getStationUtilization: async (id) => {
    const response = await api.get(`/api/ChargingStation/${id}/utilization`)
    return response.data
  },

  // Get station availability data
  getStationAvailability: async (id, startDate, days = 7) => {
    const response = await api.get(`/api/StationAvailability/${id}/availability`, {
      params: { start: startDate, days }
    })
    return response.data
  },

  // Get station schedule overrides
  getStationOverrides: async (id, startDate, days = 7) => {
    const response = await api.get(`/api/StationAvailability/${id}/schedule/overrides`, {
      params: { start: startDate, days }
    })
    return response.data
  },

  // Create schedule override
  createScheduleOverride: async (id, overrideData) => {
    const response = await api.post(`/api/StationAvailability/${id}/schedule/overrides`, overrideData)
    return response.data
  },
}
