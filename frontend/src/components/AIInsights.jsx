import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Award, Target, Sparkles, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../api/apiClient'

const AIInsights = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchInsights()
    }
  }, [isOpen, user])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      // Placeholder - replace with actual API call
      // For now, generate mock insights based on user role
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (user.role === 'student') {
        const response = await apiClient.get('/profiles/students/')
        const profile = response.data.results?.[0]
        
        setInsights({
          profileStrength: profile?.profile_strength || 0,
          skillGaps: [
            { skill: 'Machine Learning', priority: 'High', reason: 'High demand in your field' },
            { skill: 'Cloud Computing', priority: 'Medium', reason: 'Growing industry trend' },
          ],
          careerSuggestions: [
            'Software Engineer',
            'Data Scientist',
            'Full Stack Developer',
          ],
          recommendations: [
            'Complete your profile to increase visibility',
            'Add more projects to showcase your skills',
            'Connect with alumni in your field of interest',
          ],
        })
      } else if (user.role === 'alumni') {
        setInsights({
          studentsMentored: 0,
          topSkills: ['Python', 'React', 'Django'],
          recommendations: [
            'Review pending mentorship requests',
            'Update your availability status',
            'Share your expertise with students',
          ],
        })
      } else {
        setInsights({
          message: 'AI Insights are available for registered users.',
          recommendations: [
            'Sign up to get personalized insights',
            'Explore available students and alumni',
          ],
        })
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-indigo-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">AI Insights</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-indigo-400" size={32} />
                </div>
              ) : insights ? (
                <div className="space-y-6">
                  {insights.profileStrength !== undefined && (
                    <div className="card">
                      <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="text-indigo-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Profile Strength</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${insights.profileStrength}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                          />
                        </div>
                        <span className="text-white font-bold">{insights.profileStrength}%</span>
                      </div>
                    </div>
                  )}

                  {insights.skillGaps && insights.skillGaps.length > 0 && (
                    <div className="card">
                      <div className="flex items-center space-x-2 mb-4">
                        <Target className="text-indigo-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Skill Gaps</h3>
                      </div>
                      <div className="space-y-3">
                        {insights.skillGaps.map((gap, index) => (
                          <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-white font-medium">{gap.skill}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                gap.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                gap.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {gap.priority}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400">{gap.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.careerSuggestions && (
                    <div className="card">
                      <div className="flex items-center space-x-2 mb-4">
                        <Award className="text-indigo-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Career Suggestions</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {insights.careerSuggestions.map((role, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-sm rounded border border-indigo-500/30"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.recommendations && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-slate-300">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.message && (
                    <div className="card">
                      <p className="text-slate-300">{insights.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No insights available</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AIInsights
