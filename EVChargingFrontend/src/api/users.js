import api from './axios'

export const usersAPI = {
  // Get all users (paginated)
  getUsers: async (params = {}) => {
    const response = await api.get('/api/user', { params })
    return response.data
  },

  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/api/user/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/api/user', userData)
    return response.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/user/${id}`, userData)
    return response.data
  },

  // Deactivate user
  deactivateUser: async (id) => {
    const response = await api.post(`/api/user/${id}/deactivate`)
    return response.data
  },

  // Activate user
  activateUser: async (id) => {
    const response = await api.post(`/api/user/${id}/activate`)
    return response.data
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/api/user/${id}`)
    return response.data
  },
}
