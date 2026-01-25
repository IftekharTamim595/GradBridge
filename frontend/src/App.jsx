import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import AlumniDashboard from './pages/AlumniDashboard'
import AdminDashboard from './pages/AdminDashboard'
import StudentProfile from './pages/StudentProfile'
import AlumniProfile from './pages/AlumniProfile'
import Projects from './pages/Projects'
import Mentorship from './pages/Mentorship'
import SearchStudents from './pages/SearchStudents'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute requiredRole="student">
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <PrivateRoute requiredRole="student">
                  <StudentProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/projects"
              element={
                <PrivateRoute requiredRole="student">
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/mentorship"
              element={
                <PrivateRoute requiredRole="student">
                  <Mentorship />
                </PrivateRoute>
              }
            />
            <Route
              path="/alumni/dashboard"
              element={
                <PrivateRoute requiredRole="alumni">
                  <AlumniDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/alumni/profile"
              element={
                <PrivateRoute requiredRole="alumni">
                  <AlumniProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/alumni/search"
              element={
                <PrivateRoute requiredRole="alumni">
                  <SearchStudents />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
