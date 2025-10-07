import { api } from './axios'

export const ownersAPI = {
  // Get all owners with pagination and filters
  getOwners: async (params = {}) => {
    const response = await api.get('/owners', { params })
    return response.data
  },

  // Get a specific owner by NIC
  getOwner: async (nic) => {
    const response = await api.get(`/owners/${nic}`)
    return response.data
  },

  // Create a new owner
  createOwner: async (data) => {
    const response = await api.post('/owners', data)
    return response.data
  },

  // Update an owner
  updateOwner: async (nic, data) => {
    const response = await api.put(`/owners/${nic}`, data)
    return response.data
  },

  // Delete an owner
  deleteOwner: async (nic) => {
    const response = await api.delete(`/owners/${nic}`)
    return response.data
  },

  // Get owner statistics
  getOwnerStats: async (nic) => {
    const response = await api.get(`/owners/${nic}/stats`)
    return response.data
  },

  // Get owner's booking history
  getOwnerBookings: async (nic, params = {}) => {
    const response = await api.get(`/owners/${nic}/bookings`, { params })
    return response.data
  },

  // Verify owner NIC
  verifyOwner: async (nic) => {
    const response = await api.get(`/owners/${nic}/verify`)
    return response.data
  },

  // Get owner's vehicle information
  getOwnerVehicle: async (nic) => {
    const response = await api.get(`/owners/${nic}/vehicle`)
    return response.data
  },

  // Update owner's vehicle information
  updateOwnerVehicle: async (nic, data) => {
    const response = await api.put(`/owners/${nic}/vehicle`, data)
    return response.data
  }
}
