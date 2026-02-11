import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, GraduationCap, MessageCircle, TrendingUp, BarChart3 } from 'lucide-react'
import Footer from '../components/Footer'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [skillTrends, setSkillTrends] = useState(null)
  const [engagement, setEngagement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, trendsRes, engagementRes] = await Promise.all([
        apiClient.get('/analytics/dashboard/'),
        apiClient.get('/analytics/skill-trends/'),
        apiClient.get('/analytics/engagement/'),
      ])
      
      setStats(statsRes.data)
      setSkillTrends(trendsRes.data)
      setEngagement(engagementRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
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

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'indigo' },
    { label: 'Total Alumni', value: stats?.total_alumni || 0, icon: GraduationCap, color: 'emerald' },
    { label: 'Active Mentorships', value: stats?.active_mentorships || 0, icon: MessageCircle, color: 'blue' },
    { label: 'Active Referrals', value: stats?.active_referrals || 0, icon: TrendingUp, color: 'purple' },
  ]

  const skillChartData = skillTrends?.popular_student_skills?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400 text-lg">Platform analytics and insights</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
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
                stat.color === 'blue' ? 'bg-blue-600/20' :
                'bg-purple-600/20'
              }`}>
                <stat.icon className={
                  stat.color === 'indigo' ? 'text-indigo-400' :
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  'text-purple-400'
                } size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <BarChart3 className="text-indigo-400" size={24} />
              <span>Top Student Skills</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Engagement Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Average Profile Strength</span>
                  <span className="text-2xl font-bold text-white">
                    {engagement?.average_profile_strength?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${engagement?.average_profile_strength || 0}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Mentorship Acceptance Rate</span>
                  <span className="text-2xl font-bold text-white">
                    {engagement?.mentorship_acceptance_rate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${engagement?.mentorship_acceptance_rate || 0}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-white mb-3">Recent Activity (30 days)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Students</span>
                    <span className="text-white font-medium">{engagement?.recent_activity?.new_students || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Alumni</span>
                    <span className="text-white font-medium">{engagement?.recent_activity?.new_alumni || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Projects</span>
                    <span className="text-white font-medium">{engagement?.recent_activity?.new_projects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Mentorships</span>
                    <span className="text-white font-medium">{engagement?.recent_activity?.new_mentorships || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Referrals</span>
                    <span className="text-white font-medium">{engagement?.recent_activity?.new_referrals || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminDashboard
