import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'
import { useModal } from '../contexts/ModalContext'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
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

        try {
            const result = await login(email, password)
            if (result.success) {
                if (result.user.role === 'admin' || result.user.is_superuser) {
                    navigate('/admin/dashboard')
                } else {
                    showModal({ type: 'error', message: 'Access Denied. Not an admin account.' })
                }
            } else {
                showModal({ type: 'error', message: getErrorMessage(result.error) })
            }
        } catch (err) {
            showModal({ type: 'error', message: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-block group mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Admin Portal
                        </h2>
                        <p className="mt-2 text-slate-400">
                            Authorized personnel only
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />



                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Admin Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="input-field pl-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:bg-slate-800 transition-all"
                                        placeholder="admin@gradbridge.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="input-field pl-10 pr-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:bg-slate-800 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </span>
                                ) : (
                                    'Sign In to Dashboard'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                                Return to Student/Alumni Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    )
}

export default AdminLogin
