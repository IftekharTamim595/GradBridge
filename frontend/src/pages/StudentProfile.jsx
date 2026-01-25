import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Save, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Footer from '../components/Footer'

const StudentProfile = () => {
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
        axios.get('http://localhost:8000/api/profiles/students/'),
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
        university: formData.get('university'),
        degree: formData.get('degree'),
        batch: formData.get('batch'),
        gpa: formData.get('gpa') || null,
        graduation_year: formData.get('graduation_year') || null,
        bio: formData.get('bio'),
        linkedin_url: formData.get('linkedin_url'),
        github_url: formData.get('github_url'),
        portfolio_url: formData.get('portfolio_url'),
        skill_ids: selectedSkills,
      }

      if (profile) {
        await axios.patch(`http://localhost:8000/api/profiles/students/${profile.id}/`, data)
      } else {
        await axios.post('http://localhost:8000/api/profiles/students/', data)
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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 10MB')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    try {
      if (profile) {
        await axios.patch(`http://localhost:8000/api/profiles/students/${profile.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await fetchData()
        showMessage('success', 'Resume uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      showMessage('error', 'Error uploading resume. Please try again.')
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
          <h1 className="text-4xl font-bold text-white mb-2">Student Profile</h1>
          <p className="text-slate-400">Manage your profile information and showcase your skills</p>
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">University</label>
              <input
                type="text"
                name="university"
                defaultValue={profile?.university || ''}
                className="input-field"
                placeholder="Your University"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Degree</label>
                <input
                  type="text"
                  name="degree"
                  defaultValue={profile?.degree || ''}
                  className="input-field"
                  placeholder="e.g., BSc Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Batch</label>
                <input
                  type="text"
                  name="batch"
                  defaultValue={profile?.batch || ''}
                  className="input-field"
                  placeholder="e.g., 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  name="gpa"
                  defaultValue={profile?.gpa || ''}
                  className="input-field"
                  placeholder="0.00 - 4.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Graduation Year</label>
                <input
                  type="number"
                  name="graduation_year"
                  defaultValue={profile?.graduation_year || ''}
                  className="input-field"
                  placeholder="2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-4 bg-slate-800/50">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ''}
                className="input-field"
                placeholder="Tell us about yourself, your interests, and career goals..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub</label>
                <input
                  type="url"
                  name="github_url"
                  defaultValue={profile?.github_url || ''}
                  className="input-field"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio</label>
                <input
                  type="url"
                  name="portfolio_url"
                  defaultValue={profile?.portfolio_url || ''}
                  className="input-field"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Resume (PDF)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="input-field flex items-center justify-center space-x-2 hover:bg-slate-700/50 transition-colors">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-slate-400">Choose file...</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {profile?.resume && (
                <p className="mt-2 text-sm text-emerald-400 flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Resume uploaded: {profile.resume.split('/').pop()}</span>
                </p>
              )}
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

export default StudentProfile
