import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Plus, Edit, Trash2, ExternalLink, Github, Globe, X, Save, AlertCircle, CheckCircle } from 'lucide-react'
import Footer from '../components/Footer'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects/')
      setProjects(response.data.results || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setMessage({ type: 'error', text: 'Failed to load projects' })
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    const formData = new FormData(e.target)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      tech_stack: formData.get('tech_stack'),
      github_link: formData.get('github_link'),
      live_link: formData.get('live_link'),

      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
      is_active: formData.get('is_active') === 'on',
      is_public: formData.get('is_public') === 'on',
    }

    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject.id}/`, data)
        showMessage('success', 'Project updated successfully!')
      } else {
        await apiClient.post('/projects/', data)
        showMessage('success', 'Project added successfully!')
      }
      await fetchProjects()
      setShowForm(false)
      setEditingProject(null)
    } catch (error) {
      console.error('Error saving project:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error saving project'
      showMessage('error', errorMsg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await apiClient.delete(`/projects/${id}/`)
      showMessage('success', 'Project deleted successfully!')
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      showMessage('error', 'Error deleting project')
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
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
            <p className="text-slate-400">Showcase your work and build your portfolio</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingProject(null)
              setShowForm(true)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Project</span>
          </motion.button>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingProject(null)
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingProject?.title || ''}
                  className="input-field"
                  placeholder="Project Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  defaultValue={editingProject?.description || ''}
                  className="input-field"
                  placeholder="Describe your project, what it does, and key features..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tech Stack</label>
                <input
                  type="text"
                  name="tech_stack"
                  defaultValue={editingProject?.tech_stack || ''}
                  placeholder="e.g., React, Django, PostgreSQL"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Link</label>
                  <input
                    type="url"
                    name="github_link"
                    defaultValue={editingProject?.github_link || ''}
                    className="input-field"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Live Link</label>
                  <input
                    type="url"
                    name="live_link"
                    defaultValue={editingProject?.live_link || ''}
                    className="input-field"
                    placeholder="https://yourproject.com"
                  />
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingProject?.start_date || ''}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingProject?.end_date || ''}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingProject?.is_active !== false}
                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">Active</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    defaultChecked={editingProject?.is_public !== false}
                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">Public (visible to alumni)</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProject(null)
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {projects.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-indigo-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6">Start building your portfolio by adding your first project</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Your First Project</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProject(project)
                        setShowForm(true)
                      }}
                      className="text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                {project.tech_stack && (
                  <p className="text-xs text-slate-500 mb-4">Tech: {project.tech_stack}</p>
                )}
                <div className="text-xs text-slate-500 mb-3 flex items-center space-x-2">
                  {project.start_date && <span>Started: {project.start_date}</span>}
                  {project.end_date && <span>• Completed: {project.end_date}</span>}
                </div>
                <div className="flex space-x-3 mb-4">
                  {project.github_link && (
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.live_link && (
                    <a
                      href={project.live_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Globe size={16} />
                      <span>Live</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-4 border-t border-slate-700">
                  <span className={`px-2 py-1 rounded text-xs ${project.is_active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                    }`}>
                    {project.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${project.is_public
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-700 text-slate-400'
                    }`}>
                    {project.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div >
  )
}

export default Projects
