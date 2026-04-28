import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, MapPin, Briefcase, Award, Users } from 'lucide-react'
import apiClient from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const AlumniSearch = () => {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        company: '',
        university: '',
        skills: '',
        city: '',
        available_for_mentorship: null,
    })
    const [showFilters, setShowFilters] = useState(false)
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
    })

    const fetchResults = async (page = 1) => {
        if (!isAuthenticated) return

        setLoading(true)
        try {
            const params = {
                page,
                ...(searchQuery && { q: searchQuery }),
                ...(filters.company && { company: filters.company }),
                ...(filters.university && { university: filters.university }),
                ...(filters.skills && { skills: filters.skills }),
                ...(filters.city && { city: filters.city }),
                ...(filters.available_for_mentorship !== null && {
                    available_for_mentorship: filters.available_for_mentorship
                }),
            }

            const response = await apiClient.get('/search/alumni/', { params })
            setResults(response.data.results || [])
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page,
            })
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const debounce = setTimeout(() => {
                fetchResults()
            }, 500)
            return () => clearTimeout(debounce)
        }
    }, [searchQuery, filters, authLoading, isAuthenticated])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            company: '',
            university: '',
            skills: '',
            city: '',
            available_for_mentorship: null,
        })
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== null)

    if (authLoading) {
        return (
            <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
                <div className="text-brand-textSecondary">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-brand-textMain mb-2">Search Alumni</h1>
                    <p className="text-brand-textSecondary text-lg">
                        Find and connect with alumni by name, company, skills, and more
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-textSecondary" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, company, position..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-brand-alt border border-brand-border rounded-lg pl-12 pr-4 py-3 text-brand-textMain placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 text-white' : ''}`}
                        >
                            <Filter size={20} />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-brand-border"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Company"
                                    value={filters.company}
                                    onChange={(e) => handleFilterChange('company', e.target.value)}
                                    className="bg-brand-alt border border-brand-border rounded-lg px-4 py-2 text-brand-textMain placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="University"
                                    value={filters.university}
                                    onChange={(e) => handleFilterChange('university', e.target.value)}
                                    className="bg-brand-alt border border-brand-border rounded-lg px-4 py-2 text-brand-textMain placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    className="bg-brand-alt border border-brand-border rounded-lg px-4 py-2 text-brand-textMain placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Skills (comma-separated)"
                                    value={filters.skills}
                                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                                    className="bg-brand-alt border border-brand-border rounded-lg px-4 py-2 text-brand-textMain placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                />
                                <select
                                    value={filters.available_for_mentorship === null ? '' : filters.available_for_mentorship}
                                    onChange={(e) => handleFilterChange('available_for_mentorship', e.target.value === '' ? null : e.target.value === 'true')}
                                    className="bg-brand-alt border border-brand-border rounded-lg px-4 py-2 text-brand-textMain focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="">Any Availability</option>
                                    <option value="true">Available for Mentorship</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-brand-primary hover:text-indigo-300 flex items-center gap-2 text-sm"
                                >
                                    <X size={16} />
                                    Clear all filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Count */}
                {!loading && (
                    <div className="text-brand-textSecondary mb-4">
                        {pagination.count} result{pagination.count !== 1 ? 's' : ''} found
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-brand-textSecondary">Searching...</div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((alumni, index) => (
                            <AlumniCard key={alumni.id} alumni={alumni} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 text-brand-textMuted mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-brand-textMain mb-2">No results found</h3>
                        <p className="text-brand-textSecondary">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.count > 20 && (
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => fetchResults(pagination.currentPage - 1)}
                            disabled={!pagination.previous}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-brand-textMain py-2 px-4">
                            Page {pagination.currentPage}
                        </span>
                        <button
                            onClick={() => fetchResults(pagination.currentPage + 1)}
                            disabled={!pagination.next}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const AlumniCard = ({ alumni, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card hover:border-indigo-500/50 transition-all group cursor-pointer"
        >
            <Link to={`/alumni/profile/${alumni.id}`} className="block">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-brand-textMain font-bold text-xl shrink-0">
                        {alumni.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-brand-textMain truncate group-hover:text-indigo-400 transition-colors">
                            {alumni.name}
                        </h3>
                        <p className="text-sm text-brand-textSecondary truncate">{alumni.headline}</p>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                    {alumni.current_company && (
                        <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                            <Briefcase size={16} className="text-brand-textSecondary shrink-0" />
                            <span className="truncate">{alumni.current_company}</span>
                        </div>
                    )}
                    {alumni.location && (
                        <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                            <MapPin size={16} className="text-brand-textSecondary shrink-0" />
                            <span className="truncate">{alumni.location}</span>
                        </div>
                    )}
                    {alumni.university && (
                        <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                            <Award size={16} className="text-brand-textSecondary shrink-0" />
                            <span className="truncate">{alumni.university}</span>
                        </div>
                    )}
                </div>

                {/* Skills */}
                {alumni.skills && alumni.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {alumni.skills.slice(0, 3).map((skill) => (
                            <span
                                key={skill.id}
                                className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded text-xs text-brand-primary"
                            >
                                {skill.name}
                            </span>
                        ))}
                        {alumni.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs text-brand-textSecondary">
                                +{alumni.skills.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Availability Badges */}
                <div className="flex gap-2">
                    {alumni.available_for_mentorship && (
                        <span className="px-2 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded text-xs text-emerald-300">
                            Mentorship
                        </span>
                    )}
                    {alumni.available_for_referrals && (
                        <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300">
                            Referrals
                        </span>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}

export default AlumniSearch
