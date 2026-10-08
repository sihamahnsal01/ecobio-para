import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Toggle from './Toggle.jsx'

function ShippingTab() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings/shipping').then(setForm)
  }, [])

  if (!form) return <p className="muted-text">Loading…</p>

  const toggleCarrier = (name) =>
    setForm((f) => ({
      ...f,
      internationalCarriers: f.internationalCarriers.map((c) => (c.name === name ? { ...c, enabled: !c.enabled } : c))
    }))

  const addZone = () => {
    const name = prompt('Zone name')
    if (!name) return
    setForm((f) => ({ ...f, zones: [...f.zones, { name, cost: 0, enabled: true }] }))
  }

  const handleSave = async () => {
    setSaving(true)
    await api.put('/settings/shipping', form)
    setSaving(false)
  }

  return (
    <div className="card settings-section">
      <div className="settings-header-row">
        <div>
          <h3>Shipping</h3>
          <p className="settings-section-sub">Configure rates and carriers.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addZone}>
          <i className="fa-solid fa-plus"></i> Add New Zone
        </button>
      </div>

      <div className="shipping-block">
        <div className="payment-provider-header">
          <span>Domestic Flat Rate</span>
          <Toggle
            on={form.domesticFlatRate.enabled}
            onChange={(v) => setForm({ ...form, domesticFlatRate: { ...form.domesticFlatRate, enabled: v } })}
          />
        </div>
        <div className="field">
          <label>Cost</label>
          <input
            type="number"
            step="0.01"
            value={form.domesticFlatRate.cost}
            onChange={(e) =>
              setForm({ ...form, domesticFlatRate: { ...form.domesticFlatRate, cost: Number(e.target.value) } })
            }
          />
        </div>
      </div>

      <div className="shipping-block">
        <div className="payment-provider-header">
          <span>International Carriers</span>
        </div>
        <div className="carrier-row">
          {form.internationalCarriers.map((c) => (
            <label key={c.name} className={`carrier-chip${c.enabled ? ' enabled' : ''}`}>
              <input type="checkbox" checked={c.enabled} onChange={() => toggleCarrier(c.name)} />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {form.zones.length > 0 && (
        <div className="shipping-block">
          <div className="payment-provider-header">
            <span>Custom Zones</span>
          </div>
          {form.zones.map((z, i) => (
            <div className="field-row" key={i} style={{ alignItems: 'flex-end' }}>
              <div className="field">
                <label>Zone Name</label>
                <input
                  value={z.name}
                  onChange={(e) => {
                    const zones = [...form.zones]
                    zones[i] = { ...zones[i], name: e.target.value }
                    setForm({ ...form, zones })
                  }}
                />
              </div>
              <div className="field">
                <label>Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={z.cost}
                  onChange={(e) => {
                    const zones = [...form.zones]
                    zones[i] = { ...zones[i], cost: Number(e.target.value) }
                    setForm({ ...form, zones })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary settings-save-btn full-width" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Shipping Settings'}
      </button>
    </div>
  )
}

export default ShippingTab
