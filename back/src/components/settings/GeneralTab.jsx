import { useEffect, useState } from 'react'
import api from '../../api/client.js'

function GeneralTab() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings/general').then(setForm)
  }, [])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await api.put('/settings/general', form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!form) return <p className="muted-text">Loading…</p>

  return (
    <div className="card settings-section">
      <h3>General</h3>
      <p className="settings-section-sub">Basic information about your store.</p>

      <div className="field">
        <label>Store Name</label>
        <input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
      </div>
      <div className="field">
        <label>Support Email</label>
        <input value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Currency</label>
          <input value={form.currency} onChange={(e) => set('currency', e.target.value)} />
        </div>
        <div className="field">
          <label>Timezone</label>
          <input value={form.timezone} onChange={(e) => set('timezone', e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary settings-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Settings'}
      </button>
    </div>
  )
}

export default GeneralTab
