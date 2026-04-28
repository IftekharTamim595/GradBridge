import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Plus, Edit, Trash2, Github, Globe, X, Save, AlertCircle, CheckCircle } from 'lucide-react'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects/')
      setProjects(res.data.results || [])
    } catch (e) {
      console.error('Error fetching projects:', e)
      setMessage({ type: 'error', text: 'Failed to load projects' })
    } finally { setLoading(false) }
  }

  const showMsg = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    const fd = new FormData(e.target)
    const data = {
      title:        fd.get('title'),
      description:  fd.get('description'),
      tech_stack:   fd.get('tech_stack'),
      github_link:  fd.get('github_link'),
      live_link:    fd.get('live_link'),
      start_date:   fd.get('start_date') || null,
      end_date:     fd.get('end_date') || null,
      is_active:    fd.get('is_active') === 'on',
      is_public:    fd.get('is_public') === 'on',
    }
    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject.id}/`, data)
        showMsg('success', 'Project updated successfully!')
      } else {
        await apiClient.post('/projects/', data)
        showMsg('success', 'Project added successfully!')
      }
      await fetchProjects()
      setShowForm(false)
      setEditingProject(null)
    } catch (e) {
      console.error(e)
      const msg = e.response?.data?.detail || e.response?.data?.message || 'Error saving project'
      showMsg('error', msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await apiClient.delete(`/projects/${id}/`)
      showMsg('success', 'Project deleted successfully!')
      await fetchProjects()
    } catch (e) {
      console.error(e)
      showMsg('error', 'Error deleting project')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Portfolio</p>
          <h1 className="font-heading text-3xl text-slate-900">My Projects</h1>
          <p className="text-slate-500 mt-1">Showcase your work and build your portfolio</p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingProject(null); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Project
        </motion.button>
      </div>

      {/* Message banner */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-5 p-3.5 rounded-xl flex items-center gap-2 text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </motion.div>
      )}

      {/* Project form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-heading text-xl text-slate-800">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingProject(null) }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Title *</label>
              <input type="text" name="title" required defaultValue={editingProject?.title || ''}
                className="input-field" placeholder="Project Title" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Description *</label>
              <textarea name="description" rows={4} required defaultValue={editingProject?.description || ''}
                className="input-field" placeholder="Describe your project, what it does, and key features…" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tech Stack</label>
              <input type="text" name="tech_stack" defaultValue={editingProject?.tech_stack || ''}
                placeholder="e.g., React, Django, PostgreSQL" className="input-field" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">GitHub Link</label>
                <input type="url" name="github_link" defaultValue={editingProject?.github_link || ''}
                  className="input-field" placeholder="https://github.com/…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Live Link</label>
                <input type="url" name="live_link" defaultValue={editingProject?.live_link || ''}
                  className="input-field" placeholder="https://yourproject.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Start Date</label>
                <input type="date" name="start_date" defaultValue={editingProject?.start_date || ''}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">End Date</label>
                <input type="date" name="end_date" defaultValue={editingProject?.end_date || ''}
                  className="input-field" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" defaultChecked={editingProject?.is_active !== false}
                  className="w-4 h-4 accent-[#0052FF]" />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_public" defaultChecked={editingProject?.is_public !== false}
                  className="w-4 h-4 accent-[#0052FF]" />
                <span className="text-sm text-slate-600">Public</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingProject(null) }}
                className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">
                <Save size={16} />
                Save
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects grid / empty state */}
      {projects.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-14"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: '#EFF4FF' }}>
            <Plus size={24} style={{ color: '#0052FF' }} />
          </div>
          <h3 className="font-heading text-xl text-slate-800 mb-2">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start building your portfolio by adding your first project</p>
          <button onClick={() => setShowForm(true)} className="btn-primary shadow-accent">
            <Plus size={18} />
            Add Your First Project
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -3 }}
              className="card group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-800 group-hover:text-[#0052FF] transition-colors leading-snug">
                  {project.title}
                </h3>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button onClick={() => { setEditingProject(project); setShowForm(true) }}
                    className="p-1.5 text-slate-400 hover:text-[#0052FF] rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-3 line-clamp-3 leading-relaxed">{project.description}</p>

              {project.tech_stack && (
                <p className="text-xs text-slate-400 mb-3 font-mono-ui">{project.tech_stack}</p>
              )}

              {(project.start_date || project.end_date) && (
                <p className="text-xs text-slate-400 mb-3">
                  {project.start_date && `Started: ${project.start_date}`}
                  {project.end_date && ` · Done: ${project.end_date}`}
                </p>
              )}

              <div className="flex gap-3 mb-4">
                {project.github_link && (
                  <a href={project.github_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#0052FF] hover:underline">
                    <Github size={13} /> GitHub
                  </a>
                )}
                {project.live_link && (
                  <a href={project.live_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#0052FF] hover:underline">
                    <Globe size={13} /> Live
                  </a>
                )}
              </div>

              <div className="flex gap-1.5 pt-3 border-t border-slate-100">
                <span className={`badge ${project.is_active ? 'badge-green' : 'badge-slate'}`}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`badge ${project.is_public ? 'badge-blue' : 'badge-slate'}`}>
                  {project.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
