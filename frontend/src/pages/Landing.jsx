import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Users, GraduationCap, MessageCircle, TrendingUp, Search, FileText, Sparkles, BarChart3, ArrowRight } from 'lucide-react'
import Footer from '../components/Footer'

const Landing = () => {
  const { isAuthenticated, user } = useAuth()
  const [stats, setStats] = useState({ students: 0, alumni: 0, mentorships: 0, skills: 0 })

  useEffect(() => {
    const targets = { students: 1250, alumni: 320, mentorships: 890, skills: 150 }
    const duration = 1800
    const steps = 60
    const interval = duration / steps

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0
      const inc = target / steps
      const timer = setInterval(() => {
        current += inc
        if (current >= target) {
          setStats(prev => ({ ...prev, [key]: target }))
          clearInterval(timer)
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }))
        }
      }, interval)
    })
  }, [])

  const features = [
    { icon: MessageCircle, title: 'Alumni–Student Mentorship', desc: 'Structured mentorship programs connecting students with experienced professionals.' },
    { icon: Search,        title: 'Skill-Based Discovery',    desc: 'Advanced search filters to find students by skills, projects, batch, and interests.' },
    { icon: FileText,      title: 'AI Resume Insights',       desc: 'Automated resume parsing, skill extraction, and relevance scoring for target roles.' },
    { icon: GraduationCap, title: 'Recommendation Letters',   desc: 'AI-assisted recommendation letter generation with editable templates.' },
    { icon: BarChart3,     title: 'Analytics & Growth',       desc: 'Track profile strength, skill trends, and engagement metrics.' },
    { icon: TrendingUp,    title: 'Career Matching',          desc: 'Match student projects and skills to relevant job roles using ML algorithms.' },
  ]

  const statItems = [
    { label: 'Students',   value: stats.students,   icon: Users },
    { label: 'Alumni',     value: stats.alumni,     icon: GraduationCap },
    { label: 'Mentorships',value: stats.mentorships,icon: MessageCircle },
    { label: 'Skills',     value: stats.skills,     icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-[#0052FF] text-sm font-medium rounded-full border border-blue-100 mb-6">
              <Sparkles size={14} />
              AI-powered alumni network
            </span>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-slate-900 mb-6 leading-tight">
              Connect.{' '}
              <span className="text-gradient">Mentor.</span>{' '}
              Grow.
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              A professional platform connecting university students with alumni
              for mentorship, career development, and collaborative growth.
            </p>

            {isAuthenticated ? (
              <Link to={`/${user?.role}/dashboard`} className="btn-primary text-base px-8 py-3 shadow-accent">
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-accent">
                  Get started free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  Log in
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────── */}
      <section className="py-12 px-4 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                   style={{ background: 'linear-gradient(135deg,#0052FF15,#4D7CFF15)' }}>
                <s.icon size={20} style={{ color: '#0052FF' }} />
              </div>
              <div className="font-heading text-3xl text-slate-900">{s.value.toLocaleString()}+</div>
              <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why GradBridge ───────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl text-slate-900 mb-4">Why GradBridge?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We bridge the gap between academic learning and professional success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Users,    title: 'Structured Mentorship', desc: 'Connect with alumni who understand your academic journey and provide targeted career guidance.' },
              { icon: Search,   title: 'Skill-Based Discovery', desc: 'Alumni can discover talented students based on skills, projects, and career interests.' },
              { icon: Sparkles, title: 'AI-Powered Insights',   desc: 'Get AI-assisted resume analysis, skill gap suggestions, and project-role matching.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: 'linear-gradient(135deg,#0052FF,#4D7CFF)' }}>
                  <item.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl text-slate-900 mb-4">Platform Features</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to build your career and support the next generation.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: '#EFF4FF' }}>
                  <f.icon size={18} style={{ color: '#0052FF' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl text-slate-900 mb-4">Ready to bridge the gap?</h2>
            <p className="text-slate-500 mb-8">Join thousands of students and alumni building careers together.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="btn-primary px-8 py-3 shadow-accent">
                Join as Student
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-3">
                Join as Alumni
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default Landing
