import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Save, Upload, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Search, X, User } from 'lucide-react'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'
import SkillSelect from '../components/SkillSelect'

const StudentProfile = () => {
  const [profile, setProfile] = useState(null)
  const [selectedSkillNames, setSelectedSkillNames] = useState([])
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

  // Certificate State
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: ''
  })

  const handleCertificateChange = (e) => {
    const { name, value } = e.target
    setNewCertificate(prev => ({ ...prev, [name]: value }))
  }

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
        apiClient.get('/profiles/students/me/'),
        apiClient.get('/profiles/skills/'),
      ])

      if (profileRes.data) {
        const prof = profileRes.data
        setProfile(prof)
        setSelectedSkillNames(prof.skills?.map(s => s.name) || [])
      }
      
      if (skillsRes.data) {
        setSkills(skillsRes.data.results || skillsRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status !== 404) {
        showModal({ type: 'error', message: 'Failed to load profile data' })
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
        university: formData.get('university'),
        degree: formData.get('degree'),
        batch: formData.get('batch'),
        gpa: formData.get('gpa') || null,
        graduation_year: formData.get('graduation_year') || null,
        bio: formData.get('bio'),
        linkedin_url: formData.get('linkedin_url'),
        github_url: formData.get('github_url'),
        portfolio_url: formData.get('portfolio_url'),
        skill_names: selectedSkillNames,
        available_for_hire: formData.get('available_for_hire') === 'on',
        visibility: formData.get('visibility'),
        city: formData.get('city'),
        country: formData.get('country')
      }

      await apiClient.patch('/profiles/students/me/', data)
      await fetchData()
      showModal({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error saving profile:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showModal({ type: 'error', message: 'File size must be less than 10MB' })
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    try {
      await apiClient.patch(`/profiles/students/me/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchData()
      showModal({ type: 'success', message: 'Resume uploaded successfully!' })
    } catch (error) {
      console.error('Error uploading resume:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
    }
  }

  const handleAddCertificate = async (e) => {
    e.preventDefault() // prevent form submission if triggered by button inside form
    if (!newCertificate.name || !newCertificate.issuing_organization || !newCertificate.issue_date) {
      showModal({ type: 'error', message: 'Please fill in required certificate fields' })
      return
    }

    try {
      await apiClient.post('/profiles/certificates/', newCertificate)
      await fetchData() // Refresh profile to get updated certificates
      setNewCertificate({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: ''
      })
      showModal({ type: 'success', message: 'Certificate added successfully!' })
    } catch (error) {
      console.error('Error adding certificate:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
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
    formData.append('profile_photo', file)

    try {
      // Patching /auth/me/ to update User model profile_photo
      await apiClient.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await fetchData()
      showModal({ type: 'success', message: 'Profile photo updated!' })
    } catch (error) {
      console.error('Error uploading photo:', error)
      showModal({ type: 'error', message: getErrorMessage(error) })
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
      <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
        <div className="text-brand-textSecondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <p className="text-xs font-mono-ui text-brand-primary uppercase tracking-widest mb-2">Account Settings</p>
        <h1 className="font-heading text-4xl text-slate-900">Student Profile</h1>
        <p className="text-slate-500 mt-2">Manage your professional presence and portfolio</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Main Info Card */}
          <div className="card shadow-xl border-t-4 border-t-brand-primary">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center pb-8 border-b border-slate-100 mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 border-4 border-white shadow-lg ring-1 ring-slate-200">
                  {profile?.user?.profile_photo ? (
                    <img
                      src={profile.user.profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-alt">
                      <User size={48} className="text-brand-primary/40" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-primaryHover shadow-lg transition-all hover:scale-110 active:scale-95">
                  <Upload size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">{user?.first_name} {user?.last_name}</h3>
              <p className="text-xs text-slate-400">Allowed formats: JPG, PNG. Max size 5MB.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">University</label>
                <input
                  type="text"
                  name="university"
                  defaultValue={profile?.university || ''}
                  className="input-field"
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    defaultValue={profile?.degree || ''}
                    className="input-field"
                    placeholder="e.g. BSc Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch / Class of</label>
                  <input
                    type="text"
                    name="batch"
                    defaultValue={profile?.batch || ''}
                    className="input-field"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    name="gpa"
                    defaultValue={profile?.gpa || ''}
                    className="input-field"
                    placeholder="4.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduation_year"
                    defaultValue={profile?.graduation_year || ''}
                    className="input-field"
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Skills Card */}
          <div className="card shadow-lg">
            <h3 className="text-lg font-heading text-slate-800 mb-6">Expertise & Background</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={profile?.bio || ''}
                  className="input-field min-h-[120px]"
                  placeholder="Briefly describe your background, interests, and goals..."
                />
              </div>

              <div className="relative" ref={skillsDropdownRef}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Skills & Technologies</label>
                <div className="mb-4 flex flex-wrap gap-2">
                <div className="mt-3">
                  <SkillSelect 
                    selectedSkills={selectedSkillNames} 
                    onChange={setSelectedSkillNames} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Social & Contact Card */}
          <div className="card shadow-lg">
             <h3 className="text-lg font-heading text-slate-800 mb-6">Online Presence</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn Profile</label>
                  <input type="url" name="linkedin_url" defaultValue={profile?.linkedin_url || ''} className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">GitHub Portfolio</label>
                  <input type="url" name="github_url" defaultValue={profile?.github_url || ''} className="input-field" placeholder="https://github.com/..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Personal Website / Portfolio</label>
                  <input type="url" name="portfolio_url" defaultValue={profile?.portfolio_url || ''} className="input-field" placeholder="https://..." />
                </div>
             </div>
          </div>

          {/* Visibility & Resume Card */}
          <div className="card shadow-lg">
            <h3 className="text-lg font-heading text-slate-800 mb-6">Career Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Visibility</label>
                <select name="visibility" defaultValue={profile?.visibility || 'public'} className="input-field">
                  <option value="public">Visible to everyone (Recommended)</option>
                  <option value="private">Private (Only you and admins)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Available for Hire</h4>
                  <p className="text-xs text-slate-500">Showcase your profile to alumni and recruiters</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="available_for_hire" defaultChecked={profile?.available_for_hire || false} className="sr-only peer" id="hire-toggle" />
                  <div onClick={() => document.getElementById('hire-toggle').click()} className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Resume (PDF)</label>
                <div className="flex flex-col gap-3">
                  {profile?.resume ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-500" size={20} />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Resume Uploaded</p>
                          <a href={profile.resume} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline">View current resume</a>
                        </div>
                      </div>
                      <label className="btn-secondary !py-2 !px-4 text-xs cursor-pointer">
                        Update
                        <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-brand-primary/50 hover:bg-brand-alt/30 transition-all cursor-pointer group">
                      <Upload className="text-slate-300 group-hover:text-brand-primary mb-2" size={32} />
                      <p className="text-sm font-medium text-slate-600">Click to upload your resume</p>
                      <p className="text-xs text-slate-400 mt-1">PDF format only, max 10MB</p>
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-6 left-0 right-0 z-10 flex justify-center">
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary shadow-2xl !px-10 !py-4 text-base gap-3 group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              {saving ? 'Saving changes...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default StudentProfile