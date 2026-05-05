import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { getMediaUrl } from '../utils/url'
import { useAuth } from '../contexts/AuthContext';
import {
    User, MapPin, GraduationCap, Award, Briefcase,
    Mail, Lock, Globe, Github, Linkedin, ExternalLink,
    Sparkles, AlertCircle, Building, Clock
} from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
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
                setError("The profile is private, you can't access this page")
                setTimeout(() => {
                    navigate(-1)
                }, 3000)
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
            <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="text-brand-textSecondary font-medium">Loading profile...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto px-4 py-20">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="font-heading text-2xl text-slate-800 mb-2">Access Restricted</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <Link to="/" className="btn-secondary">Go Home</Link>
                </div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Profile Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* Main Info Card */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-2xl p-8 shadow-xl relative overflow-hidden"
                    >
                        {/* Header Content */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                    {profile.profile_picture || profile.user?.profile_photo ? (
                                        <img
                                            src={getMediaUrl(profile.profile_picture || profile.user.profile_photo)}
                                            alt={`${profile.user?.first_name} ${profile.user?.last_name}`}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-brand-textMain">
                                            {profile.user?.first_name?.[0]}{profile.user?.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-brand-bg rounded-lg flex items-center justify-center border-2 border-brand-border">
                                    <Briefcase className="text-brand-primary" size={20} />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-brand-textMain tracking-tight text-balance mb-2">
                                        {profile.user?.first_name} {profile.user?.last_name}
                                    </h1>
                                    <p className="text-lg text-brand-primary font-medium">{profile.current_position || 'Alumni'}</p>
                                    {profile.current_company && (
                                        <div className="flex items-center text-brand-textSecondary mt-1">
                                            <Building className="mr-2" size={16} />
                                            <span>{profile.current_company}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-brand-textSecondary text-sm">
                                    {profile.city && profile.country && (
                                        <div className="flex items-center space-x-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-lg">
                                            <MapPin size={14} aria-hidden="true" />
                                            <span>{profile.city}, {profile.country}</span>
                                        </div>
                                    )}
                                    {profile.industry && (
                                        <div className="flex items-center space-x-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-lg">
                                            <Briefcase size={14} aria-hidden="true" />
                                            <span>{profile.industry}</span>
                                        </div>
                                    )}
                                    {profile.years_of_experience && (
                                        <div className="flex items-center space-x-1.5 bg-white border border-brand-border px-3 py-1.5 rounded-lg">
                                            <Clock size={14} aria-hidden="true" />
                                            <span>{profile.years_of_experience} Experience</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <button
                                        onClick={handleSendMessage}
                                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
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
                                                const submitMentorshipRequest = async (message) => {
                                                    try {
                                                        const res = await apiClient.post('/mentorship/request/', {
                                                            receiver_id: profile.id,
                                                            message: message
                                                        })
                                                        showModal({ type: 'success', message: res.data.message || 'Request sent successfully' })
                                                    } catch (err) {
                                                        const errMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to send mentorship request.'
                                                        showModal({ type: 'error', message: errMsg })
                                                    }
                                                }

                                                showModal({
                                                    type: 'custom',
                                                    title: 'Request Mentorship',
                                                    hideButtons: true,
                                                    content: (
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                const formData = new FormData(e.target);
                                                                submitMentorshipRequest(formData.get('message'));
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            <p className="text-brand-textSecondary text-sm">
                                                                Introduce yourself and explain why you'd like mentorship from {profile.user?.first_name}.
                                                            </p>
                                                            <textarea
                                                                name="message"
                                                                rows={4}
                                                                required
                                                                className="w-full bg-white border border-brand-border shadow-sm hover:shadow-md transition-all duration-200 border border-brand-border rounded-lg p-3 text-brand-textMain focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                placeholder="Hi, I'm a student at..."
                                                            />
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="submit"
                                                                    className="px-4 py-2 bg-brand-success text-white hover:bg-emerald-500 rounded-lg font-medium transition-colors"
                                                                >
                                                                    Send Request
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )
                                                })
                                            }}
                                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-success text-white hover:bg-emerald-500 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                                        >
                                            <Sparkles size={18} aria-hidden="true" />
                                            <span>Request Mentorship</span>
                                        </button>
                                    )}

                                    {profile.available_for_referrals && (
                                        <button
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    navigate('/login')
                                                    return
                                                }
                                                const submitReferralRequest = async (data) => {
                                                    try {
                                                        const res = await apiClient.post('/mentorship/referral-requests/', {
                                                            alumni_profile_id: profile.id,
                                                            target_company: data.target_company,
                                                            target_role: data.target_role,
                                                            message: data.message
                                                        })
                                                        showModal({ type: 'success', message: 'Referral request sent successfully' })
                                                    } catch (err) {
                                                        const errMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to send referral request.'
                                                        showModal({ type: 'error', message: errMsg })
                                                    }
                                                }

                                                showModal({
                                                    type: 'custom',
                                                    title: 'Ask for Referral',
                                                    hideButtons: true,
                                                    content: (
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                const formData = new FormData(e.target);
                                                                submitReferralRequest(Object.fromEntries(formData));
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-medium text-brand-textSecondary">Company</label>
                                                                    <input
                                                                        name="target_company"
                                                                        type="text"
                                                                        required
                                                                        className="w-full bg-white border border-brand-border rounded-lg p-2 text-sm text-brand-textMain outline-none focus:ring-2 focus:ring-brand-primary"
                                                                        placeholder="e.g. Google"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-medium text-brand-textSecondary">Position</label>
                                                                    <input
                                                                        name="target_role"
                                                                        type="text"
                                                                        required
                                                                        className="w-full bg-white border border-brand-border rounded-lg p-2 text-sm text-brand-textMain outline-none focus:ring-2 focus:ring-brand-primary"
                                                                        placeholder="e.g. Software Engineer"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-medium text-brand-textSecondary">Message</label>
                                                                <textarea
                                                                    name="message"
                                                                    rows={3}
                                                                    required
                                                                    className="w-full bg-white border border-brand-border rounded-lg p-2 text-sm text-brand-textMain outline-none focus:ring-2 focus:ring-brand-primary"
                                                                    placeholder="Why should they refer you?"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="submit"
                                                                    className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-primaryHover rounded-lg font-medium transition-colors"
                                                                >
                                                                    Send Request
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )
                                                })
                                            }}
                                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-primary text-white hover:bg-indigo-500 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                        >
                                            <Briefcase size={18} aria-hidden="true" />
                                            <span>Ask for Referral</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="mt-8 pt-8 border-t border-brand-border">
                                <h3 className="text-sm font-semibold text-brand-textMuted uppercase tracking-wider mb-2">About</h3>
                                <p className="text-brand-textSecondary leading-relaxed max-w-3xl text-pretty">
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
                        <div className="bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Availability</h3>
                            <div className="space-y-3">
                                {profile.available_for_mentorship && (
                                    <div className="flex items-center text-brand-success">
                                        <Sparkles size={18} className="mr-2" />
                                        <span>Open for Mentorship</span>
                                    </div>
                                )}
                                {profile.available_for_referrals && (
                                    <div className="flex items-center text-brand-primary">
                                        <Briefcase size={18} className="mr-2" />
                                        <span>Open for Referrals</span>
                                    </div>
                                )}
                                {!profile.available_for_mentorship && !profile.available_for_referrals && (
                                    <div className="text-brand-textSecondary">Not currently available for extra activities.</div>
                                )}
                            </div>
                        </div>

                        {/* Links */}
                        {profile.linkedin_url && (
                            <div className="bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Connect</h3>
                                <div className="space-y-3">
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-brand-border hover:bg-indigo-600/20 text-brand-textSecondary hover:text-indigo-300 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
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
                            className="bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-2xl p-8"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <GraduationCap className="text-brand-primary" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-brand-textMain">Academic Background</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="pl-4 border-l-2 border-brand-border hover:border-indigo-500/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-brand-textMain">{profile.university}</h3>
                                    <p className="text-brand-primary">{profile.degree}</p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-brand-textSecondary">
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
                            className="bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-2xl p-8"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-pink-500/10 rounded-xl">
                                    <Award className="text-pink-400" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-brand-textMain">Skills & Expertise</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="px-4 py-1.5 bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 hover:bg-brand-alt text-brand-textSecondary hover:text-brand-primary text-sm font-medium rounded-full transition-colors border border-brand-border hover:border-slate-600 cursor-default"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>
        </div>
    )
}

export default AlumniProfileView
