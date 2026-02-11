import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { Search, Briefcase, MapPin, Award, Filter, X } from 'lucide-react'
import Footer from '../components/Footer'

const ExploreAlumni = () => {
  const [alumni, setAlumni] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    skills: [],
    industry: '',
    experience_min: '',
    city: '',
    country: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    searchAlumni()
  }, [filters])

  const fetchData = async () => {
    try {
      const skillsRes = await apiClient.get('/profiles/skills/')
      setSkills(skillsRes.data.results || [])
      await searchAlumni()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAlumni = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.industry) params.append('industry', filters.industry)
      if (filters.experience_min) params.append('experience_min', filters.experience_min)
      if (filters.city) params.append('city', filters.city)
      if (filters.country) params.append('country', filters.country)
      filters.skills.forEach(skillId => params.append('skills', skillId))

      const response = await apiClient.get(`/profiles/alumni/search/?${params}`)
      // Handle pagination results or direct array
      const results = response.data.results || response.data || []
      setAlumni(results)
    } catch (error) {
      console.error('Error searching alumni:', error)
    }
  }

  const toggleSkill = (skillId) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }))
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
          <h1 className="text-4xl font-bold text-white mb-2">Explore Alumni</h1>
          <p className="text-slate-400">Connect with experienced professionals</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, company, position..."
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-slate-700 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    placeholder="e.g., Technology"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Min Experience</label>
                  <input
                    type="number"
                    value={filters.experience_min}
                    onChange={(e) => setFilters({ ...filters, experience_min: e.target.value })}
                    placeholder="Years"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder="City"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-800/50 rounded-lg">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${filters.skills.includes(skill.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setFilters({
                  search: '',
                  skills: [],
                  industry: '',
                  experience_min: '',
                  city: '',
                  country: '',
                })}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Results ({alumni.length})
            </h2>
          </div>

          {alumni.length === 0 ? (
            <div className="card text-center py-12">
              <Search className="text-slate-400 mx-auto mb-4" size={48} />
              <p className="text-slate-400">No alumni found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((alum, index) => (
                <motion.div
                  key={alum.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="card cursor-pointer"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-indigo-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {alum.user?.first_name} {alum.user?.last_name}
                      </h3>
                      <p className="text-slate-400 text-sm">{alum.user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {alum.current_position && (
                      <p className="text-white text-sm">
                        <Briefcase className="inline mr-2 text-slate-400" size={14} />
                        {alum.current_position}
                      </p>
                    )}
                    {alum.current_company && (
                      <p className="text-slate-300 text-sm">
                        at {alum.current_company}
                      </p>
                    )}
                    {alum.city && alum.country && (
                      <p className="text-slate-400 text-xs flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{alum.city}, {alum.country}</span>
                      </p>
                    )}
                  </div>

                  {alum.skills && alum.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {alum.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded border border-indigo-500/30"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/alumni/${alum.id}`}
                    className="btn-primary text-sm w-full text-center"
                  >
                    View Profile
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ExploreAlumni
