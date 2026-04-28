import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { MessageSquare, Send, ThumbsUp, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'student':  return 'badge-blue'
    case 'alumni':   return 'badge-green'
    case 'admin':    return 'badge-purple'
    case 'external': return 'badge-amber'
    default:         return 'badge-slate'
  }
}

const getAvatarBg = (role) => {
  switch (role) {
    case 'alumni':   return 'linear-gradient(135deg,#22C55E,#16A34A)'
    case 'admin':    return 'linear-gradient(135deg,#7C3AED,#4F46E5)'
    case 'external': return 'linear-gradient(135deg,#F59E0B,#D97706)'
    default:         return 'linear-gradient(135deg,#0052FF,#4D7CFF)'
  }
}

const formatDate = (ds) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ds))

const Community = () => {
  const { user, isAuthenticated } = useAuth()
  const { showModal } = useModal()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [filter, setFilter] = useState('all')
  const [posting, setPosting] = useState(false)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/community/posts/')
      setPosts(res.data.results || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    if (!isAuthenticated) {
      showModal({ type: 'error', message: 'You must be logged in to post.' })
      return
    }
    setPosting(true)
    try {
      await apiClient.post('/community/posts/', { content: newPost })
      setNewPost('')
      fetchPosts()
      showModal({ type: 'success', message: 'Posted successfully!' })
    } catch (e) {
      console.error(e)
      showModal({ type: 'error', message: 'Failed to create post.' })
    } finally { setPosting(false) }
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.author?.role === filter)
  const initials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() || 'U'

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Feed</p>
        <h1 className="font-heading text-3xl text-slate-900">Community Board</h1>
        <p className="text-slate-500 mt-1">Connect and share updates with the GradBridge network.</p>
      </motion.div>

      {/* Compose box */}
      {isAuthenticated && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card mb-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                 style={{ background: getAvatarBg(user?.role) }}>
              {initials(user?.first_name, user?.last_name)}
            </div>
            <form onSubmit={handlePostSubmit} className="flex-1">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="input-field resize-none min-h-[80px]"
                rows={3}
              />
              <div className="flex justify-end mt-2.5">
                <button type="submit" disabled={posting || !newPost.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={15} />
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 w-fit">
        {['all', 'student', 'alumni', 'admin'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              filter === tab
                ? 'bg-white shadow-sm text-[#0052FF]'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? filteredPosts.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="card"
          >
            {/* Post header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                     style={{ background: getAvatarBg(post.author?.role) }}>
                  {initials(post.author?.first_name, post.author?.last_name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">
                      {post.author?.first_name} {post.author?.last_name}
                    </span>
                    <span className={`badge ${getRoleBadgeClass(post.author?.role)} text-[10px]`}>
                      {post.author?.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Clock size={11} />
                    {post.created_at ? formatDate(post.created_at) : 'Just now'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-5 pt-3 border-t border-slate-100">
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#0052FF] transition-colors text-sm">
                <ThumbsUp size={15} />
                Like
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#0052FF] transition-colors text-sm">
                <MessageSquare size={15} />
                Comment
              </button>
            </div>
          </motion.article>
        )) : (
          <div className="card text-center py-14">
            <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-heading text-xl text-slate-700">Nothing here yet</h3>
            <p className="text-slate-400 text-sm mt-1">Be the first to share something with the community!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
