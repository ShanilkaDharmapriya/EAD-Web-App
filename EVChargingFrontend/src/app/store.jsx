import { createContext, useContext, useReducer, useEffect } from 'react'

// Auth state management
const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user data from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        
        // Check if user object has userId field (new format)
        if (!user.userId && !user.id) {
          console.log('Old user format detected, clearing localStorage and forcing re-login')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: 'LOGOUT' })
          return
        }
        
        dispatch({ type: 'LOGIN', payload: { user, token } })
      } catch (error) {
        // If user data is corrupted, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'LOGOUT' })
      }
    }
  }, [])

  const login = (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
