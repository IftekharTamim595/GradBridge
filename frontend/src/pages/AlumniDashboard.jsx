import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, TrendingUp, Award, Search, 
  ArrowRight, BarChart3, MessageCircle 
} from 'lucide-react'
import Footer from '../components/Footer'

const AlumniDashboard = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/profiles/alumni/'),
        axios.get('http://localhost:8000/api/analytics/alumni/'),
      ])
      
      if (profileRes.data.results && profileRes.data.results.length > 0) {
        setProfile(profileRes.data.results[0])
      }
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
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
      label: 'Students Mentored',
      value: analytics?.students_mentored || profile?.students_mentored_count || 0,
      icon: Users,
      color: 'indigo',
    },
    {
      label: 'Referrals Made',
      value: analytics?.referrals_made || profile?.referrals_made_count || 0,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Top Skills Discovered',
      value: analytics?.top_skills_discovered?.length || 0,
      icon: Award,
      color: 'blue',
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
          <h1 className="text-4xl font-bold text-white mb-2">Alumni Dashboard</h1>
          <p className="text-slate-400 text-lg">Welcome back, {user?.first_name || user?.email}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                stat.color === 'indigo' ? 'bg-indigo-600/20' :
                stat.color === 'emerald' ? 'bg-emerald-600/20' :
                'bg-blue-600/20'
              }`}>
                <stat.icon className={
                  stat.color === 'indigo' ? 'text-indigo-400' :
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  'text-blue-400'
                } size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/alumni/search"
              className="flex items-center space-x-4 p-6 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <Search className="text-indigo-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                  Search Students
                </h3>
                <p className="text-slate-400 text-sm">Find and review student profiles</p>
              </div>
              <ArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
            </Link>

            <Link
              to="/alumni/profile"
              className="flex items-center space-x-4 p-6 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-emerald-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                  Update Profile
                </h3>
                <p className="text-slate-400 text-sm">Manage your alumni profile</p>
              </div>
              <ArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
            </Link>
          </div>
        </motion.div>

        {/* Top Skills */}
        {analytics?.top_skills_discovered && analytics.top_skills_discovered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Top Skills Discovered</h2>
            <div className="flex flex-wrap gap-3">
              {analytics.top_skills_discovered.slice(0, 10).map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg"
                >
                  <span className="text-indigo-300 font-medium">{skill.name}</span>
                  <span className="text-slate-400 text-sm ml-2">({skill.count})</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AlumniDashboard
