import { useState } from 'react'
import api from '../api/client.js'
import '../styles/ProductEditor.css'

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

const emptyPromotion = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  category: '',
  startDate: '',
  endDate: '',
  active: true,
}

function PromotionEditor({ promotion, categories, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(() =>
    promotion
      ? {
          ...emptyPromotion,
          ...promotion,
          category: promotion.category || '',
          startDate: toDateInput(promotion.startDate),
          endDate: toDateInput(promotion.endDate),
        }
      : emptyPromotion
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue) || 0,
        category: form.category || null,
      }
      if (promotion) {
        await api.put(`/promotions/${promotion._id}`, payload)
      } else {
        await api.post('/promotions', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="drawer-header">
          <h3>{promotion ? `Edit Promotion: ${promotion.code}` : 'Add New Promotion'}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-body">
          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label>Promo Code</label>
            <input
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Discount Type</label>
              <select value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (DH)</option>
              </select>
            </div>
            <div className="field">
              <label>{form.discountType === 'percentage' ? 'Discount (%)' : 'Discount (DH)'}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Category (optional — leave blank for store-wide)</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
            </div>
            <div className="field">
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required />
            </div>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            Active
          </label>
        </div>

        <div className="drawer-footer">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : promotion ? 'Save Changes' : 'Add Promotion'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PromotionEditor