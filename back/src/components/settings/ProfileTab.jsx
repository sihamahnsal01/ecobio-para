import { useRef, useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import api from '../../api/client.js'

function ProfileTab() {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSuccess('')
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')
    setUploading(true)
    try {
      const { url } = await api.uploadFile(file)
      setForm((prev) => ({ ...prev, avatar: url }))
    } catch (err) {
      setError(err.message || 'Failed to upload image.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    setForm((prev) => ({ ...prev, avatar: '' }))
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar,
      })
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card settings-section">
      <h3>My Profile</h3>
      <p className="settings-section-sub">Update your own name, email, phone, and photo.</p>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-avatar-row">
          <div className="profile-avatar-preview">
            {form.avatar ? (
              <img src={form.avatar} alt="Profile avatar" />
            ) : (
              <span>{form.name?.[0]?.toUpperCase() || 'A'}</span>
            )}
          </div>
          <div className="profile-avatar-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAvatarPick}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Change Photo'}
            </button>
            {form.avatar && (
              <button type="button" className="btn-link-danger" onClick={handleRemoveAvatar}>
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={handleChange('email')} required />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Role</label>
            <input type="text" value={user?.role || ''} disabled />
          </div>
        </div>

        {error && <p className="form-message form-error">{error}</p>}
        {success && <p className="form-message form-success">{success}</p>}

        <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default ProfileTab