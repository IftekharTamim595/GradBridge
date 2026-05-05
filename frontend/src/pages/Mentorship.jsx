import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { MessageCircle, Plus, X, Send, CheckCircle, AlertCircle, Clock, Search, Check, Ban } from 'lucide-react'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'

const Mentorship = () => {
  const [requests, setRequests] = useState([])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedAlumniId, setSelectedAlumniId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { showModal } = useModal()
  const { user } = useAuth()

  const filteredAlumni = alumni.filter(a => {
    const name = `${a.user?.first_name} ${a.user?.last_name}`.toLowerCase()
    const company = (a.current_company || '').toLowerCase()
    const pos = (a.current_position || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || company.includes(query) || pos.includes(query)
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, alumniRes] = await Promise.all([
        apiClient.get('/mentorship/mentorship-requests/'),
        apiClient.get('/profiles/alumni/available_mentors/'),
      ])
      setRequests(requestsRes.data.results || [])
      setAlumni(alumniRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showModal({ type: 'error', message: 'Failed to load mentorship data' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      receiver_id: formData.get('receiver_id'),
      message: formData.get('message'),
    }

    try {
      await apiClient.post('/mentorship/request/', data)
      await fetchData()
      setShowForm(false)
      showModal({ type: 'success', message: 'Mentorship request sent successfully!' })
    } catch (error) {
      console.error('Error sending request:', error)
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Error sending request'
      showModal({ type: 'error', message: errorMsg })
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await apiClient.post(`/mentorship/mentorship-requests/${requestId}/accept/`)
      showModal({ type: 'success', message: 'Request accepted!' })
      fetchData()
    } catch (error) {
      showModal({ type: 'error', message: error.response?.data?.error || 'Failed to accept request' })
    }
  }

  const handleReject = async (requestId) => {
    try {
      await apiClient.post(`/mentorship/mentorship-requests/${requestId}/reject/`)
      showModal({ type: 'success', message: 'Request rejected' })
      fetchData()
    } catch (error) {
      showModal({ type: 'error', message: error.response?.data?.error || 'Failed to reject request' })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-brand-success" size={20} />
      case 'rejected':
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <Clock className="text-yellow-400" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-green'
      case 'rejected': return 'badge-red'
      default:         return 'badge-amber'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
        <div className="text-brand-textSecondary">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Mentorship</p>
        <h1 className="font-heading text-3xl text-slate-900">Mentorship Requests</h1>
        <p className="text-slate-500 mt-1">
          {user?.role === 'alumni' 
            ? 'Manage mentorship requests from students.' 
            : 'Connect with alumni mentors for career guidance.'}
        </p>
      </div>
      <div>
        {user?.role !== 'alumni' && (
          <div className="flex justify-end mb-6">
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
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-brand-textMain">New Mentorship Request</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-brand-textSecondary hover:text-brand-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select a Mentor</label>
                
                {/* Search Box */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name, company, or skills..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Mentor Selection List */}
                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-slate-50/30">
                  {filteredAlumni.length > 0 ? filteredAlumni.map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAlumniId(a.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedAlumniId === a.id ? 'bg-brand-primary/10 ring-1 ring-inset ring-brand-primary/20' : 'hover:bg-white'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-alt flex items-center justify-center shrink-0 border border-slate-200">
                        {a.user?.first_name?.[0]}{a.user?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={`text-sm font-bold truncate ${selectedAlumniId === a.id ? 'text-brand-primary' : 'text-slate-800'}`}>
                            {a.user?.first_name} {a.user?.last_name}
                          </p>
                          {a.industry && <span className="text-[10px] text-slate-400 uppercase font-bold">{a.industry}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {a.current_position} {a.current_company && `at ${a.current_company}`}
                        </p>
                      </div>
                      {selectedAlumniId === a.id && <CheckCircle size={18} className="text-brand-primary" />}
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No mentors found matching your search.
                    </div>
                  )}
                </div>
                <input type="hidden" name="receiver_id" value={selectedAlumniId || ''} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-2">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="input-field"
                  placeholder="Why are you interested in mentorship from this alumni? What specific guidance are you seeking?"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-brand-border">
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
              <MessageCircle className="text-brand-primary" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-brand-textMain mb-2">No mentorship requests yet</h3>
            <p className="text-brand-textSecondary mb-6">
              {user?.role === 'alumni' ? 'You haven\'t received any requests yet.' : 'Start connecting with alumni mentors'}
            </p>
            {user?.role !== 'alumni' && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Request Mentorship</span>
              </button>
            )}
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-alt flex items-center justify-center border border-slate-200 text-brand-primary font-bold">
                      {user?.role === 'alumni' 
                        ? (request.student_profile?.user?.first_name?.[0] || '') + (request.student_profile?.user?.last_name?.[0] || '')
                        : (request.alumni_profile?.user?.first_name?.[0] || '') + (request.alumni_profile?.user?.last_name?.[0] || '')
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-textMain">
                        {user?.role === 'alumni' 
                          ? `${request.student_profile?.user?.first_name} ${request.student_profile?.user?.last_name}`
                          : `${request.alumni_profile?.user?.first_name} ${request.alumni_profile?.user?.last_name}`
                        }
                      </h3>
                      <p className="text-brand-textSecondary text-sm">
                        {user?.role === 'alumni' 
                          ? request.student_profile?.user?.email
                          : `${request.alumni_profile?.current_position || 'Alumni'} at ${request.alumni_profile?.current_company || 'Company'}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                  <p className="text-brand-textSecondary text-sm leading-relaxed">{request.message}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-brand-textMuted flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Sent on {new Date(request.created_at).toLocaleDateString()}</span>
                  </p>
                  
                  {user?.role === 'alumni' && request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReject(request.id)} 
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                      >
                        <Ban size={14} />
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAccept(request.id)} 
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Mentorship
