import React, { createContext, useState, useContext, useEffect } from 'react'
import apiClient from '../api/apiClient'
import { parseAuthError } from '../utils/errorUtils'

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
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login/', {
        email,
        password,
      })
      // Expect JWT structure: { access: "...", refresh: "...", user: ... }
      const accessToken = response.data.access || response.data.access_token;
      const refreshToken = response.data.refresh || response.data.refresh_token;
      const user = response.data.user;

      // Validate token before storing
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        throw new Error('Invalid access token received from server');
      }

      setToken(accessToken)
      localStorage.setItem('authToken', accessToken)
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        localStorage.setItem('refreshToken', refreshToken)
      }
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
      // Expect JWT structure
      const accessToken = response.data.access || response.data.access_token;
      const refreshToken = response.data.refresh || response.data.refresh_token;
      const user = response.data.user;

      // Validate token before storing
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        throw new Error('Invalid access token received from server');
      }

      setToken(accessToken)
      localStorage.setItem('authToken', accessToken)
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        localStorage.setItem('refreshToken', refreshToken)
      }
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

  const googleLogin = async (code) => {
    try {
      const response = await apiClient.post('/auth/google/', { code })
      const data = response.data

      console.log('Google Login Response Data:', data);
      console.log('Response Keys:', Object.keys(data));

      // We expect { access: "...", refresh: "...", user: ... } from dj-rest-auth with JWT
      const accessToken = data.access || data.access_token;
      const refreshToken = data.refresh || data.refresh_token;
      let userData = data.user;

      // Strict validation - reject old 'key' format and undefined tokens
      if (data.key) {
        console.error('Backend returned "key" instead of "access". System uses JWT, not DRF Token auth.');
        throw new Error('Backend configuration error: received DRF Token instead of JWT. Please check backend settings.');
      }

      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        throw new Error(`Invalid access token received. Keys in response: ${Object.keys(data).join(', ')}`);
      }

      // 1. Store token immediately - only if valid
      setToken(accessToken)
      localStorage.setItem('authToken', accessToken)
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // 2. Fetch User Profile
      // ensure the token is set in header before this call (client interceptor reads localStorage)

      if (!userData) {
        try {
          console.log('Fetching user data...');
          const userRes = await apiClient.get('/auth/me/');
          userData = userRes.data;
          console.log('Fetched User Data:', userData);
        } catch (fetchError) {
          console.error('Failed to fetch user data after login:', fetchError);
          throw new Error('Failed to fetch user profile');
        }
      }

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } else {
        throw new Error('User data could not be retrieved');
      }

      return { success: true, user: userData }
    } catch (error) {
      console.error('Google Login Error:', error)
      return {
        success: false,
        error: parseAuthError(error),
      }
    }
  }

  const logout = async () => {
    try {
      // DRF Token auth usually doesn't need backend logout unless using knox, but we can try
      await apiClient.post('/auth/logout/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      setToken(null)
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
