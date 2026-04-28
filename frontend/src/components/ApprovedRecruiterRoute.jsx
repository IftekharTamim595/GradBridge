import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ApprovedRecruiterRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
                <div className="text-brand-textSecondary">Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    // Check if user is recruiter (external role)
    if (user.role !== 'external') {
        return <Navigate to="/" />
    }

    // Check if recruiter is approved
    if (!user.is_approved) {
        return <Navigate to="/recruiter/pending" />
    }

    return children
}

export default ApprovedRecruiterRoute
