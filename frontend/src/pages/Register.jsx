import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, GraduationCap, ArrowRight, Eye, EyeOff, Briefcase } from 'lucide-react'
import GoogleLoginButton from '../components/GoogleLoginButton'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'student',
    first_name: '',
    last_name: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const parseError = (error) => {
    if (typeof error === 'string') {
      if (error.toLowerCase().includes('password') || error.toLowerCase().includes('too common') || error.toLowerCase().includes('too short')) {
        return 'Password is too weak. Please use a strong password with at least 8 characters.'
      }
      if (error.toLowerCase().includes('email')) {
        return 'Invalid email address.'
      }
      if (error.toLowerCase().includes('username')) {
        return 'Username is already taken.'
      }
      return error
    }

    if (typeof error === 'object' && error !== null) {
      if (error.password) {
        return Array.isArray(error.password) ? error.password.join('. ') : error.password
      }
      if (error.email) {
        return Array.isArray(error.email) ? error.email.join('. ') : error.email
      }
      if (error.username) {
        return Array.isArray(error.username) ? error.username.join('. ') : error.username
      }
      if (error.non_field_errors) {
        return Array.isArray(error.non_field_errors) ? error.non_field_errors.join('. ') : error.non_field_errors
      }
      const firstKey = Object.keys(error)[0]
      const firstError = error[firstKey]
      return Array.isArray(firstError) ? firstError[0] : firstError
    }

    return 'Registration failed. Please check your information and try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    const result = await register(formData)
    if (result.success) {
      navigate(`/${formData.role}/dashboard`)
    } else {
      setError(parseError(result.error))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-2xl">GB</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400">Join the GradBridge community</p>
        </div>

        <div className="card backdrop-blur-md bg-slate-800/60 border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                I am a
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  {formData.role === 'student' && <GraduationCap size={20} />}
                  {formData.role === 'alumni' && <User size={20} />}
                  {formData.role === 'recruiter' && <Briefcase size={20} />}
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field pl-10 appearance-none cursor-pointer bg-slate-900/50 focus:bg-slate-900 transition-colors"
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="recruiter">Recruiter / Hiring Manager</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field pl-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="username"
                  required
                  className="input-field pl-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="input-field bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="input-field bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="input-field pl-10 pr-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`flex-1 h-1 rounded ${formData.password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-700'
                      }`} />
                    <span className={`text-xs ${formData.password.length >= 8 ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                      {formData.password.length >= 8 ? 'Strong' : 'Weak'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_confirm"
                  required
                  className="input-field pl-10 pr-10 bg-slate-900/50 focus:bg-slate-900 transition-colors"
                  placeholder="Confirm password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-4 text-sm text-slate-500">OR</span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            <GoogleLoginButton />

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
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

export default Register
