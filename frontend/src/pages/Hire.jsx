import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { MapPin, User, Search, Filter, ExternalLink, Mail, Loader, Map } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Hire = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const { openChatWithUser } = useChat()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    location: ''
  })
  // Placeholder for map - unnecessary complex logic removed

  useEffect(() => {
    fetchStudents()
  }, [])

  // Debounce search could be added, but manual trigger or effect on filters change is fine
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStudents()
    }, 500)
    return () => clearTimeout(delay)
  }, [filters])


  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      params.append('available_for_hire', 'true')
      if (filters.search) params.append('search', filters.search)
      if (filters.skill) params.append('skills', filters.skill)
      if (filters.location) params.append('city', filters.location) // Assuming backend supports this or client filtering

      const response = await apiClient.get(
        `/api/profiles/students/available_for_hire/?${params}`
      )
      setStudents(response.data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      // Fallback if endpoint fails
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (student) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (student?.user) {
      openChatWithUser(student.user)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
        <Loader className="animate-spin text-brand-primary" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Recruitment</p>
        <h1 className="font-heading text-3xl text-slate-900">Hire Students</h1>
        <p className="text-slate-500 mt-1">Discover and recruit top talent from our student community</p>
      </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-textSecondary" size={18} />
              <input
                type="text"
                placeholder="Search by name, degree..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-textSecondary" size={18} />
              <input
                type="text"
                placeholder="Filter by Skill"
                className="input-field pl-10"
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-textSecondary" size={18} />
              <input
                type="text"
                placeholder="Location (City)"
                className="input-field pl-10"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2 space-y-4">
            {students.length === 0 ? (
              <div className="card text-center py-12">
                <User className="text-brand-textSecondary mx-auto mb-4" size={48} />
                <p className="text-brand-textSecondary">No students found matching your criteria.</p>
              </div>
            ) : (
              students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="card group !p-0 overflow-hidden border border-slate-200 hover:border-brand-primary/30 transition-all shadow-md hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex gap-5">
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-2xl bg-brand-alt border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                        {student.user?.profile_photo ? (
                          <img src={student.user.profile_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-brand-primary/40" size={32} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-xl font-heading text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                            {student.user?.first_name} {student.user?.last_name}
                          </h3>
                          <div className="flex items-center gap-1.5 bg-brand-alt px-2.5 py-1 rounded-full border border-brand-primary/10">
                            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{student.profile_strength || 0} Score</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-600 mb-2 truncate">
                          {student.degree} • {student.university}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {student.skills?.slice(0, 4).map(skill => (
                            <span key={skill.id} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100 uppercase">
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Project Preview */}
                    {student.projects?.length > 0 && (
                      <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recent Project</p>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{student.projects[0].title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{student.projects[0].description}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <MapPin size={12} />
                        <span>{student.city || 'Remote'}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <div className="text-[11px] font-medium text-slate-400">
                        Class of {student.batch}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleSendMessage(student)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        <Mail size={18} />
                       </button>
                       <Link to={`/students/${student.id}`} className="btn-primary !py-2 !px-4 text-xs font-bold gap-2">
                        View Profile
                        <ExternalLink size={14} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Map Placeholder Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <Map className="text-brand-primary" size={20} />
                <span>Nearby Talent</span>
              </h3>
              <div className="w-full h-64 bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-lg flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-brand-border">
                <MapPin className="text-brand-textMuted mb-2" size={48} />
                <p className="text-brand-textSecondary font-medium">Interactive Map View</p>
                <p className="text-brand-textMuted text-xs mt-1">Coming soon. Visualize candidate locations near you.</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <h4 className="text-brand-textMain font-medium mb-2">Hiring Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-bg p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-brand-primary">{students.length}</div>
                    <div className="text-xs text-brand-textMuted">Candidates</div>
                  </div>
                  <div className="bg-brand-bg p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-brand-success">12</div>
                    <div className="text-xs text-brand-textMuted">New Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hire
