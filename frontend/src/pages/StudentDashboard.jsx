import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import { User, Briefcase, Award, TrendingUp, Plus, ArrowRight, FileText, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react'

const StudentDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { showModal } = useModal()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchProfile()
    else if (!authLoading && !isAuthenticated) setLoading(false)
  }, [authLoading, isAuthenticated])

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/profiles/students/me/')
      setProfile(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showStrengthBreakdown = async () => {
    try {
      showModal({ type: 'info', message: 'Loading score data...' });
      const res = await apiClient.get('/profiles/students/me/score/');
      const scoreData = res.data;
      
      const totalScore = scoreData.total_score || 0;
      const breakdown = scoreData.breakdown || {};
      const suggestions = scoreData.missing || [];
      
      const maxScores = {
        education: 10,
        cv: 20,
        skills: 20,
        projects: 20,
        experience: 10,
        profile: 10,
        community: 10
      };

      showModal({
        type: 'custom',
        title: 'Profile Optimization',
        content: (
          <div className="space-y-6">
            <div className="text-xl font-bold text-slate-800 border-b pb-4">
              Profile Strength: {totalScore}/100
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              {Object.entries(breakdown).map(([key, score]) => {
                const max = maxScores[key] || 10;
                return (
                  <div key={key} className="flex justify-between w-48 capitalize">
                    <span>{key}:</span>
                    <span className="font-semibold">{score}/{max}</span>
                  </div>
                );
              })}
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-bold text-slate-800">Suggestions:</h4>
                <ul className="text-sm text-slate-600 space-y-1 pl-2">
                  {suggestions.map((msg, idx) => (
                    <li key={idx}>• {msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      });
    } catch (e) {
      showModal({ type: 'error', message: 'Failed to load profile score.' });
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )

  const stats = [
    { label: 'Profile Strength', value: profile?.profile_strength || 0, icon: TrendingUp, action: showStrengthBreakdown, suffix: '%', progress: true },
    { label: 'Projects',         value: profile?.projects?.length || 0, icon: Briefcase,  link: '/student/projects' },
    { label: 'Skills',           value: profile?.skills?.length || 0,   icon: Award,      link: '/student/profile' },
  ]

  const actions = [
    { to: '/student/projects',   icon: Plus,          label: 'Add Project',       sub: 'Showcase your work',       color: '#0052FF' },
    { to: '/student/mentorship', icon: MessageCircle, label: 'Find a Mentor',     sub: 'Connect with alumni',      color: '#22C55E' },
    { to: '/student/profile',    icon: User,          label: 'Update Profile',    sub: 'Complete your profile',    color: '#7C3AED' },
    { to: '/alumni/search',      icon: Sparkles,      label: 'Explore Alumni',    sub: 'Discover mentors',         color: '#F59E0B' },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Student Dashboard</p>
        <h1 className="font-heading text-3xl text-slate-900">
          Good day, {user?.first_name || 'Student'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {profile ? "Here's your profile overview." : 'Set up your profile to get started.'}
        </p>
      </motion.div>

      {profile ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="stat-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF4FF' }}>
                    <s.icon size={20} style={{ color: '#0052FF' }} />
                  </div>
                  {s.action ? (
                    <button onClick={s.action} className="text-xs text-[#0052FF] hover:underline font-medium">
                      Details →
                    </button>
                  ) : (
                    <Link to={s.link} className="text-xs text-[#0052FF] hover:underline font-medium">
                      View →
                    </Link>
                  )}
                </div>
                <div className="font-heading text-3xl text-slate-900">{s.value}{s.suffix || ''}</div>
                <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
                {s.progress && (
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#0052FF,#4D7CFF)' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* AI Insights Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="card mb-6 bg-brand-primary border-none shadow-xl shadow-brand-primary/10 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-white">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">GradBridge AI Analysis</p>
                <h2 className="text-2xl font-heading mb-4">Your Professional Standing</h2>
                <div className="flex flex-wrap gap-3">
                   <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold">
                     Resume Score: {profile?.profile_strength || 0}%
                   </div>
                   <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold">
                     AI Recommendations Ready
                   </div>
                </div>
              </div>
              <Link 
                to="/resume-analysis" 
                className="bg-white text-brand-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0"
              >
                Get Full Insights
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card mb-6"
          >
            <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {actions.map((a, i) => (
                <Link key={i} to={a.to}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background: `${a.color}18` }}>
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

          {/* Profile summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card"
          >
            <h2 className="font-semibold text-slate-800 mb-4">Profile Overview</h2>
            <div className="divide-y divide-slate-100">
              {[
                { icon: FileText,  label: 'Resume',   val: profile.resume ? 'Uploaded ✓' : 'Not uploaded', link: '/student/profile', action: !profile.resume ? 'Upload' : null },
                { icon: Briefcase, label: 'Projects',  val: `${profile.projects?.length || 0} projects`, link: '/student/projects', action: 'Manage' },
                { icon: Award,     label: 'Skills',    val: `${profile.skills?.length || 0} skills listed`, link: '/student/profile', action: 'Edit' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <row.icon size={16} className="text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">{row.label}</div>
                      <div className="text-xs text-slate-400">{row.val}</div>
                    </div>
                  </div>
                  {row.action && (
                    <Link to={row.link} className="text-xs text-[#0052FF] font-medium hover:underline">
                      {row.action} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-14"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: '#EFF4FF' }}>
            <User size={28} style={{ color: '#0052FF' }} />
          </div>
          <h3 className="font-heading text-2xl text-slate-900 mb-2">Build Your Profile</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your student profile to showcase your skills and connect with alumni mentors.
          </p>
          <Link to="/student/profile" className="btn-primary shadow-accent">
            Create Profile <ArrowRight size={17} />
          </Link>
        </motion.div>
      )}
    </div>
  )
}

export default StudentDashboard
