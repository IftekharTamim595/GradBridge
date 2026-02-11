import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Mail, GraduationCap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GB</span>
              </div>
              <span className="text-xl font-bold text-white">GradBridge</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              A professional platform connecting university students with alumni for mentorship,
              career development, and collaborative growth. Built for academic excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/alumni/search" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Explore Alumni
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Mentorship
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <GraduationCap size={16} />
                <span>University Project</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail size={16} />
                <span>contact@gradbridge.edu</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Github size={16} />
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} GradBridge. Academic project for final year university course.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
