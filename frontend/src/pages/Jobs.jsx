import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Plus, Search, MapPin, Briefcase, Clock, DollarSign, ExternalLink, ChevronRight, X, ChevronDown, CheckCircle, Info, Filter, Trash2, Award, Sparkles } from 'lucide-react'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'
import SkillSelect from '../components/SkillSelect'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillNames, setSelectedSkillNames] = useState([])
  const { showModal } = useModal()
  const { user } = useAuth()

  useEffect(() => {
    fetchJobs()
    if (user?.role === 'student') {
      fetchRecommendations()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const response = await apiClient.get('/jobs/')
      setJobs(response.data.results || response.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await apiClient.get('/jobs/recommendations/')
      setRecommendations(response.data)
    } catch (e) {
      console.warn('AI Recommendations failed', e)
    }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      title: formData.get('title'),
      company_name: formData.get('company_name'),
      location: formData.get('location'),
      salary: formData.get('salary_range'),
      job_type: formData.get('job_type'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      apply_link: formData.get('apply_link'),
      skill_names: selectedSkillNames
    }
    
    try {
      await apiClient.post('/jobs/', data)
      fetchJobs()
      setShowPostForm(false)
      setSelectedSkillNames([])
      showModal({ type: 'success', message: 'Job posted successfully!' })
    } catch (e) {
      showModal({ type: 'error', message: 'Failed to post job' })
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await apiClient.delete(`/jobs/${jobId}/delete/`);
      setJobs(jobs.filter(j => j.id !== jobId));
      setRecommendations(recommendations.filter(j => j.id !== jobId));
      showModal({ type: 'success', message: 'Job deleted successfully' });
    } catch (e) {
      showModal({ type: 'error', message: e.response?.data?.error || 'Failed to delete job' });
    }
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <p className="text-xs font-mono-ui text-brand-primary uppercase tracking-widest mb-2">Career Hub</p>
          <h1 className="font-heading text-4xl text-slate-900">Opportunities</h1>
          <p className="text-slate-500 mt-2">Discover roles tailored for the GradBridge community</p>
        </div>
        
        {['alumni', 'external'].includes(user?.role) && (
          <button 
            onClick={() => setShowPostForm(true)}
            className="btn-primary shadow-lg shadow-brand-primary/20 gap-2"
          >
            <Plus size={20} />
            Post a Job
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Filters & Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card shadow-sm border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={18} className="text-slate-400" />
              Find Jobs
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search titles, companies..." 
                className="input-field !py-2.5 !text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Job Type</p>
              <div className="space-y-2">
                {['Full-time', 'Internship', 'Contract', 'Remote'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-brand-primary">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card bg-brand-alt border-brand-primary/10 shadow-none">
            <h4 className="font-bold text-brand-primary flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              AI Matching
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our AI analyzes your skills and projects to find the perfect career fit.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* AI Recommendations Section */}
          {user?.role === 'student' && recommendations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-brand-primary animate-pulse" size={20} />
                <h2 className="text-lg font-heading text-slate-800">Recommended for You</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((job) => (
                  <motion.div
                    key={`rec-${job.id}`}
                    whileHover={{ scale: 1.02 }}
                    className="card border-l-4 border-l-brand-primary shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-brand-alt p-2 rounded-lg">
                        <Briefcase size={20} className="text-brand-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">AI Match</span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{job.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{job.company}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* All Jobs List */}
          <section>
            <h2 className="text-lg font-heading text-slate-800 mb-4">All Opportunities</h2>
            <div className="space-y-4">
              {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  className="card group hover:border-brand-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                      <Briefcase className="text-slate-400 group-hover:text-brand-primary transition-colors" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-primary transition-colors truncate">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 uppercase tracking-wider">
                          {job.job_type}
                        </span>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="font-medium text-slate-700">{job.company_name}</span>
                          <span className="flex items-center gap-1 text-slate-400"><MapPin size={14} /> {job.location || 'Remote'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {user?.id === job.user && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Job"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => showModal({
                        type: 'custom',
                        title: 'Opportunity Details',
                        content: (
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-heading text-slate-900 mb-1">{job.title}</h2>
                              <p className="text-brand-primary font-medium">{job.company_name}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Job Type</p>
                                <p className="text-sm font-semibold text-slate-700">{job.job_type}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</p>
                                <p className="text-sm font-semibold text-slate-700">{job.location || 'Remote'}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Salary</p>
                                <p className="text-sm font-semibold text-slate-700">{job.salary || 'Competitive'}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Posted On</p>
                                <p className="text-sm font-semibold text-slate-700">{new Date(job.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Job Description</h4>
                              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                {job.description}
                              </div>
                            </div>

                            {job.requirements && (
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Requirements</h4>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                  {job.requirements}
                                </div>
                              </div>
                            )}

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                               <button 
                                 onClick={() => job.apply_link && window.open(job.apply_link, '_blank')}
                                 disabled={!job.apply_link}
                                 className="btn-primary flex-1 py-3 justify-center shadow-lg shadow-brand-primary/20"
                               >
                                 Apply Externally
                               </button>
                               <button 
                                 onClick={() => showModal({ type: 'info', message: 'Functionality coming soon!' })}
                                 className="btn-secondary flex-1 py-3 justify-center"
                               >
                                 Save Job
                               </button>
                               {user?.id === job.user && (
                                 <button 
                                   onClick={() => {
                                      showModal(null); // close modal
                                      handleDeleteJob(job.id);
                                   }}
                                   className="btn-secondary !text-red-500 hover:!bg-red-50 flex-1 py-3 justify-center border-red-100"
                                 >
                                   Delete Job
                                 </button>
                               )}
                            </div>
                          </div>
                        )
                      })}
                      className="btn-secondary !text-xs !py-2 !px-4 hover:bg-slate-100 transition-colors"
                    >
                      View Details
                    </button>
                    {job.apply_link && (
                      <button 
                        onClick={() => window.open(job.apply_link, '_blank')}
                        className="btn-primary !text-xs !py-2 !px-4 shadow-md shadow-brand-primary/10"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="card text-center py-20 bg-slate-50 border-dashed border-2">
                  <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400">No jobs found matching your search.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPostForm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-heading text-slate-900">Post New Opportunity</h2>
                <button onClick={() => setShowPostForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <form onSubmit={handlePostJob} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Job Title</label>
                    <input name="title" required className="input-field" placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Name</label>
                    <input name="company" required className="input-field" placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
                    <input name="location" className="input-field" placeholder="e.g. Remote / New York" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Salary Range</label>
                    <input name="salary_range" className="input-field" placeholder="e.g. $60k - $80k" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Job Type</label>
                    <select name="job_type" required className="input-field">
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Entry-level">Entry-level</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Application Link</label>
                    <input type="url" name="apply_link" className="input-field" placeholder="https://company.com/apply" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                  <textarea name="description" required rows={4} className="input-field" placeholder="Describe the role and responsibilities..." />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Requirements</label>
                  <textarea name="requirements" rows={3} className="input-field mb-4" placeholder="Key skills and qualifications..." />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Required Skills (Searchable)</label>
                  <SkillSelect 
                    selectedSkills={selectedSkillNames} 
                    onChange={setSelectedSkillNames} 
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowPostForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Post Opportunity</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Jobs
