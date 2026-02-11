import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { Search, User, GraduationCap, Award, TrendingUp, FileText, Loader, MessageCircle } from 'lucide-react'
import Footer from '../components/Footer'
import { useModal } from '../contexts/ModalContext'

const SearchStudents = () => {
  const [students, setStudents] = useState([])
  const [skills, setSkills] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    batch: '',
  })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showModal } = useModal()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    searchStudents()
  }, [filters])

  const fetchData = async () => {
    try {
      const skillsRes = await apiClient.get('/profiles/skills/')
      setSkills(skillsRes.data.results || [])
      await searchStudents()
    } catch (error) {
      console.error('Error fetching data:', error)
      showModal({ type: 'error', message: 'Failed to load skills data' })
    } finally {
      setLoading(false)
    }
  }

  const searchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.batch) params.append('batch', filters.batch)
      if (filters.skill) params.append('skills', filters.skill)

      // Try search endpoint first
      try {
        const response = await apiClient.get(`/profiles/students/search/?${params}`)
        setStudents(response.data || [])
      } catch (searchError) {
        // Fallback to regular endpoint
        const response = await apiClient.get(`/profiles/students/?${params}`)
        let results = response.data.results || []

        // Filter by skill on client side if needed
        if (filters.skill) {
          results = results.filter(s =>
            s.skills?.some(skill => skill.id.toString() === filters.skill)
          )
        }

        setStudents(results)
      }
    } catch (error) {
      console.error('Error searching students:', error)
      showModal({ type: 'error', message: 'Failed to search students. Please try again.' })
    }
  }

  const fetchStudentSummary = async (studentId) => {
    setLoadingSummary(true)
    setSummary(null)
    try {
      const response = await apiClient.post('/ml/student-summary/', {
        student_profile_id: studentId,
      })
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoadingSummary(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
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
          <h1 className="text-4xl font-bold text-white mb-2">Search Students</h1>
          <p className="text-slate-400">Discover talented students and review their profiles</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Name, university, degree..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skill</label>
              <select
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                className="input-field"
              >
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Batch</label>
              <input
                type="text"
                value={filters.batch}
                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                placeholder="e.g., 2024"
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Results ({students.length})
            </h2>
            <div className="space-y-4">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={`card cursor-pointer transition-all relative ${selectedStudent?.id === student.id
                      ? 'border-indigo-500 bg-slate-800'
                      : 'hover:border-indigo-500/50'
                    }`}
                >
                  <div
                    onClick={() => {
                      setSelectedStudent(student)
                      fetchStudentSummary(student.id)
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="text-indigo-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/students/${student.id}`}
                          className="block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="text-lg font-semibold text-white mb-1 hover:text-indigo-400 transition-colors">
                            {student.user?.email}
                          </h3>
                        </Link>
                        <p className="text-slate-400 text-sm mb-2">
                          {student.degree} at {student.university}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center space-x-1">
                            <GraduationCap size={14} />
                            <span>Batch: {student.batch || 'N/A'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp size={14} />
                            <span>Strength: {student.profile_strength}%</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.skills?.slice(0, 5).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded border border-indigo-500/30"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {student.skills?.length > 5 && (
                            <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                              +{student.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/students/${student.id}`}
                    className="absolute inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStudent(student)
                    }}
                  />
                </motion.div>
              ))}
              {students.length === 0 && (
                <div className="card text-center py-12">
                  <Search className="text-slate-400 mx-auto mb-4" size={48} />
                  <p className="text-slate-400">No students found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>

          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-24"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Student Summary</h2>
              {loadingSummary ? (
                <div className="card flex items-center justify-center py-12">
                  <Loader className="animate-spin text-indigo-400" size={32} />
                </div>
              ) : summary ? (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-6">{summary.name}</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <GraduationCap className="text-indigo-400" size={18} />
                        <p className="text-sm font-medium text-slate-300">Education</p>
                      </div>
                      <p className="text-white">{summary.education}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="text-indigo-400" size={18} />
                        <p className="text-sm font-medium text-slate-300">Batch</p>
                      </div>
                      <p className="text-white">{summary.batch}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-indigo-400" size={18} />
                        <p className="text-sm font-medium text-slate-300">Profile Strength</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${summary.profile_strength}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                          />
                        </div>
                        <span className="text-white font-medium">{summary.profile_strength}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="text-indigo-400" size={18} />
                        <p className="text-sm font-medium text-slate-300">Skills</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {summary.skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-sm rounded border border-indigo-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="text-indigo-400" size={18} />
                        <p className="text-sm font-medium text-slate-300">Projects</p>
                      </div>
                      <p className="text-white mb-3">{summary.project_count} projects</p>
                      {summary.top_projects?.length > 0 && (
                        <ul className="space-y-2">
                          {summary.top_projects.map((project, idx) => (
                            <li key={idx} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                              <strong className="text-white">{project.title}</strong>
                              <p className="text-slate-400 mt-1">Tech: {project.tech_stack}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-slate-400">Select a student to view summary</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SearchStudents
