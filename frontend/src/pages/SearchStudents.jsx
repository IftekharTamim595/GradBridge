import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { Search, User, GraduationCap, Award, TrendingUp, FileText, Loader, MessageCircle, ExternalLink, Filter } from 'lucide-react'
import { useModal } from '../contexts/ModalContext'

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'ST'

const SearchStudents = () => {
  const [students, setStudents] = useState([])
  const [skills, setSkills] = useState([])
  const [filters, setFilters] = useState({ search: '', skill: '', batch: '' })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { showModal } = useModal()

  useEffect(() => { fetchData() }, [])
  useEffect(() => { searchStudents() }, [filters])

  const fetchData = async () => {
    try {
      const skillsRes = await apiClient.get('/profiles/skills/')
      setSkills(skillsRes.data.results || [])
      await searchStudents()
    } catch (e) {
      console.error(e)
      showModal({ type: 'error', message: 'Failed to load skills data' })
    } finally { setLoading(false) }
  }

  const searchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.batch)  params.append('batch', filters.batch)
      if (filters.skill)  params.append('skills', filters.skill)

      try {
        const res = await apiClient.get(`/profiles/students/search/?${params}`)
        setStudents(res.data || [])
      } catch {
        const res = await apiClient.get(`/profiles/students/?${params}`)
        let results = res.data.results || []
        if (filters.skill) {
          results = results.filter(s => s.skills?.some(skill => skill.id.toString() === filters.skill))
        }
        setStudents(results)
      }
    } catch (e) {
      console.error(e)
      showModal({ type: 'error', message: 'Failed to search students.' })
    }
  }

  const fetchStudentSummary = async (studentId) => {
    setLoadingSummary(true)
    setSummary(null)
    try {
      const res = await apiClient.post('/ml/student-summary/', { student_profile_id: studentId })
      setSummary(res.data.summary)
    } catch (e) {
      console.error(e)
      showModal({ type: 'error', message: 'Failed to generate AI summary.' })
    } finally { setLoadingSummary(false) }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    fetchStudentSummary(student.id)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Alumni Tools</p>
        <h1 className="font-heading text-3xl text-slate-900">Find Students</h1>
        <p className="text-slate-500 mt-1">{students.length} students found</p>
      </motion.div>

      {/* Search row */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, university, degree…"
            className="input-field pl-10"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary gap-2">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Batch Year</label>
              <input type="text" placeholder="e.g., 2024" className="input-field"
                value={filters.batch} onChange={e => setFilters(prev => ({ ...prev, batch: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Filter by Skill</label>
              <select className="input-field" value={filters.skill}
                onChange={e => setFilters(prev => ({ ...prev, skill: e.target.value }))}>
                <option value="">All Skills</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-6">
        {/* Student list */}
        <div className="flex-1 min-w-0 space-y-3">
          {students.length === 0 ? (
            <div className="card text-center py-14">
              <User size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-heading text-xl text-slate-700">No students found</h3>
              <p className="text-slate-500 text-sm mt-1">Try different search filters</p>
            </div>
          ) : students.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleSelectStudent(s)}
              className={`list-row ${selectedStudent?.id === s.id ? 'ring-2 ring-[#0052FF]/40' : ''}`}
            >
              {/* Avatar */}
              <div className="avatar w-12 h-12 text-base shrink-0">
                {s.user?.profile_photo
                  ? <img src={s.user.profile_photo} alt="" className="w-full h-full rounded-full object-cover" />
                  : getInitials(s.user?.first_name, s.user?.last_name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {s.user?.first_name} {s.user?.last_name}
                  </h3>
                  {s.available_for_hire && <span className="badge badge-green text-[10px]">For hire</span>}
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {s.university || 'University'} {s.batch && `· Batch ${s.batch}`}
                </p>
                {s.degree && <p className="text-xs text-slate-400">{s.degree}</p>}
                {s.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.skills.slice(0, 4).map(sk => (
                      <span key={sk.id} className="skill-pill">{sk.name}</span>
                    ))}
                    {s.skills.length > 4 && <span className="skill-pill-muted">+{s.skills.length - 4}</span>}
                  </div>
                )}
              </div>

              {/* Profile strength + CTA */}
              <div className="shrink-0 text-right space-y-2">
                {s.profile_strength != null && (
                  <div className="text-xs text-slate-400 font-mono-ui">{s.profile_strength}% profile</div>
                )}
                <Link to={`/students/${s.id}`}
                  onClick={e => e.stopPropagation()}
                  className="btn-secondary text-xs py-1.5 px-3">
                  <ExternalLink size={12} />
                  View
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Summary panel */}
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 shrink-0"
          >
            <div className="card sticky top-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="avatar w-10 h-10 text-sm">
                  {getInitials(selectedStudent.user?.first_name, selectedStudent.user?.last_name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {selectedStudent.user?.first_name} {selectedStudent.user?.last_name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedStudent.university}</p>
                </div>
              </div>

              <p className="section-label mb-3">AI Summary</p>

              {loadingSummary ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader size={16} className="animate-spin" />
                  Generating…
                </div>
              ) : summary ? (
                <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
              ) : (
                <p className="text-sm text-slate-400">Select a student to see AI summary</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {selectedStudent.skills?.slice(0, 6).map(sk => (
                  <span key={sk.id} className="skill-pill mr-1.5">{sk.name}</span>
                ))}
              </div>

              <Link to={`/students/${selectedStudent.id}`}
                className="btn-primary w-full justify-center mt-4 text-sm">
                <ExternalLink size={14} />
                Full Profile
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchStudents
