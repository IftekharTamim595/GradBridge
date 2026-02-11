import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Save, CheckCircle, AlertCircle, Briefcase, Building, Award, MapPin, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import Footer from '../components/Footer'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { showModal } = useModal()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  const getErrorMessage = (error) => {
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      if (Array.isArray(data)) return data.join('\n')
      if (typeof data === 'object') {
        if (data.detail) return data.detail
        if (data.message) return data.message
        return Object.entries(data).map(([key, value]) => {
          const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
          const messages = Array.isArray(value) ? value.join(' ') : value
          return `${fieldName}: ${messages}`
        }).join('\n')
      }
    }
    return error.message || 'An unexpected error occurred'
  }

  // Skills Dropdown State
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [skillSearch, setSkillSearch] = useState('')
  const skillsDropdownRef = useRef(null)

  useEffect(() => {
    // Wait for auth state to be ready before fetching
    if (!authLoading && isAuthenticated) {
      fetchData()
    } else if (!authLoading && !isAuthenticated) {
      // Not authenticated, stop loading
      setLoading(false)
    }

    const handleClickOutside = (event) => {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target)) {
        setIsSkillsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [authLoading, isAuthenticated])

  const fetchData = async () => {
    try {
      const [profileRes, skillsRes] = await Promise.all([
        apiClient.get('/profiles/alumni/me/'),
        apiClient.get('/profiles/skills/'),
      ])

      if (profileRes.data) {
        const prof = profileRes.data
        setProfile(prof)
        setSelectedSkills(prof.skills?.map(s => s.id) || [])
      }
      setSkills(skillsRes.data.results || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status !== 404) {
        if (error.response?.status !== 404) {
          showModal({ type: 'error', message: 'Failed to load profile data' })
        }
      }
    } finally {
      setLoading(false)
    }
  }





  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

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
        city: formData.get('city'),
        country: formData.get('country'),
        skill_ids: selectedSkills,
      }

      if (profile) {
        await apiClient.patch(`/profiles/alumni/me/`, data)
      } else {
        await apiClient.patch('/profiles/alumni/me/', data)
      }

      await fetchData()
      showModal({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error saving profile:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId))
    } else {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const removeSkillTag = (skillId) => {
    setSelectedSkills(selectedSkills.filter(id => id !== skillId))
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
              <div className="relative" ref={skillsDropdownRef}>
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedSkills.map(skillId => {
                    const skill = skills.find(s => s.id === skillId)
                    if (!skill) return null
                    return (
                      <span key={skillId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => removeSkillTag(skillId)}
                          className="ml-2 hover:text-white focus:outline-none"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>

                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-left text-slate-300 flex justify-between items-center hover:bg-slate-900 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <span>{selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Select Skills'}</span>
                    {isSkillsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  <AnimatePresence>
                    {isSkillsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col"
                      >
                        <div className="p-2 border-b border-slate-700 space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              placeholder="Search skills..."
                              className="w-full bg-slate-900 border border-slate-700 rounded px-9 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                              value={skillSearch}
                              onChange={(e) => setSkillSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {skillSearch && !filteredSkills.find(s => s.name.toLowerCase() === skillSearch.toLowerCase()) && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const res = await apiClient.post('/profiles/skills/', { name: skillSearch });
                                  const newSkill = res.data;
                                  setSkills([...skills, newSkill]);
                                  setSelectedSkills([...selectedSkills, newSkill.id]);
                                  setSkillSearch('');
                                  showModal({ type: 'success', message: `Added skill: ${newSkill.name}` });
                                } catch (err) {
                                  showModal({ type: 'error', message: 'Failed to add skill. It may already exist.' });
                                }
                              }}
                              className="w-full text-left text-xs text-indigo-400 hover:text-indigo-300 px-1 py-1 flex items-center"
                            >
                              <span className="mr-1">+</span> Add "{skillSearch}" as new skill
                            </button>
                          )}
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map(skill => (
                              <label
                                key={skill.id}
                                className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSkills.includes(skill.id)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-slate-500 bg-transparent'
                                  }`}>
                                  {selectedSkills.includes(skill.id) && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <span className="text-slate-300 text-sm">{skill.name}</span>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={selectedSkills.includes(skill.id)}
                                  onChange={() => toggleSkill(skill.id)}
                                />
                              </label>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-500 text-sm">No skills found</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

            <div className="border-b border-slate-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <MapPin className="text-indigo-400" size={20} />
                <span>Location</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={profile?.city || ''}
                    className="input-field"
                    placeholder="e.g., San Francisco"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Country <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="country"
                    defaultValue={profile?.country || ''}
                    className="input-field"
                    placeholder="e.g., United States"
                    required
                  />
                </div>
              </div>
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
