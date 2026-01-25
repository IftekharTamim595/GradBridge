import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { MessageCircle, Plus, X, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Footer from '../components/Footer'

const Mentorship = () => {
  const [requests, setRequests] = useState([])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, alumniRes] = await Promise.all([
        axios.get('http://localhost:8000/api/mentorship/mentorship-requests/'),
        axios.get('http://localhost:8000/api/profiles/alumni/available_mentors/'),
      ])
      setRequests(requestsRes.data.results || [])
      setAlumni(alumniRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Failed to load mentorship data' })
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
      alumni_profile_id: formData.get('alumni_profile_id'),
      message: formData.get('message'),
    }

    try {
      await axios.post('http://localhost:8000/api/mentorship/mentorship-requests/', data)
      await fetchData()
      setShowForm(false)
      showMessage('success', 'Mentorship request sent successfully!')
    } catch (error) {
      console.error('Error sending request:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error sending request'
      showMessage('error', errorMsg)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-emerald-400" size={20} />
      case 'rejected':
        return <AlertCircle className="text-red-400" size={20} />
      default:
        return <Clock className="text-yellow-400" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
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
            <h1 className="text-4xl font-bold text-white mb-2">Mentorship Requests</h1>
            <p className="text-slate-400">Connect with alumni mentors for career guidance</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Request Mentorship</span>
          </motion.button>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
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
              <h2 className="text-2xl font-semibold text-white">New Mentorship Request</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Alumni</label>
                <select
                  name="alumni_profile_id"
                  required
                  className="input-field"
                >
                  <option value="">Choose an alumni...</option>
                  {alumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.user?.email} - {a.current_position || 'Alumni'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="input-field"
                  placeholder="Why are you interested in mentorship from this alumni? What specific guidance are you seeking?"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Send size={18} />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {requests.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-indigo-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No mentorship requests yet</h3>
            <p className="text-slate-400 mb-6">Start connecting with alumni mentors</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Request Mentorship</span>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {request.alumni_profile?.user?.email}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {request.alumni_profile?.current_position || 'Alumni'} at {request.alumni_profile?.current_company || 'Company'}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status}</span>
                  </div>
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed">{request.message}</p>
                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Sent on {new Date(request.created_at).toLocaleDateString()}</span>
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Mentorship
