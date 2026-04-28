import React from 'react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { Shield, Users, Briefcase, MessageCircle, Map, BookOpen } from 'lucide-react'

const ExplorePlatform = () => {
    return (
        <div className="min-h-screen bg-brand-bg pt-16 font-sans text-brand-textMain">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-6">
                        Welcome to GradBridge
                    </h1>
                    <p className="text-xl text-brand-textSecondary max-w-3xl mx-auto">
                        Your gateway to connecting students with alumni for mentorship, career advice, and opportunities.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <FeatureCard
                        icon={<Users className="text-brand-primary" size={32} />}
                        title="Student & Alumni Profiles"
                        description="Create detailed profiles showcasing your education, skills, and projects. Connect with others based on shared interests."
                    />
                    <FeatureCard
                        icon={<MessageCircle className="text-pink-400" size={32} />}
                        title="Real-time Messaging"
                        description="Chat instantly with alumni for guidance or with students tooffer advice. Built-in secure messaging system."
                    />
                    <FeatureCard
                        icon={<Briefcase className="text-brand-success" size={32} />}
                        title="Hire & Opportunities"
                        description="Alumni and recruiters can find top talent. Students can mark themselves as 'Available for Hire'."
                    />
                    <FeatureCard
                        icon={<Shield className="text-amber-400" size={32} />}
                        title="Roles & Permissions"
                        description="Distinct roles for Students, Alumni, and Guests ensure a tailored and secure experience for everyone."
                    />
                    <FeatureCard
                        icon={<Map className="text-cyan-400" size={32} />}
                        title="Location Based"
                        description="Find network members near you. Our map feature helps you build local connections."
                    />
                    <FeatureCard
                        icon={<BookOpen className="text-purple-400" size={32} />}
                        title="Community"
                        description="Share knowledge, ask questions, and post updates in the exclusive community feed."
                    />
                </div>

                <div className="bg-white border border-brand-border border border-brand-border rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold text-brand-textMain mb-6">How it Works</h2>
                    <div className="space-y-6">
                        <Step number="1" title="Sign Up" desc="Create an account as a Student or Alumni. Verify your email to get started." />
                        <Step number="2" title="Build Profile" desc="Add your university details, skills, and portfolio projects to reach 100% profile strength." />
                        <Step number="3" title="Connect" desc="Browse the directory, send mentorship requests, or start conversations." />
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="btn-primary px-8 py-3 text-lg">
                        Get Started Today
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white border border-brand-border backdrop-blur-md border border-brand-border rounded-xl p-6 hover:border-indigo-500/30 transition-all"
    >
        <div className="mb-4 bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 w-12 h-12 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-brand-textMain mb-2">{title}</h3>
        <p className="text-brand-textSecondary">{description}</p>
    </motion.div>
)

const Step = ({ number, title, desc }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 flex items-center justify-center font-bold text-white">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-brand-textMain">{title}</h4>
            <p className="text-brand-textSecondary">{desc}</p>
        </div>
    </div>
)

export default ExplorePlatform
