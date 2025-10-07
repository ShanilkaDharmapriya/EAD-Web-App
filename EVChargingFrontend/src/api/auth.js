import api from './axios'

export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },

  // Register EV owner
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  // Refresh token
  refresh: async () => {
    const response = await api.post('/api/auth/refresh')
    return response.data
  },
}
