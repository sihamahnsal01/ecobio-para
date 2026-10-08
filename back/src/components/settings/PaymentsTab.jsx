import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Toggle from './Toggle.jsx'

function PaymentsTab() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings/payments').then(setForm)
  }, [])

  if (!form) return <p className="muted-text">Loading…</p>

  const setProvider = (provider, key, value) =>
    setForm((f) => ({ ...f, [provider]: { ...f[provider], [key]: value } }))

  const handleSave = async () => {
    setSaving(true)
    await api.put('/settings/payments', form)
    setSaving(false)
  }

  return (
    <div className="card settings-section">
      <h3>Payments</h3>
      <p className="settings-section-sub">Connect and configure payment providers.</p>

      <div className="payment-providers-grid">
        <div className="payment-provider-card">
          <div className="payment-provider-header">
            <span><i className="fa-regular fa-credit-card"></i> Credit Card (Stripe)</span>
            <Toggle on={form.stripe.enabled} onChange={(v) => setProvider('stripe', 'enabled', v)} />
          </div>
          <div className="field">
            <label>API Public Key</label>
            <input value={form.stripe.publicKey} onChange={(e) => setProvider('stripe', 'publicKey', e.target.value)} />
          </div>
          <div className="field">
            <label>API Secret Key</label>
            <input
              type="password"
              value={form.stripe.secretKey}
              onChange={(e) => setProvider('stripe', 'secretKey', e.target.value)}
            />
          </div>
        </div>

        <div className="payment-provider-card">
          <div className="payment-provider-header">
            <span><i className="fa-brands fa-paypal"></i> PayPal</span>
            <Toggle on={form.paypal.enabled} onChange={(v) => setProvider('paypal', 'enabled', v)} />
          </div>
          <div className="field">
            <label>API Public Key</label>
            <input value={form.paypal.publicKey} onChange={(e) => setProvider('paypal', 'publicKey', e.target.value)} />
          </div>
          <div className="field">
            <label>API Secret Key</label>
            <input
              type="password"
              value={form.paypal.secretKey}
              onChange={(e) => setProvider('paypal', 'secretKey', e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary settings-save-btn full-width" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Payment Settings'}
      </button>
    </div>
  )
}

export default PaymentsTab
