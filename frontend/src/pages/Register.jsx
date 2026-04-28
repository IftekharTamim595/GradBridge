import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react'
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
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const parseError = (error) => {
    if (typeof error === 'string') return error
    if (typeof error === 'object' && error !== null) {
      if (error.password) return Array.isArray(error.password) ? error.password.join('. ') : error.password
      if (error.email)    return Array.isArray(error.email)    ? error.email.join('. ')    : error.email
      if (error.username) return Array.isArray(error.username) ? error.username.join('. ') : error.username
      if (error.non_field_errors) return Array.isArray(error.non_field_errors) ? error.non_field_errors.join('. ') : error.non_field_errors
      const firstKey = Object.keys(error)[0]
      const firstErr = error[firstKey]
      return Array.isArray(firstErr) ? firstErr[0] : firstErr
    }
    return 'Registration failed. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const result = await register(formData)
    if (result.success) {
      navigate(formData.role === 'student' ? '/student/dashboard' : '/alumni/dashboard')
    } else {
      setError(parseError(result.error))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-accent"
                 style={{ background: 'linear-gradient(135deg,#0052FF,#4D7CFF)' }}>
              <span className="text-white font-bold">GB</span>
            </div>
          </Link>
          <h1 className="font-heading text-3xl text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Join the GradBridge community</p>
        </div>

        {/* Card */}
        <div className="card shadow-lift">
          {/* Role toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
            {['student', 'alumni'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  formData.role === role
                    ? 'bg-white shadow-sm text-[#0052FF]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {role === 'student' ? <GraduationCap size={15} /> : <Briefcase size={15} />}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">First Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="first_name" required value={formData.first_name}
                    onChange={handleChange} placeholder="First" className="input-field pl-9 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Last Name</label>
                <input type="text" name="last_name" required value={formData.last_name}
                  onChange={handleChange} placeholder="Last" className="input-field py-2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" name="email" required value={formData.email}
                  onChange={handleChange} placeholder="you@university.edu" className="input-field pl-9 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Username</label>
              <input type="text" name="username" required value={formData.username}
                onChange={handleChange} placeholder="username" className="input-field py-2" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Min 8 characters" className="input-field pl-9 pr-9 py-2" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} name="password_confirm" required
                  value={formData.password_confirm} onChange={handleChange}
                  placeholder="Repeat password" className="input-field pl-9 py-2" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 shadow-accent disabled:opacity-60 mt-1">
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-mono-ui">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="space-y-2">
            <GoogleLoginButton 
              loginType={formData.role} 
              label={`Register with Google as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`} 
            />
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0052FF] font-medium hover:underline">Log in</Link>
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

export default Register
