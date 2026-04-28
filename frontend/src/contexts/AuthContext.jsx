import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/apiClient'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper to parse error messages
  const parseAuthError = (error) => {
    if (error.response?.data) {
      const data = error.response.data
      // Handle field-specific errors
      if (typeof data === 'object' && !data.detail && !data.error) {
        const firstError = Object.values(data)[0]
        return Array.isArray(firstError) ? firstError[0] : firstError
      }
      return data.detail || data.error || 'Authentication failed'
    }
    return error.message || 'An error occurred'
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login/', { email, password })
      const { user, access, refresh } = response.data

      if (!access || !refresh) {
        throw new Error('Invalid authentication response')
      }

      setToken(access)
      localStorage.setItem('authToken', access)
      localStorage.setItem('refreshToken', refresh)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      setUser(user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: parseAuthError(error),
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register/', userData)
      const { user, access, refresh } = response.data

      if (!access || !refresh) {
        throw new Error('Invalid authentication response')
      }

      setToken(access)
      localStorage.setItem('authToken', access)
      localStorage.setItem('refreshToken', refresh)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      setUser(user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: parseAuthError(error),
      }
    }
  }

  const googleLogin = async (code, loginType = 'student') => {
    try {
      const response = await apiClient.post('/auth/google/', { code, login_type: loginType })
      const { user, access, refresh } = response.data

      if (!access || !refresh) {
        throw new Error('Invalid authentication response')
      }

      setToken(access)
      localStorage.setItem('authToken', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      setUser(user)
      return { success: true, user }
    } catch (error) {
      console.error('Google Login Error:', error)
      return {
        success: false,
        error: parseAuthError(error),
      }
    }
  }

  const logout = async () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
