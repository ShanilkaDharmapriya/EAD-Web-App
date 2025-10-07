import api from './axios'

export const ownersAPI = {
  // Get all EV owners (paginated)
  getOwners: async (params = {}) => {
    const response = await api.get('/api/evowner', { params })
    return response.data
  },

  // Get owner by NIC
  getOwner: async (nic) => {
    const response = await api.get(`/api/evowner/${nic}`)
    return response.data
  },

  // Create new EV owner
  createOwner: async (ownerData) => {
    const response = await api.post('/api/evowner', ownerData)
    return response.data
  },

  // Update EV owner
  updateOwner: async (nic, ownerData) => {
    const response = await api.put(`/api/evowner/${nic}`, ownerData)
    return response.data
  },

  // Deactivate EV owner
  deactivateOwner: async (nic) => {
    const response = await api.post(`/api/evowner/${nic}/deactivate`)
    return response.data
  },

  // Reactivate EV owner (Backoffice only)
  reactivateOwner: async (nic) => {
    const response = await api.post(`/api/evowner/${nic}/reactivate`)
    return response.data
  },
}
