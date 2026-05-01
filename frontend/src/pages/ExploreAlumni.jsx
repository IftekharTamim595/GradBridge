import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { Search, Briefcase, MapPin, Award, Filter, X, ExternalLink } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMediaUrl } from '../utils/url'

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'AL'

const ExploreAlumni = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [alumni, setAlumni] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', skills: [], industry: '', experience_min: '', city: '', country: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, currentPage: 1 })

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchData()
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!authLoading && isAuthenticated) searchAlumni()
  }, [filters, authLoading, isAuthenticated])

  const fetchData = async () => {
    try {
      const skillsRes = await apiClient.get('/profiles/skills/')
      setSkills(skillsRes.data.results || [])
      await searchAlumni()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const searchAlumni = async (page = 1) => {
    try {
      const params = {
        page,
        ...(filters.search && { q: filters.search }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.experience_min && { min_experience: filters.experience_min }),
        ...(filters.city && { city: filters.city }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
      }
      const res = await apiClient.get('/search/alumni/', { params })
      setAlumni(res.data.results || [])
      setPagination({ count: res.data.count, next: res.data.next, previous: res.data.previous, currentPage: page })
    } catch (e) { console.error(e) }
  }

  const toggleSkill = (skillId) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }))
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
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Directory</p>
        <h1 className="font-heading text-3xl text-slate-900">Explore Alumni</h1>
        <p className="text-slate-500 mt-1">{pagination.count} alumni in the network</p>
      </motion.div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alumni by name, company, or role…"
            className="input-field pl-10"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'ring-2 ring-[#0052FF]/20' : ''}`}
        >
          <Filter size={16} />
          Filters
          {(filters.skills.length > 0 || filters.industry || filters.city) && (
            <span className="ml-1 w-5 h-5 rounded-full bg-[#0052FF] text-white text-xs flex items-center justify-center">
              {filters.skills.length + (filters.industry ? 1 : 0) + (filters.city ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Industry</label>
              <input type="text" placeholder="e.g., Technology" className="input-field"
                value={filters.industry} onChange={e => setFilters(prev => ({ ...prev, industry: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">City</label>
              <input type="text" placeholder="e.g., San Francisco" className="input-field"
                value={filters.city} onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Min Experience (years)</label>
              <input type="number" placeholder="0" className="input-field"
                value={filters.experience_min} onChange={e => setFilters(prev => ({ ...prev, experience_min: e.target.value }))} />
            </div>
          </div>
          {skills.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 20).map(skill => (
                  <button key={skill.id} onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      filters.skills.includes(skill.id)
                        ? 'bg-[#0052FF] text-white border-[#0052FF]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#0052FF]'
                    }`}>
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.length === 0 ? (
          <div className="col-span-full card text-center py-14">
            <Award size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-heading text-xl text-slate-700">No alumni found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : alumni.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-hover flex flex-col items-center text-center group h-full"
          >
            {/* Header / Badges */}
            <div className="w-full flex justify-end mb-2 h-6">
              {a.available_for_mentorship && (
                <span className="badge badge-green text-[10px] animate-pulse">Mentor</span>
              )}
            </div>

            {/* Name First */}
            {/* Avatar */}
            <div className="avatar w-20 h-20 text-xl shrink-0 mb-4 ring-4 ring-slate-50 group-hover:ring-[#0052FF]/10 transition-all">
              {a.profile_picture || a.user?.profile_photo
                ? <img src={getMediaUrl(a.profile_picture || a.user?.profile_photo)} alt="" className="w-full h-full rounded-full object-cover" />
                : getInitials(a.user?.first_name, a.user?.last_name)}
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              <h3 className="font-heading text-lg text-slate-900 group-hover:text-[#0052FF] transition-colors line-clamp-1 mb-1">
                {a.name}
              </h3>
              <p className="text-sm font-semibold text-slate-700 line-clamp-2 min-h-[1.5rem]">
                {a.current_position}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                {a.company ? `at ${a.company}` : ''}
              </p>

              {a.skills?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {a.skills.slice(0, 3).map(s => (
                    <span key={s.id} className="skill-pill !px-2 !py-0.5 !text-[10px]">{s.name}</span>
                  ))}
                  {a.skills.length > 3 && <span className="skill-pill-muted !px-2 !py-0.5 !text-[10px]">+{a.skills.length - 3}</span>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full pt-4 mt-4 border-t border-slate-100">
              <Link
                to={`/alumni/${a.id}`}
                className="w-full btn-secondary text-sm !py-2 justify-center group-hover:bg-[#0052FF] group-hover:text-white transition-all"
              >
                View Profile
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {(pagination.next || pagination.previous) && (
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => searchAlumni(pagination.currentPage - 1)} disabled={!pagination.previous}
            className="btn-secondary disabled:opacity-40">← Previous</button>
          <span className="flex items-center text-sm text-slate-500">Page {pagination.currentPage}</span>
          <button onClick={() => searchAlumni(pagination.currentPage + 1)} disabled={!pagination.next}
            className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}

export default ExploreAlumni
