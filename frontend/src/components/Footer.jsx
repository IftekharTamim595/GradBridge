import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'

const Footer = () => {
  const [problem, setProblem] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')

  const handleReportProblem = async (e) => {
    e.preventDefault()
    if (!problem.trim()) return

    setIsSending(true)
    setMessage('')
    try {
      await apiClient.post('/notifications/report-problem/', { message: problem })
      setMessage('Report sent successfully!')
      setProblem('')
    } catch (error) {
      console.error('Error reporting problem:', error)
      setMessage('Failed to send report. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <footer className="bg-white border-t border-slate-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#0052FF,#4D7CFF)' }}>
                <span className="text-white font-bold text-sm">GB</span>
              </div>
              <span className="font-heading text-lg text-slate-900">GradBridge</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Connecting students and alumni for mentorship, career growth, and collaborative success.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/hire" className="hover:text-[#0052FF] transition-colors">Hire Students</Link></li>
              <li><Link to="/community" className="hover:text-[#0052FF] transition-colors">Community</Link></li>
              <li><Link to="/login" className="hover:text-[#0052FF] transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Report a Problem */}
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-3">Report a Problem</h4>
            <form onSubmit={handleReportProblem} className="space-y-2">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all resize-none"
                placeholder="Describe the issue..."
                rows="3"
                required
              ></textarea>
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-[#0052FF] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0041CC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Report'}
              </button>
              {message && (
                <p className={`text-[10px] ${message.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400 font-mono-ui">
            © 2025 GradBridge. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Built with ❤️ for students and alumni.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
