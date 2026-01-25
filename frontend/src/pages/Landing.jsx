import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, GraduationCap, FileText, TrendingUp, 
  Search, MessageCircle, BarChart3, Sparkles 
} from 'lucide-react'
import Footer from '../components/Footer'

const Landing = () => {
  const { isAuthenticated, user } = useAuth()
  const [stats, setStats] = useState({
    students: 0,
    alumni: 0,
    mentorships: 0,
    skills: 0,
  })

  useEffect(() => {
    // Animate counters
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    const animateCounter = (key, target) => {
      let current = 0
      const increment = target / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setStats(prev => ({ ...prev, [key]: target }))
          clearInterval(timer)
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }))
        }
      }, interval)
    }

    // Simulate stats (replace with actual API call)
    animateCounter('students', 1250)
    animateCounter('alumni', 320)
    animateCounter('mentorships', 890)
    animateCounter('skills', 150)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-white">Connect. </span>
              <span className="text-gradient">Mentor. </span>
              <span className="text-white">Grow.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              A professional platform connecting university students with alumni 
              for mentorship, career development, and collaborative growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Join as Student
                  </Link>
                  <Link
                    to="/register"
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Join as Alumni
                  </Link>
                </>
              )}
              <Link
                to="/alumni/search"
                className="text-slate-300 hover:text-white text-lg font-medium transition-colors"
              >
                Explore Platform →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Students', value: stats.students, icon: Users },
              { label: 'Alumni', value: stats.alumni, icon: GraduationCap },
              { label: 'Mentorships', value: stats.mentorships, icon: MessageCircle },
              { label: 'Skills Tracked', value: stats.skills, icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-xl mb-4">
                  <stat.icon className="text-indigo-400" size={32} />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}+</div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why GradBridge?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We bridge the gap between academic learning and professional success by 
              connecting students with experienced alumni who can guide their career journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Structured Mentorship',
                description: 'Connect with alumni who understand your academic journey and can provide targeted career guidance.',
              },
              {
                icon: Search,
                title: 'Skill-Based Discovery',
                description: 'Alumni can discover talented students based on skills, projects, and career interests.',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Insights',
                description: 'Get AI-assisted resume analysis, skill gap suggestions, and project-role matching.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600/20 rounded-lg mb-4">
                  <item.icon className="text-indigo-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Platform Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to build your career and support the next generation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'Alumni–Student Mentorship',
                description: 'Structured mentorship programs connecting students with experienced professionals.',
              },
              {
                icon: Search,
                title: 'Skill-Based Search',
                description: 'Advanced search filters to find students by skills, projects, batch, and interests.',
              },
              {
                icon: FileText,
                title: 'AI Resume Insights',
                description: 'Automated resume parsing, skill extraction, and relevance scoring for target roles.',
              },
              {
                icon: GraduationCap,
                title: 'Recommendation Letters',
                description: 'AI-assisted recommendation letter generation with editable templates for referrals.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Growth',
                description: 'Track profile strength, skill trends, and engagement metrics for career development.',
              },
              {
                icon: TrendingUp,
                title: 'Career Matching',
                description: 'Match student projects and skills to relevant job roles using ML algorithms.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="card cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-600/20 rounded-lg mb-4">
                  <feature.icon className="text-indigo-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
