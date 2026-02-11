import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import {
  User, MapPin, GraduationCap, Award, Briefcase,
  Mail, Lock, Globe, Github, Linkedin, ExternalLink,
  Sparkles, AlertCircle
} from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'
import AIInsights from '../components/AIInsights'

const StudentProfileView = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { openChatWithUser } = useChat()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiInsightsOpen, setAIInsightsOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    try {
      const [profileRes, projectsRes] = await Promise.all([
        apiClient.get(`/profiles/students/${id}/`),
        apiClient.get(`/projects/?student_profile=${id}`).catch(() => ({ data: { results: [] } }))
      ])
      const profileData = profileRes.data
      profileData.projects = projectsRes.data.results || []
      setProfile(profileData)
    } catch (error) {
      if (error.response?.status === 403) {
        setError('This profile is private. You do not have permission to view it.')
      } else if (error.response?.status === 404) {
        setError('Profile not found.')
      } else {
        setError('Failed to load profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (profile?.user) {
      openChatWithUser(profile.user)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-slate-400 font-medium">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2 text-balance">Access Restricted</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            >
              Go Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-slate-950 pt-16 font-sans antialiased text-slate-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Profile Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* Main Info Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              {profile.visibility === 'private' ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-full border border-slate-700">
                  <Lock size={12} aria-hidden="true" />
                  <span>Private</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                  <Globe size={12} aria-hidden="true" />
                  <span>Public</span>
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  {profile.user?.profile_photo ? (
                    <img
                      src={profile.user.profile_photo}
                      alt={`${profile.user.first_name} ${profile.user.last_name}`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {profile.user?.first_name?.[0]}{profile.user?.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border-2 border-slate-800">
                  <User className="text-indigo-400" size={20} />
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-balance mb-2">
                    {profile.user?.first_name} {profile.user?.last_name}
                  </h1>
                  <p className="text-lg text-indigo-400 font-medium">{profile.degree || 'Student'}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                  {profile.city && profile.country && (
                    <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <MapPin size={14} aria-hidden="true" />
                      <span>{profile.city}, {profile.country}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                    <Mail size={14} aria-hidden="true" />
                    <span>{profile.user?.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleSendMessage}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    aria-label={`Send message to ${profile.user?.first_name}`}
                  >
                    <Mail size={18} aria-hidden="true" />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => setAIInsightsOpen(true)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl font-medium transition-colors border border-slate-700 hover:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    aria-label="View AI Insights"
                  >
                    <Sparkles size={18} aria-hidden="true" />
                    <span>AI Insights</span>
                  </button>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-8 pt-8 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
                <p className="text-slate-300 leading-relaxed max-w-3xl text-pretty">
                  {profile.bio}
                </p>
              </div>
            )}
          </motion.section>

          {/* Sidebar Info */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Profile Strength */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-200 font-semibold">Profile Strength</span>
                <span className="text-emerald-400 font-bold">{profile.profile_strength}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.profile_strength}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">Complete your profile to increase visibility.</p>
            </div>

            {/* Links */}
            {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Connect</h3>
                <div className="space-y-3">
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                    >
                      <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">LinkedIn</span>
                      <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors group focus-visible:ring-2 focus-visible:ring-slate-500 outline-none"
                    >
                      <Github size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">GitHub</span>
                      <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors group focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                    >
                      <Globe size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Portfolio</span>
                      <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.resume && (
                    <a
                      href={profile.resume}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                    >
                      <Briefcase size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Resume</span>
                      <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Education Summary for Sidebar */}
            {(profile.university || profile.graduation_year) && (
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Education</h3>
                <div className="space-y-4">
                  {profile.university && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                        <GraduationCap size={18} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{profile.university}</p>
                        {profile.batch && <p className="text-slate-400 text-sm">Class of {profile.batch}</p>}
                      </div>
                    </div>
                  )}
                  {profile.gpa && (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-400">GPA</span>
                      <span className="text-white font-bold">{profile.gpa}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* Education Details */}
          {(profile.university || profile.degree) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <GraduationCap className="text-indigo-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Academic Background</h2>
              </div>

              <div className="space-y-6">
                <div className="pl-4 border-l-2 border-slate-800 hover:border-indigo-500/50 transition-colors">
                  <h3 className="text-lg font-semibold text-white">{profile.university}</h3>
                  <p className="text-indigo-400">{profile.degree}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                    {profile.batch && <span>Batch: {profile.batch}</span>}
                    {profile.graduation_year && <span>Graduation: {profile.graduation_year}</span>}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-xl">
                  <Award className="text-pink-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Skills & Expertise</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-full transition-colors border border-slate-700 hover:border-slate-600 cursor-default"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Briefcase className="text-emerald-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.projects.map((project) => (
                <article
                  key={project.id}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:shadow-xl hover:-translate-y-1 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex space-x-2">
                      {project.github_link && (
                        <a
                          href={project.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 outline-none"
                          aria-label="View Project on GitHub"
                        >
                          <Github size={18} />
                        </a>
                      )}
                      {project.live_link && (
                        <a
                          href={project.live_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                          aria-label="View Live Project"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {project.tech_stack && (
                    <div className="pt-4 border-t border-slate-800/50">
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.split(',').slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
      {aiInsightsOpen && (
        <AIInsights isOpen={aiInsightsOpen} onClose={() => setAIInsightsOpen(false)} />
      )}
    </div>
  )
}

export default StudentProfileView
