import { useState } from 'react'
import { getMediaUrl } from '../utils/url'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, User, Users, GraduationCap, MessageCircle,
  Globe, Briefcase, Sparkles, BarChart3, ChevronDown, LogOut,
  BookOpen, FileText
} from 'lucide-react'

const Sidebar = ({ onAIInsights }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavItems = () => {
    if (!user) return []
    const role = user.role

    if (role === 'student') return [
      { icon: LayoutDashboard, label: 'Dashboard',     path: '/student/dashboard' },
      { icon: User,            label: 'My Profile',    path: '/student/profile' },
      { icon: FileText,        label: 'Projects',      path: '/student/projects' },
      { icon: Briefcase,       label: 'Jobs',          path: '/jobs' },
      { icon: BookOpen,        label: 'Mentorship',    path: '/student/mentorship' },
      { icon: GraduationCap,   label: 'Explore Alumni',path: '/alumni/search' },
      { icon: MessageCircle,   label: 'Messages',      path: '/messages' },
      { icon: Sparkles,        label: 'Career AI',     action: onAIInsights },
    ]

    if (role === 'alumni') return [
      { icon: LayoutDashboard, label: 'Dashboard',     path: '/alumni/dashboard' },
      { icon: User,            label: 'My Profile',    path: '/alumni/profile' },
      { icon: Briefcase,       label: 'Post Jobs',     path: '/jobs' },
      { icon: Users,           label: 'Find Students', path: '/students/search' },
      { icon: MessageCircle,   label: 'Messages',      path: '/messages' },
      { icon: Sparkles,        label: 'AI Insights',   action: onAIInsights },
    ]

    if (role === 'admin') return [
      { icon: BarChart3,       label: 'Analytics',     path: '/admin/dashboard' },
      { icon: GraduationCap,   label: 'Explore Alumni',path: '/alumni/search' },
      { icon: Users,           label: 'Find Students', path: '/students/search' },
      { icon: Briefcase,       label: 'Jobs',          path: '/jobs' },
      { icon: MessageCircle,   label: 'Messages',      path: '/messages' },
      { icon: Sparkles,        label: 'AI Insights',   action: onAIInsights },
    ]

    if (role === 'external') return [
      { icon: Briefcase,       label: 'Hire',          path: '/hire' },
      { icon: Briefcase,       label: 'Jobs',          path: '/jobs' },
      { icon: MessageCircle,   label: 'Messages',      path: '/messages' },
      { icon: Sparkles,        label: 'AI Insights',   action: onAIInsights },
    ]

    return []
  }

  const navItems = getNavItems()
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email || 'User'
  const initials = (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') ||
    user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="sidebar-panel">
      {/* User profile summary */}
      <div className="p-3 border-b border-slate-100">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="avatar w-9 h-9 text-sm shrink-0">
            {user?.profile_photo
              ? <img src={getMediaUrl(user.profile_photo)} alt="" className="w-full h-full rounded-full object-cover" />
              : initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform shrink-0 ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {profileOpen && (
          <div className="mt-1.5 mx-1 space-y-0.5">
            {user?.role !== 'external' && (
              <Link
                to={`/${user?.role}/profile`}
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-sm text-slate-600 hover:text-[#0052FF] hover:bg-blue-50 rounded-lg transition-colors"
              >
                Edit Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Section label */}
        <p className="px-3 pb-2 pt-1 text-[10px] font-mono-ui font-medium text-slate-400 uppercase tracking-widest">
          Menu
        </p>

        {navItems.map((item, idx) => {
          if (item.action) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="sidebar-item w-full text-left"
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          }
          const active = isActive(item.path)
          return (
            <Link
              key={idx}
              to={item.path}
              className={active ? 'sidebar-item-active flex' : 'sidebar-item flex'}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-[11px] font-mono-ui text-slate-400 text-center">GradBridge © 2025</p>
      </div>
    </aside>
  )
}

export default Sidebar
