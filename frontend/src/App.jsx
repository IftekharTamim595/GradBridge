import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ModalProvider } from './contexts/ModalContext'
import PrivateRoute from './components/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AIInsights from './components/AIInsights'
import { useAuth } from './contexts/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import AlumniDashboard from './pages/AlumniDashboard'
import StudentProfile from './pages/StudentProfile'
import AlumniProfile from './pages/AlumniProfile'
import Projects from './pages/Projects'
import Mentorship from './pages/Mentorship'
import SearchStudents from './pages/SearchStudents'
import ExploreAlumni from './pages/ExploreAlumni'
import Hire from './pages/Hire'
import StudentProfileView from './pages/StudentProfileView'
import AlumniProfileView from './pages/AlumniProfileView'
import Community from './pages/Community'
import ExplorePlatform from './pages/ExplorePlatform'
import { ChatProvider } from './contexts/ChatContext'
import ChatWindow from './components/chat/ChatWindow'
import Messages from './pages/Messages'
import ResumeAnalysis from './pages/ResumeAnalysis'
import Jobs from './pages/Jobs'

// Pages that show full-width (no sidebar)
const PUBLIC_PATHS = ['/', '/login', '/register']

// Inner layout component so we can read auth context
function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [aiOpen, setAiOpen] = useState(false)

  const isPublic = PUBLIC_PATHS.includes(location.pathname)
  const showSidebar = isAuthenticated && !isPublic

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar — only for authenticated, non-public pages */}
        {showSidebar && <Sidebar onAIInsights={() => setAiOpen(true)} />}

        {/* Main content */}
        <main className={showSidebar ? 'main-content flex-1' : 'flex-1'}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/hire" element={<Hire />} />
            <Route path="/community" element={<Community />} />
            <Route path="/explore" element={<ExplorePlatform />} />
            <Route path="/students/search" element={<SearchStudents />} />
            <Route path="/alumni/search" element={<ExploreAlumni />} />
            <Route path="/students/:id" element={<StudentProfileView />} />
            <Route path="/alumni/:id" element={<AlumniProfileView />} />

            <Route path="/student/dashboard" element={
              <PrivateRoute requiredRole="student"><StudentDashboard /></PrivateRoute>
            } />
            <Route path="/student/profile" element={
              <PrivateRoute requiredRole="student"><StudentProfile /></PrivateRoute>
            } />
            <Route path="/student/projects" element={
              <PrivateRoute requiredRole="student"><Projects /></PrivateRoute>
            } />
            <Route path="/student/mentorship" element={
              <PrivateRoute requiredRole="student"><Mentorship /></PrivateRoute>
            } />

            <Route path="/alumni/dashboard" element={
              <PrivateRoute requiredRole="alumni"><AlumniDashboard /></PrivateRoute>
            } />
            <Route path="/alumni/profile" element={
              <PrivateRoute requiredRole="alumni"><AlumniProfile /></PrivateRoute>
            } />

            <Route path="/messages" element={
              <PrivateRoute><Messages /></PrivateRoute>
            } />
            <Route path="/resume-analysis" element={
              <PrivateRoute><ResumeAnalysis /></PrivateRoute>
            } />
            <Route path="/jobs" element={
              <PrivateRoute><Jobs /></PrivateRoute>
            } />
          </Routes>
        </main>
      </div>

      <ChatWindow />

      {aiOpen && <AIInsights isOpen={aiOpen} onClose={() => setAiOpen(false)} />}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ModalProvider>
            <ChatProvider>
              <AppLayout />
            </ChatProvider>
          </ModalProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
