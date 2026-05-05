import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Save, CheckCircle, AlertCircle, Briefcase, Building, Award, MapPin, Search, X, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'
import SkillSelect from '../components/SkillSelect'

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null)
  const [selectedSkillNames, setSelectedSkillNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skills, setSkills] = useState([])

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
        setSelectedSkillNames(prof.skills?.map(s => s.name) || [])
      }
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
        skill_names: selectedSkillNames,
        visibility: formData.get('visibility'),
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showModal({ type: 'error', message: 'Image size must be less than 5MB' })
      return
    }

    const formData = new FormData()
    formData.append('profile_picture', file)

    try {
      await apiClient.patch('/profiles/alumni/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await fetchData()
      showModal({ type: 'success', message: 'Profile photo updated!' })
    } catch (error) {
      console.error('Error uploading photo:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
        <div className="text-brand-textSecondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-mono-ui text-slate-400 uppercase tracking-widest mb-1">Account</p>
        <h1 className="font-heading text-3xl text-slate-900">Alumni Profile</h1>
        <p className="text-slate-500 mt-1">Update your professional information and availability</p>
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card shadow-xl mb-6">
            <div className="flex flex-col items-center pb-8 border-b border-slate-100 mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 border-4 border-white shadow-lg ring-1 ring-slate-200">
                  {profile?.profile_picture || profile?.user?.profile_photo ? (
                    <img
                      src={profile.profile_picture || profile.user.profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-alt text-4xl font-bold text-brand-primary">
                      {(user?.first_name?.[0] || 'A') + (user?.last_name?.[0] || 'L')}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-primaryHover shadow-lg transition-all hover:scale-110 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">{user?.first_name} {user?.last_name}</h3>
              <p className="text-xs text-slate-400">Allowed formats: JPG, PNG. Max size 5MB.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="card space-y-6">
            <div className="border-b border-brand-border pb-6">
              <h2 className="text-xl font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <Briefcase className="text-brand-primary" size={20} />
                <span>Professional Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Current Company</label>
                  <input
                    type="text"
                    name="current_company"
                    defaultValue={profile?.current_company || ''}
                    className="input-field"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Current Position</label>
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
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    defaultValue={profile?.industry || ''}
                    className="input-field"
                    placeholder="e.g., Technology, Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Years of Experience</label>
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

            <div className="border-b border-brand-border pb-6">
              <h2 className="text-xl font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <Building className="text-brand-primary" size={20} />
                <span>Education</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">University</label>
                  <input
                    type="text"
                    name="university"
                    defaultValue={profile?.university || ''}
                    className="input-field"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Degree</label>
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
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduation_year"
                    defaultValue={profile?.graduation_year || ''}
                    className="input-field"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Batch</label>
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
              <h2 className="text-xl font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <Award className="text-brand-primary" size={20} />
                <span>Skills & Expertise</span>
              </h2>
                <div className="mt-3">
                  <SkillSelect 
                    selectedSkills={selectedSkillNames} 
                    onChange={setSelectedSkillNames} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-2">Expertise Areas</label>
                <textarea
                  name="expertise_areas"
                  rows={3}
                  defaultValue={profile?.expertise_areas || ''}
                  className="input-field"
                  placeholder="Describe your areas of expertise and specialization..."
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ''}
                className="input-field"
                placeholder="Tell us about your professional journey and how you can help students..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-2">LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                defaultValue={profile?.linkedin_url || ''}
                className="input-field"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="border-b border-brand-border pb-6">
              <h2 className="text-xl font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <MapPin className="text-brand-primary" size={20} />
                <span>Location</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">City <span className="text-red-600">*</span></label>
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
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">Country <span className="text-red-600">*</span></label>
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

            <div className="border-b border-brand-border pb-6">
              <h2 className="text-xl font-semibold text-brand-textMain mb-4 flex items-center space-x-2">
                <Globe className="text-brand-primary" size={20} />
                <span>Profile Settings</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-2">Profile Visibility</label>
                <select name="visibility" defaultValue={profile?.visibility || 'public'} className="input-field">
                  <option value="public">Visible to everyone (Recommended)</option>
                  <option value="private">Private (Only you and admins)</option>
                </select>
                <p className="text-xs text-brand-textMuted mt-2">
                  If set to Private, students will not be able to find your profile or request mentorship/referrals.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-brand-border">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="available_for_mentorship"
                  defaultChecked={profile?.available_for_mentorship !== false}
                  className="w-4 h-4 text-brand-primary bg-brand-alt border-brand-border rounded focus:ring-indigo-500"
                />
                <span className="text-brand-textSecondary">Available for Mentorship</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="available_for_referrals"
                  defaultChecked={profile?.available_for_referrals !== false}
                  className="w-4 h-4 text-brand-primary bg-brand-alt border-brand-border rounded focus:ring-indigo-500"
                />
                <span className="text-brand-textSecondary">Available for Referrals</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border">
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
  )
}

export default AlumniProfile
