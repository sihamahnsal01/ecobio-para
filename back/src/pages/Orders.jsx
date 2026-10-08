import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import StatusPill from '../components/StatusPill.jsx'
import OrderDetail from '../components/OrderDetail.jsx'
import '../styles/Orders.css'

// Matches the real Order model's status enum exactly.
const STATUS_OPTIONS = ['All', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function Orders() {
  const { can } = useAuth()
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/orders')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (order) => {
    if (!window.confirm(`Delete order #${order._id.slice(-6).toUpperCase()}?`)) return
    try {
      await api.del(`/orders/${order._id}`)
      setOrders((previous) => previous.filter((item) => item._id !== order._id))
      if (selectedOrder?._id === order._id) setSelectedOrder(null)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'All' && o.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        const idMatch = o._id.toLowerCase().includes(q)
        const customerText = [
          o.user?.name,
          o.user?.email,
          o.shippingAddress?.name,
          o.shippingAddress?.email,
          o.shippingAddress?.phone,
          o.shippingAddress?.city,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!idMatch && !customerText.includes(q)) return false
      }
      return true
    })
  }, [orders, search, status])

  return (
    <div className="orders-admin">
      <div className="card filters-card">
        <div className="filters-row">
          <div className="field" style={{ flex: 2 }}>
            <label>Order ID / Customer</label>
            <input placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All' : label(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Orders</h3>
          <span className="muted-text">{filtered.length} total</span>
        </div>

        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.shippingAddress?.name || o.user?.name || 'Guest'}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.reduce((n, i) => n + i.qty, 0)} products</td>
                  <td>{o.total.toFixed(2)} DH</td>
                  <td>
                    <StatusPill value={label(o.status)} />
                  </td>
                  <td>
                    <div className="product-row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)}>Details</button>
                      <button className="btn btn-danger btn-sm delete-x" onClick={() => handleDelete(o)} aria-label="Delete order">
                        X
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    No orders match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          canEdit={can('processOrders')}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => {
            setSelectedOrder(updated)
            load()
          }}
        />
      )}
    </div>
  )
}

export default Orders