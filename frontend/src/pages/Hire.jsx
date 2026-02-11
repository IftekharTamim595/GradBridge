import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { MapPin, User, Search, Filter, ExternalLink, Mail, Loader, Map } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

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
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-400" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Hire Students</h1>
          <p className="text-slate-400">Discover and recruit top talent from our student community</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, degree..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filter by Skill"
                className="input-field pl-10"
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
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
                <User className="text-slate-400 mx-auto mb-4" size={48} />
                <p className="text-slate-400">No students found matching your criteria.</p>
              </div>
            ) : (
              students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="card"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="text-indigo-400" size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {student.user?.first_name} {student.user?.last_name}
                          </h3>
                          <p className="text-slate-400 text-sm">{student.user?.email}</p>
                        </div>
                        <span className="flex items-center space-x-1 text-emerald-400 text-sm font-medium">
                          <span>{student.profile_strength}% Strength</span>
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-slate-300 text-sm mb-2 max-w-xl">{student.bio || 'No bio available'}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-3">
                          {student.city && student.country && (
                            <span className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{student.city}, {student.country}</span>
                            </span>
                          )}
                          <span>Batch: {student.batch}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.skills?.slice(0, 6).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded border border-indigo-500/30"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {student.skills?.length > 6 && (
                          <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                            +{student.skills.length - 6} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
                        <Link
                          to={`/students/${student.id}`}
                          className="btn-primary text-sm flex items-center space-x-2"
                        >
                          <ExternalLink size={16} />
                          <span>View Profile</span>
                        </Link>
                        <button
                          onClick={() => handleSendMessage(student)}
                          className="btn-secondary text-sm flex items-center space-x-2"
                        >
                          <Mail size={16} />
                          <span>Send Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Map Placeholder Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Map className="text-indigo-400" size={20} />
                <span>Nearby Talent</span>
              </h3>
              <div className="w-full h-64 bg-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-700">
                <MapPin className="text-slate-600 mb-2" size={48} />
                <p className="text-slate-400 font-medium">Interactive Map View</p>
                <p className="text-slate-500 text-xs mt-1">Coming soon. Visualize candidate locations near you.</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <h4 className="text-white font-medium mb-2">Hiring Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-400">{students.length}</div>
                    <div className="text-xs text-slate-500">Candidates</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">12</div>
                    <div className="text-xs text-slate-500">New Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hire
