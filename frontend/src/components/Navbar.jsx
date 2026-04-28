import { useState, useEffect } from 'react'
import apiClient from '../api/apiClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Bell, Search, Sparkles } from 'lucide-react'
import AIInsights from './AIInsights'
import SearchOverlay from './SearchOverlay'

const Navbar = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [aiInsightsOpen, setAIInsightsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Basic polling for notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications/')
        setNotifications(response.data.results || response.data)
      } catch (e) {
        console.warn('Failed to fetch notifications', e)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = async () => {
    try {
      await apiClient.post('/notifications/mark_all_read/')
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (e) { console.error(e) }
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    if (user.role === 'external') return '/'
    return `/${user.role}/dashboard`
  }

  // Public pages — hide on authenticated layouts (sidebar handles nav)
  const isPublicPage = ['/', '/login', '/register', '/hire', '/explore'].includes(location.pathname)
  const showNav = !isAuthenticated || isPublicPage

  // Shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="GradBridge Logo" 
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-[#0052FF]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-heading text-xl text-slate-900 tracking-tight">
              GradBridge
            </span>
          </Link>

          {/* Search — shown on authenticated pages */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-sm">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all text-slate-400 group"
              >
                <div className="flex items-center gap-2">
                  <Search size={15} className="group-hover:text-brand-primary transition-colors" />
                  <span>Search anything…</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold">
                  <span className="opacity-50">CTRL</span> K
                </div>
              </button>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Public nav links */}
            {showNav && !isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/" className="btn-ghost text-sm">Home</Link>
                <Link to="/hire" className="btn-ghost text-sm">Hire</Link>
                <button
                  onClick={() => setAIInsightsOpen(true)}
                  className="btn-ghost text-sm"
                >
                  <Sparkles size={15} />
                  AI Insights
                </button>
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* AI Insights */}
                <button
                  onClick={() => setAIInsightsOpen(true)}
                  className="btn-ghost p-2 rounded-xl"
                  title="AI Insights"
                >
                  <Sparkles size={18} />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative btn-ghost p-2 rounded-xl"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0052FF] rounded-full" />
                    )}
                  </button>

                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lift overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-[#0052FF] hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? notifications.map(notif => (
                          <Link
                            key={notif.id}
                            to={notif.related_link || '#'}
                            onClick={() => setNotificationsOpen(false)}
                            className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                          >
                            <p className="text-sm text-slate-700">{notif.message}</p>
                            <span className="text-xs text-slate-400 mt-0.5 block">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </Link>
                        )) : (
                          <div className="px-4 py-6 text-center text-slate-400 text-sm">
                            No notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">Log in</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2.5">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {aiInsightsOpen && (
        <AIInsights isOpen={aiInsightsOpen} onClose={() => setAIInsightsOpen(false)} />
      )}

      {searchOpen && (
        <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </>
  )
}

export default Navbar
