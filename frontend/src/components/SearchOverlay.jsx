import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, Briefcase, GraduationCap, ArrowRight, Command } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ students: [], alumni: [], jobs: [] })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (query.length < 2) {
      setResults({ students: [], alumni: [], jobs: [] })
      return
    }

    const delay = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`/search/global/?q=${query}`)
        setResults(response.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delay)
  }, [query])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const navigateTo = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-6 flex items-center gap-4 border-b border-slate-100">
              <Search className="text-brand-primary" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="Search for people, jobs, or skills..."
                className="flex-1 bg-transparent border-none outline-none text-xl text-slate-800 placeholder-slate-400"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                <Command size={10} /> esc
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-8">
              {loading && (
                <div className="py-10 text-center">
                  <div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Searching GradBridge...</p>
                </div>
              )}

              {!loading && query.length > 0 && !results.students.length && !results.alumni.length && !results.jobs.length && (
                <div className="py-10 text-center">
                  <p className="text-slate-400">No results found for "{query}"</p>
                </div>
              )}

              {/* Jobs */}
              {results.jobs?.length > 0 && (
                <div>
                  <h3 className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jobs & Opportunities</h3>
                  <div className="space-y-1">
                    {results.jobs.map(job => (
                      <div 
                        key={job.id} 
                        onClick={() => navigateTo(`/jobs`)}
                        className="p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors">
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{job.title}</p>
                            <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alumni */}
              {results.alumni?.length > 0 && (
                <div>
                  <h3 className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alumni Mentors</h3>
                  <div className="space-y-1">
                    {results.alumni.map(alumnus => (
                      <div 
                        key={alumnus.id} 
                        onClick={() => navigateTo(`/alumni/${alumnus.id}`)}
                        className="p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-alt rounded-xl flex items-center justify-center text-brand-primary">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{alumnus.user?.first_name} {alumnus.user?.last_name}</p>
                            <p className="text-xs text-slate-500">{alumnus.current_position} at {alumnus.current_company}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students */}
              {results.students?.length > 0 && (
                <div>
                  <h3 className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</h3>
                  <div className="space-y-1">
                    {results.students.map(student => (
                      <div 
                        key={student.id} 
                        onClick={() => navigateTo(`/students/${student.id}`)}
                        className="p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{student.user?.first_name} {student.user?.last_name}</p>
                            <p className="text-xs text-slate-500">{student.degree} • {student.university}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><ArrowRight size={10} /> select</span>
                 <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Command size={10} /> K to search</span>
              </div>
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Search GradBridge</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SearchOverlay
