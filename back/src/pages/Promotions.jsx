import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import StatusPill from '../components/StatusPill.jsx'
import PromotionEditor from '../components/PromotionEditor.jsx'
import '../styles/Products.css'

const formatDate = (d) => new Date(d).toLocaleDateString()

const isCurrentlyActive = (p) => {
  const now = new Date()
  return p.active && new Date(p.startDate) <= now && new Date(p.endDate) >= now
}

function Promotions() {
  const { can } = useAuth()
  const [promotions, setPromotions] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null) // promotion being edited, or 'new'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/promotions')
      .then(setPromotions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/categories').then((data) => setCategories(data.map((c) => c.name))).catch(() => {})
  }, [])

  const handleSaved = () => {
    setEditing(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion?')) return
    await api.del(`/promotions/${id}`)
    setEditing(null)
    load()
  }

  return (
    <div className="products-admin">
      <div className="products-toolbar-row">
        <h3 style={{ margin: 0 }}>Promotions &amp; Discounts</h3>
        {can('managePromotions') && (
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <i className="fa-solid fa-plus"></i> Add Promotion
          </button>
        )}
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Promotions</h3>
          <span className="muted-text">{promotions.length} total</span>
        </div>

        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Category</th>
                <th>Dates</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.code}</strong>
                  </td>
                  <td>{p.discountType === 'percentage' ? `${p.discountValue}%` : `${p.discountValue.toFixed(2)} DH`}</td>
                  <td>{p.category || 'All categories'}</td>
                  <td>
                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                  </td>
                  <td>
                    <StatusPill value={isCurrentlyActive(p) ? 'Active' : p.active ? 'Pending' : 'Draft'} />
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => setEditing(p)}>
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    No promotions yet — add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <PromotionEditor
          promotion={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDelete={editing !== 'new' ? () => handleDelete(editing._id) : undefined}
        />
      )}
    </div>
  )
}

export default Promotions