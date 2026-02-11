import { useState, useEffect } from 'react'
import apiClient from '../api/apiClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Bell, User, LogOut, Menu, X, Sparkles } from 'lucide-react'
import AIInsights from './AIInsights'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [aiInsightsOpen, setAIInsightsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Basic polling for notifications (could be replaced by WebSocket)
  useEffect(() => {
    // Only fetch notifications when auth is ready and user is authenticated
    if (!isAuthenticated || !user) return;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications/')
        setNotifications(response.data.results || response.data)
      } catch (e) {
        // Silent fail for notifications
        console.warn("Failed to fetch notifications", e);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await apiClient.post('/notifications/mark_all_read/')
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e) }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileDropdownOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    if (user.role === 'external') return '/'
    return `/${user.role}/dashboard`
  }

  // Build navigation links based on user role
  const getNavLinks = () => {
    const links = [{ name: 'Home', path: '/' }]

    if (isAuthenticated && user) {
      if (user.role === 'student') {
        links.push(
          { name: 'Explore Alumni', path: '/alumni/search' },
          { name: 'Messages', path: '/messages' },
          { name: 'Community', path: '/community' },
          { name: 'Hire', path: '/hire' },
          { name: 'AI Insights', path: '#', action: () => setAIInsightsOpen(true) }
        )
      } else if (user.role === 'alumni') {
        links.push(
          { name: 'Explore Students', path: '/students/search' },
          { name: 'Messages', path: '/messages' },
          { name: 'Community', path: '/community' },
          { name: 'Hire', path: '/hire' },
          { name: 'AI Insights', path: '#', action: () => setAIInsightsOpen(true) }
        )
      } else if (user.role === 'external') {
        links.push(
          { name: 'Hire', path: '/hire' },
          { name: 'Messages', path: '/messages' },
          { name: 'AI Insights', path: '#', action: () => setAIInsightsOpen(true) }
        )
      } else if (user.role === 'admin') {
        links.push(
          { name: 'Explore Alumni', path: '/alumni/search' },
          { name: 'Explore Students', path: '/students/search' },
          { name: 'Messages', path: '/messages' },
          { name: 'Community', path: '/community' },
          { name: 'Hire', path: '/hire' },
          { name: 'AI Insights', path: '#', action: () => setAIInsightsOpen(true) },
          { name: 'Analytics', path: '/admin/dashboard' }
        )
      }
    } else {
      // Not authenticated
      links.push(
        { name: 'Hire', path: '/hire' },
        { name: 'AI Insights', path: '#', action: () => setAIInsightsOpen(true) }
      )
    }

    return links
  }

  const navLinks = getNavLinks()
  const isActive = (path) => location.pathname === path

  const NavLink = ({ link }) => {
    if (link.action) {
      return (
        <button
          onClick={link.action}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1"
        >
          <Sparkles size={16} />
          <span>{link.name}</span>
        </button>
      )
    }
    return (
      <Link
        to={link.path}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
      >
        {link.name}
      </Link>
    )
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={getDashboardLink()} className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GB</span>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                GradBridge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <NavLink key={index} link={link} />
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                          <h3 className="font-semibold text-white text-sm">Notifications</h3>
                          <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(notif => (
                              <Link
                                key={notif.id}
                                to={notif.related_link || '#'}
                                onClick={() => setNotificationsOpen(false)}
                                className={`block p-3 border-b border-slate-700/50 hover:bg-slate-700 transition-colors ${!notif.is_read ? 'bg-slate-700/30' : ''}`}
                              >
                                <p className="text-sm text-slate-300 mb-1">{notif.message}</p>
                                <span className="text-xs text-slate-500">{new Date(notif.created_at).toLocaleDateString()}</span>
                              </Link>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-500 text-sm">
                              No notifications
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-all"
                    >
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="hidden sm:block text-sm text-slate-300">{user?.email}</span>
                    </button>

                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                      >
                        {user?.role !== 'external' && (
                          <>
                            <Link
                              to={`/${user?.role}/profile`}
                              onClick={() => setProfileDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                              Profile Update
                            </Link>
                            <Link
                              to={getDashboardLink()}
                              onClick={() => setProfileDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                              Dashboard
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center space-x-2"
                        >
                          <LogOut size={14} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-900"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                link.action ? (
                  <button
                    key={index}
                    onClick={() => {
                      link.action()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* AI Insights Panel */}
      {aiInsightsOpen && (
        <AIInsights isOpen={aiInsightsOpen} onClose={() => setAIInsightsOpen(false)} />
      )}
    </>
  )
}

export default Navbar
