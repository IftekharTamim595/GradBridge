import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Briefcase } from 'lucide-react'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useModal } from '../contexts/ModalContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showModal } = useModal()
  const navigate = useNavigate()

  const getErrorMessage = (errorData) => {
    // AuthContext login now returns the data object directly as result.error
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
    const result = await login(email, password)
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = user.role || 'student'; // Fallback to student if role is missing
      navigate(`/${role}/dashboard`)
    } else {
      showModal({ type: 'error', message: getErrorMessage(result.error) })
    }
    setLoading(false)
  }

  const handleGuestLogin = () => {
    // For now, redirect to hire page or a guest dashboard if implemented
    // Or auto-fill a guest account. 
    // User request: "keep another role of guest sign in... access of hire menu"
    // Simplest approach: Navigate to hire page as public/guest if allowed, or show alert.
    // Better: Redirect to registration with 'recruiter' pre-selected or just hire page.
    // Implementation: We will just navigate to /hire for now as it checks auth internally or we can make it public.
    navigate('/hire')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 mt-8"> {/* Added mt-8 to bring logo down */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-2xl">GB</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your GradBridge account</p>
        </div>

        <div className="card backdrop-blur-md bg-slate-800/60 border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">


            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-700"></div>
            <span className="px-4 text-sm text-slate-500">OR</span>
            <div className="flex-1 border-t border-slate-700"></div>
          </div>

          <div className="space-y-3">
            <GoogleLoginButton />

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-slate-600/50 hover:border-slate-500"
            >
              <Briefcase size={18} />
              <span>Continue as Recruiter / Guest</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                Register here
              </Link>
            </p>

          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center justify-center space-x-1">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
