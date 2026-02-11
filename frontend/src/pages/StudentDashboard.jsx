import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import {
  User, Briefcase, Award, TrendingUp,
  Plus, ArrowRight, FileText, MessageCircle
} from 'lucide-react'
import Footer from '../components/Footer'

const StudentDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth state to be ready before fetching
    if (!authLoading && isAuthenticated) {
      fetchProfile()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/profiles/students/me/')
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Profile Strength',
      value: profile?.profile_strength || 0,
      icon: TrendingUp,
      color: 'indigo',
      link: '/student/profile',
    },
    {
      label: 'Projects',
      value: profile?.projects?.length || 0,
      icon: Briefcase,
      color: 'emerald',
      link: '/student/projects',
    },
    {
      label: 'Skills',
      value: profile?.skills?.length || 0,
      icon: Award,
      color: 'blue',
      link: '/student/profile',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.first_name || user?.email}</h1>
          <p className="text-slate-400 text-lg">Manage your profile, projects, and mentorship connections</p>
        </motion.div>

        {profile ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="card cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color === 'indigo' ? 'bg-indigo-600/20' :
                      stat.color === 'emerald' ? 'bg-emerald-600/20' :
                        'bg-blue-600/20'
                      }`}>
                      <stat.icon className={
                        stat.color === 'indigo' ? 'text-indigo-400' :
                          stat.color === 'emerald' ? 'text-emerald-400' :
                            'text-blue-400'
                      } size={24} />
                    </div>
                    <ArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm mb-4">{stat.label}</div>
                  {stat.label === 'Profile Strength' && (
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${stat.color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                          stat.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                      />
                    </div>
                  )}
                  <Link
                    to={stat.link}
                    className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View details →
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/student/projects"
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <Plus className="text-indigo-400" size={20} />
                  </div>
                  <div>
                    <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                      Add Project
                    </div>
                    <div className="text-slate-400 text-sm">Showcase your work</div>
                  </div>
                </Link>

                <Link
                  to="/student/mentorship"
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      Request Mentorship
                    </div>
                    <div className="text-slate-400 text-sm">Connect with alumni</div>
                  </div>
                </Link>

                <Link
                  to="/student/profile"
                  className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <User className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                      Update Profile
                    </div>
                    <div className="text-slate-400 text-sm">Complete your profile</div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Profile Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-slate-400" size={20} />
                    <div>
                      <div className="text-white font-medium">Resume</div>
                      <div className="text-slate-400 text-sm">
                        {profile.resume ? 'Uploaded' : 'Not uploaded'}
                      </div>
                    </div>
                  </div>
                  {!profile.resume && (
                    <Link
                      to="/student/profile"
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      Upload →
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="text-slate-400" size={20} />
                    <div>
                      <div className="text-white font-medium">Projects</div>
                      <div className="text-slate-400 text-sm">
                        {profile.projects?.length || 0} projects added
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/student/projects"
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center"
          >
            <div className="w-16 h-16 bg-indigo-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
            <p className="text-slate-400 mb-6">
              Create your profile to start connecting with alumni and showcasing your work.
            </p>
            <Link
              to="/student/profile"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Create Profile</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default StudentDashboard
