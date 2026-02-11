import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext';
import {
    User, MapPin, GraduationCap, Award, Briefcase,
    Mail, Lock, Globe, Github, Linkedin, ExternalLink,
    Sparkles, AlertCircle, Building, Clock
} from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import Footer from '../components/Footer'
import AIInsights from '../components/AIInsights'
import { useModal } from '../contexts/ModalContext'

const AlumniProfileView = () => {

    const { id } = useParams()
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const { openChatWithUser } = useChat()
    const { showModal } = useModal()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [aiInsightsOpen, setAIInsightsOpen] = useState(false)

    useEffect(() => {
        if (!authLoading) {
            fetchProfile()
        }
    }, [id, authLoading])

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get(`/profiles/alumni/${id}/`)
            setProfile(response.data)
        } catch (error) {
            if (error.response?.status === 403) {
                setError('This profile is private. You do not have permission to view it.')
            } else if (error.response?.status === 404) {
                setError('Profile not found.')
            } else {
                setError('Failed to load profile.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        if (profile?.user) {
            openChatWithUser(profile.user)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="text-slate-400 font-medium">Loading profile...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
                <div className="max-w-md mx-auto px-4 py-20">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
                        <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-white mb-2 text-balance">Access Restricted</h2>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-slate-950 pt-16 font-sans antialiased text-slate-200">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Profile Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Main Info Card */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden"
                    >
                        {/* Header Content */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                    {profile.user?.profile_photo ? (
                                        <img
                                            src={profile.user.profile_photo}
                                            alt={`${profile.user.first_name} ${profile.user.last_name}`}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {profile.user?.first_name?.[0]}{profile.user?.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border-2 border-slate-800">
                                    <Briefcase className="text-indigo-400" size={20} />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-balance mb-2">
                                        {profile.user?.first_name} {profile.user?.last_name}
                                    </h1>
                                    <p className="text-lg text-indigo-400 font-medium">{profile.current_position || 'Alumni'}</p>
                                    {profile.current_company && (
                                        <div className="flex items-center text-slate-300 mt-1">
                                            <Building className="mr-2" size={16} />
                                            <span>{profile.current_company}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                                    {profile.city && profile.country && (
                                        <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                                            <MapPin size={14} aria-hidden="true" />
                                            <span>{profile.city}, {profile.country}</span>
                                        </div>
                                    )}
                                    {profile.industry && (
                                        <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                                            <Briefcase size={14} aria-hidden="true" />
                                            <span>{profile.industry}</span>
                                        </div>
                                    )}
                                    {profile.years_of_experience && (
                                        <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                                            <Clock size={14} aria-hidden="true" />
                                            <span>{profile.years_of_experience} Experience</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <button
                                        onClick={handleSendMessage}
                                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                        aria-label={`Send message to ${profile.user?.first_name}`}
                                    >
                                        <Mail size={18} aria-hidden="true" />
                                        <span>Message</span>
                                    </button>

                                    {profile.available_for_mentorship && (
                                        <button
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    navigate('/login')
                                                    return
                                                }
                                                // Function to handle mentorship request submission
                                                const submitMentorshipRequest = async (message) => {
                                                    try {
                                                        await apiClient.post('/mentorship/requests/', {
                                                            alumni_profile: profile.id,
                                                            message: message
                                                        })
                                                        showModal({ type: 'success', message: 'Mentorship request sent successfully!' })
                                                    } catch (err) {
                                                        const errMsg = err.response?.data?.detail || 'Failed to send mentorship request.'
                                                        showModal({ type: 'error', message: errMsg })
                                                    }
                                                }

                                                showModal({
                                                    type: 'custom',
                                                    title: 'Request Mentorship',
                                                    content: (
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                const formData = new FormData(e.target);
                                                                submitMentorshipRequest(formData.get('message'));
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            <p className="text-slate-300 text-sm">
                                                                Introduce yourself and explain why you'd like mentorship from {profile.user?.first_name}.
                                                            </p>
                                                            <textarea
                                                                name="message"
                                                                rows={4}
                                                                required
                                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                placeholder="Hi, I'm a student at..."
                                                            />
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="submit"
                                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                                                                >
                                                                    Send Request
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )
                                                })
                                            }}
                                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                                        >
                                            <Sparkles size={18} aria-hidden="true" />
                                            <span>Request Mentorship</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
                                <p className="text-slate-300 leading-relaxed max-w-3xl text-pretty">
                                    {profile.bio}
                                </p>
                            </div>
                        )}
                    </motion.section>

                    {/* Sidebar Info */}
                    <motion.aside
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Availability */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Availability</h3>
                            <div className="space-y-3">
                                {profile.available_for_mentorship && (
                                    <div className="flex items-center text-emerald-400">
                                        <Sparkles size={18} className="mr-2" />
                                        <span>Open for Mentorship</span>
                                    </div>
                                )}
                                {profile.available_for_referrals && (
                                    <div className="flex items-center text-indigo-400">
                                        <Briefcase size={18} className="mr-2" />
                                        <span>Open for Referrals</span>
                                    </div>
                                )}
                                {!profile.available_for_mentorship && !profile.available_for_referrals && (
                                    <div className="text-slate-400">Not currently available for extra activities.</div>
                                )}
                            </div>
                        </div>

                        {/* Links */}
                        {profile.linkedin_url && (
                            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Connect</h3>
                                <div className="space-y-3">
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                                    >
                                        <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">LinkedIn</span>
                                        <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </div>

                {/* Credentials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                    {/* Education Details */}
                    {(profile.university || profile.degree) && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <GraduationCap className="text-indigo-400" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Academic Background</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="pl-4 border-l-2 border-slate-800 hover:border-indigo-500/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-white">{profile.university}</h3>
                                    <p className="text-indigo-400">{profile.degree}</p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                                        {profile.batch && <span>Batch: {profile.batch}</span>}
                                        {profile.graduation_year && <span>Graduation: {profile.graduation_year}</span>}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-pink-500/10 rounded-xl">
                                    <Award className="text-pink-400" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Skills & Expertise</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-full transition-colors border border-slate-700 hover:border-slate-600 cursor-default"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default AlumniProfileView
