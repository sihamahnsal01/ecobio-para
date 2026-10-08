import { useEffect, useState, useCallback } from 'react'
import api from '../api/client.js'
import '../styles/Products.css'

function Customers() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/customers', { search })
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete customer ${customer.name}? Their account will be removed.`)) return
    try {
      await api.del(`/customers/${customer._id}`)
      setItems((previous) => previous.filter((item) => item._id !== customer._id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="products-admin">
      <div className="card filters-card">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Search Customers</label>
          <input placeholder="Name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Customers</h3>
          <span className="muted-text">{items.length} total</span>
        </div>

        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.totalOrders}</td>
                  <td>{(Number(c.totalSpent) || 0).toFixed(2)} DH</td>
                  <td>
                    <button className="btn btn-danger btn-sm delete-x" onClick={() => handleDelete(c)} aria-label={`Delete ${c.name}`}>
                      X
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Customers