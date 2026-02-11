import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Save, Upload, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Search, X, User } from 'lucide-react'
import Footer from '../components/Footer'
import { useModal } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'

const StudentProfile = () => {
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
        setSelectedSkills(prof.skills?.map(s => s.id) || [])
      }
      setSkills(skillsRes.data.results || [])
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
        skill_ids: selectedSkills,
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSave} className="card space-y-6">

            {/* Profile Photo Section */}
            <div className="flex flex-col items-center pb-6 border-b border-slate-700">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-2 border-indigo-500">
                  {profile?.user?.profile_photo ? (
                    <img
                      src={profile.user.profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg">
                  <Upload size={14} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <span className="mt-2 text-xs text-slate-500">Change Profile Picture</span>
            </div>

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

            <div className="relative" ref={skillsDropdownRef}>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
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

              <div className="relative">
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

            {/* Certificates Section */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>

              <div className="space-y-4 mb-6">
                {profile?.certificates?.map(cert => (
                  <div key={cert.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-start border border-slate-700">
                    <div>
                      <h4 className="text-white font-medium">{cert.name}</h4>
                      <p className="text-sm text-slate-400">{cert.issuing_organization}</p>
                      <p className="text-xs text-slate-500">
                        Issued: {cert.issue_date}
                        {cert.expiration_date && ` • Expires: ${cert.expiration_date}`}
                      </p>
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
                          View Credential
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCertificate(cert.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Add New Certificate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    name="name"
                    value={newCertificate.name}
                    onChange={handleCertificateChange}
                    placeholder="Certificate Name"
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    name="issuing_organization"
                    value={newCertificate.issuing_organization}
                    onChange={handleCertificateChange}
                    placeholder="Issuing Organization"
                    className="input-field text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Issue Date</label>
                    <input
                      type="date"
                      name="issue_date"
                      value={newCertificate.issue_date}
                      onChange={handleCertificateChange}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Expiration Date (Optional)</label>
                    <input
                      type="date"
                      name="expiration_date"
                      value={newCertificate.expiration_date}
                      onChange={handleCertificateChange}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    name="credential_id"
                    value={newCertificate.credential_id}
                    onChange={handleCertificateChange}
                    placeholder="Credential ID (Optional)"
                    className="input-field text-sm"
                  />
                  <input
                    type="url"
                    name="credential_url"
                    value={newCertificate.credential_url}
                    onChange={handleCertificateChange}
                    placeholder="Credential URL (Optional)"
                    className="input-field text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCertificate}
                  className="btn-secondary text-sm w-full"
                >
                  Add Certificate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ''}
                className="input-field"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn</label>
                <input type="url" name="linkedin_url" defaultValue={profile?.linkedin_url || ''} className="input-field" placeholder="LinkedIn URL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub</label>
                <input type="url" name="github_url" defaultValue={profile?.github_url || ''} className="input-field" placeholder="GitHub URL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio</label>
                <input type="url" name="portfolio_url" defaultValue={profile?.portfolio_url || ''} className="input-field" placeholder="Portfolio URL" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Profile Visibility</label>
              <select name="visibility" defaultValue={profile?.visibility || 'public'} className="input-field">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="city" defaultValue={profile?.city || ''} className="input-field" placeholder="City" />
                <input type="text" name="country" defaultValue={profile?.country || ''} className="input-field" placeholder="Country" />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-700">
              <input type="checkbox" name="available_for_hire" defaultChecked={profile?.available_for_hire || false} className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded" />
              <label className="text-slate-300 font-medium cursor-pointer">Available for Hire</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Resume (PDF)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="input-field flex items-center justify-center space-x-2 hover:bg-slate-700/50 transition-colors">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-slate-400">Choose file...</span>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
              {profile?.resume && <p className="mt-2 text-sm text-emerald-400 flex items-center space-x-2"><CheckCircle size={16} /><span>Resume uploaded</span></p>}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700">
              <button type="submit" disabled={saving} className="btn-primary flex items-center space-x-2 disabled:opacity-50">
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