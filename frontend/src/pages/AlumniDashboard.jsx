import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import { Users, TrendingUp, Award, Search, ArrowRight, BarChart3, MessageCircle } from 'lucide-react'

const AlumniDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchData()
    else if (!authLoading && !isAuthenticated) setLoading(false)
  }, [authLoading, isAuthenticated])

  const fetchData = async () => {
    try {
      const [profileRes, analyticsRes] = await Promise.all([
        apiClient.get('/profiles/alumni/'),
        apiClient.get('/analytics/alumni/'),
      ])
      if (profileRes.data.results?.length > 0) setProfile(profileRes.data.results[0])
      setAnalytics(analyticsRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )

  const stats = [
    { label: 'Students Mentored',   value: analytics?.students_mentored || profile?.students_mentored_count || 0, icon: Users,      color: '#0052FF' },
    { label: 'Referrals Made',      value: analytics?.referrals_made    || profile?.referrals_made_count    || 0, icon: TrendingUp,  color: '#22C55E' },
    { label: 'Top Skills Found',    value: analytics?.top_skills_discovered?.length || 0,                        icon: Award,       color: '#7C3AED' },
    { label: 'Profile Views',       value: analytics?.profile_views || 0,                                        icon: BarChart3,   color: '#F59E0B' },
  ]

  const actions = [
    { to: '/students/search',  icon: Search,        label: 'Find Students',  sub: 'Discover talent',       color: '#0052FF' },
    { to: '/alumni/profile',   icon: BarChart3,     label: 'Update Profile', sub: 'Stay professional',     color: '#22C55E' },
    { to: '/messages',         icon: MessageCircle, label: 'Messages',       sub: 'Check your inbox',      color: '#7C3AED' },
    { to: '/community',        icon: Users,         label: 'Community',      sub: 'Engage with peers',     color: '#F59E0B' },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Alumni Dashboard</p>
        <h1 className="font-heading text-3xl text-slate-900">
          Welcome back, {user?.first_name || 'Alumni'} 👋
        </h1>
        <p className="text-slate-500 mt-1">Track your mentoring impact and discover students.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="font-heading text-3xl text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((a, i) => (
            <Link key={i} to={a.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}18` }}>
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 group-hover:text-[#0052FF] transition-colors">{a.label}</div>
                <div className="text-xs text-slate-400">{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Top Skills Discovered */}
      {analytics?.top_skills_discovered?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="font-semibold text-slate-800 mb-4">Top Skills in Student Pool</h2>
          <div className="flex flex-wrap gap-2">
            {analytics.top_skills_discovered.slice(0, 12).map((skill, i) => (
              <span key={i} className="skill-pill">
                {skill.name}
                <span className="ml-1 opacity-60">({skill.count})</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AlumniDashboard
