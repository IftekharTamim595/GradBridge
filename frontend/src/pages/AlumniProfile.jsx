import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Save, CheckCircle, AlertCircle, Briefcase, Building, Award } from 'lucide-react'
import Footer from '../components/Footer'

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, skillsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/profiles/alumni/'),
        axios.get('http://localhost:8000/api/profiles/skills/'),
      ])
      
      if (profileRes.data.results && profileRes.data.results.length > 0) {
        const prof = profileRes.data.results[0]
        setProfile(prof)
        setSelectedSkills(prof.skills?.map(s => s.id) || [])
      }
      setSkills(skillsRes.data.results || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const formData = new FormData(e.target)
      const data = {
        current_company: formData.get('current_company'),
        current_position: formData.get('current_position'),
        industry: formData.get('industry'),
        years_of_experience: formData.get('years_of_experience') || null,
        university: formData.get('university'),
        degree: formData.get('degree'),
        graduation_year: formData.get('graduation_year') || null,
        batch: formData.get('batch'),
        expertise_areas: formData.get('expertise_areas'),
        available_for_mentorship: formData.get('available_for_mentorship') === 'on',
        available_for_referrals: formData.get('available_for_referrals') === 'on',
        linkedin_url: formData.get('linkedin_url'),
        bio: formData.get('bio'),
        skill_ids: selectedSkills,
      }

      if (profile) {
        await axios.patch(`http://localhost:8000/api/profiles/alumni/${profile.id}/`, data)
      } else {
        await axios.post('http://localhost:8000/api/profiles/alumni/', data)
      }
      
      await fetchData()
      showMessage('success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error saving profile'
      showMessage('error', errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Alumni Profile</h1>
          <p className="text-slate-400">Update your professional information and availability</p>
        </motion.div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSave} className="card space-y-6">
            <div className="border-b border-slate-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Briefcase className="text-indigo-400" size={20} />
                <span>Professional Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Current Company</label>
                  <input
                    type="text"
                    name="current_company"
                    defaultValue={profile?.current_company || ''}
                    className="input-field"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Current Position</label>
                  <input
                    type="text"
                    name="current_position"
                    defaultValue={profile?.current_position || ''}
                    className="input-field"
                    placeholder="Job Title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    defaultValue={profile?.industry || ''}
                    className="input-field"
                    placeholder="e.g., Technology, Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    defaultValue={profile?.years_of_experience || ''}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Building className="text-indigo-400" size={20} />
                <span>Education</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">University</label>
                  <input
                    type="text"
                    name="university"
                    defaultValue={profile?.university || ''}
                    className="input-field"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    defaultValue={profile?.degree || ''}
                    className="input-field"
                    placeholder="Degree"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduation_year"
                    defaultValue={profile?.graduation_year || ''}
                    className="input-field"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    defaultValue={profile?.batch || ''}
                    className="input-field"
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Award className="text-indigo-400" size={20} />
                <span>Skills & Expertise</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-4 bg-slate-800/50 mb-4">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills([...selectedSkills, skill.id])
                        } else {
                          setSelectedSkills(selectedSkills.filter(id => id !== skill.id))
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-300">{skill.name}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expertise Areas</label>
                <textarea
                  name="expertise_areas"
                  rows={3}
                  defaultValue={profile?.expertise_areas || ''}
                  className="input-field"
                  placeholder="Describe your areas of expertise and specialization..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ''}
                className="input-field"
                placeholder="Tell us about your professional journey and how you can help students..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                defaultValue={profile?.linkedin_url || ''}
                className="input-field"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="available_for_mentorship"
                  defaultChecked={profile?.available_for_mentorship !== false}
                  className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                />
                <span className="text-slate-300">Available for Mentorship</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="available_for_referrals"
                  defaultChecked={profile?.available_for_referrals !== false}
                  className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                />
                <span className="text-slate-300">Available for Referrals</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

export default AlumniProfile
