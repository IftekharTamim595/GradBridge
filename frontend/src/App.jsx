import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ModalProvider } from './contexts/ModalContext'
import PrivateRoute from './components/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'
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
import ExploreAlumni from './pages/ExploreAlumni'
import Hire from './pages/Hire'
import StudentProfileView from './pages/StudentProfileView'
import AlumniProfileView from './pages/AlumniProfileView'
import AdminLogin from './pages/AdminLogin'
import Community from './pages/Community'
import ExplorePlatform from './pages/ExplorePlatform'
import { ChatProvider } from './contexts/ChatContext'
import ChatWindow from './components/chat/ChatWindow'
import Messages from './pages/Messages'
import ResumeAnalysis from './pages/ResumeAnalysis'

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ModalProvider>
            <ChatProvider>
              <div className="min-h-screen bg-slate-900">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/hire" element={<Hire />} />
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
                  <Route path="/students/search" element={<SearchStudents />} />
                  <Route path="/alumni/search" element={<ExploreAlumni />} />
                  <Route path="/students/:id" element={<StudentProfileView />} />
                  <Route path="/alumni/:id" element={<AlumniProfileView />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/explore" element={<ExplorePlatform />} />
                  <Route
                    path="/messages"
                    element={
                      <PrivateRoute>
                        <Messages />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/resume-analysis"
                    element={
                      <PrivateRoute>
                        <ResumeAnalysis />
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
                <ChatWindow />
              </div>
            </ChatProvider>
          </ModalProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
