import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // External users and unauthenticated users go to home
    if (!user || user.role === 'external') {
      return <Navigate to="/" replace />
    }
    // Other roles go to their dashboard
    return <Navigate to={`/${user?.role}/dashboard`} replace />
  }

  return children
}

export default PrivateRoute
