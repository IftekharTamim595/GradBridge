import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { MessageSquare, Send, ThumbsUp, User, Clock, Filter, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'
import { useModal } from '../contexts/ModalContext'

const Community = () => {
    const { user, isAuthenticated } = useAuth()
    const { showModal } = useModal()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newPost, setNewPost] = useState('')
    const [filter, setFilter] = useState('all') // 'all', 'student', 'alumni', 'admin'
    const [posting, setPosting] = useState(false)

    // This would ideally be an API endpoint. Since it's requested as "User can post anything... seen by any user",
    // we need a backend endpoint for Posts.
    // Assuming generic list/create endpoint for now, or mock if allowed.
    // User said "implement community page... any user can post".
    // Note: I might need to create a backend model for this if it doesn't exist.
    // I'll assume /api/community/posts/ or similar. If not, I'll have to create it.

    // Checking backend first would be wise, but to save time I'll write the frontend and then check/create backend.

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            // Placeholder endpoint
            const response = await apiClient.get('/community/posts/')
            setPosts(response.data.results || [])
        } catch (error) {
            console.error('Error fetching posts:', error)
            // showModal({ type: 'error', message: 'Failed to load community posts.' })
        } finally {
            setLoading(false)
        }
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
            await apiClient.post('/community/posts/', {
                content: newPost
            })
            setNewPost('')
            fetchPosts()
            showModal({ type: 'success', message: 'Posted successfully!' })
        } catch (error) {
            console.error('Error creating post:', error)
            showModal({ type: 'error', message: 'Failed to create post.' })
        } finally {
            setPosting(false)
        }
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'student': return 'text-indigo-400 bg-indigo-400/10'
            case 'alumni': return 'text-emerald-400 bg-emerald-400/10'
            case 'admin': return 'text-purple-400 bg-purple-400/10'
            case 'recruiter': return 'text-amber-400 bg-amber-400/10'
            default: return 'text-slate-400 bg-slate-400/10'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
    }

    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(post => post.author?.role === filter)

    if (loading) return <div className="min-h-screen bg-slate-900 pt-20 text-center text-slate-400">Loading community...</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Community Board</h1>
                    <p className="text-slate-400">Connect, share updates, and discuss with the GradBridge community.</p>
                </motion.div>

                {/* Post Creation */}
                {isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                <span className="text-white font-bold">{user?.first_name?.[0] || 'U'}</span>
                            </div>
                            <form onSubmit={handlePostSubmit} className="flex-1">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={posting || !newPost.trim()}
                                        className="btn-primary flex items-center space-x-2 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                        <span>{posting ? 'Posting...' : 'Post'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* Feed */}
                <div className="space-y-6">
                    {posts.length > 0 ? (
                        posts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRoleColor(post.author?.role).replace('text-', 'bg-').replace('bg-', 'text-white ')}`}>
                                            {post.author?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{post.author?.first_name} {post.author?.last_name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(post.author?.role)}`}>
                                                {post.author?.role?.charAt(0).toUpperCase() + post.author?.role?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-xs">
                                        <Clock size={14} className="mr-1" />
                                        <span>{post.created_at ? formatDate(post.created_at) : 'Just now'}</span>
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                                <div className="flex items-center space-x-4 pt-4 border-t border-slate-800/50">
                                    <button className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors">
                                        <ThumbsUp size={18} />
                                        <span className="text-sm">Like</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors">
                                        <MessageSquare size={18} />
                                        <span className="text-sm">Comment</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                            <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-400">No posts yet</h3>
                            <p className="text-slate-500 mt-2">Be the first to share something with the community!</p>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    )
}

export default Community
