import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Briefcase, User as UserIcon } from 'lucide-react'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useModal } from '../contexts/ModalContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roleSelection, setRoleSelection] = useState('student')
  const { login } = useAuth()
  const { showModal } = useModal()
  const navigate = useNavigate()

  const getErrorMessage = (errorData) => {
    const data = errorData
    if (!data) return 'An unexpected error occurred'
    if (typeof data === 'string') return data
    if (Array.isArray(data)) return data.join('\n')
    if (typeof data === 'object') {
      if (data.error) return data.error
      if (data.detail) return data.detail
      if (data.message) return data.message
      return Object.entries(data).map(([key, value]) => {
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
        const messages = Array.isArray(value) ? value.join(' ') : value
        return `${fieldName}: ${messages}`
      }).join('\n')
    }
    return 'An unexpected error occurred'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = user.role || 'student'
      navigate(`/${role}/dashboard`)
    } else {
      showModal({ type: 'error', message: getErrorMessage(result.error) })
    }
    setLoading(false)
  }

  const handleGuestLogin = () => navigate('/hire')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <img 
              src="/logo.png" 
              alt="GradBridge" 
              className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" 
            />
            <span className="font-heading text-3xl text-slate-900 tracking-tight">GradBridge</span>
          </Link>
          <h1 className="font-heading text-3xl text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Empowering your professional journey</p>
        </div>

        {/* Card */}
        <div className="card shadow-lift border border-slate-100">
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">I am a...</label>
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setRoleSelection('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${roleSelection === 'student' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserIcon size={16} />
                Student
              </button>
              <button 
                onClick={() => setRoleSelection('alumni')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${roleSelection === 'alumni' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Briefcase size={16} />
                Alumni
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-10 !bg-slate-50/50"
                  placeholder="University email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pl-10 pr-10 !bg-slate-50/50"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 shadow-lg shadow-brand-primary/20 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : `Sign in as ${roleSelection}`}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Social Connect</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="space-y-3">
            <GoogleLoginButton loginType={roleSelection} label={`Sign in with Google`} />
            
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
            >
              <Briefcase size={14} />
              Continue as Guest Recruiter
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0052FF] font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
