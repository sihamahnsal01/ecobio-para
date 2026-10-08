import { useState } from 'react'
import api from '../api/client.js'
import StatusPill from './StatusPill.jsx'
import '../styles/ProductEditor.css'

// Matches the Order model's status enum exactly (back/models/Order.js
// and orderController.js's updateOrderStatus).
const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function OrderDetail({ order, canEdit, onClose, onUpdated }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleStatusSave = async () => {
    if (status === order.status) return
    setSaving(true)
    setError('')
    try {
      const updated = await api.put(`/orders/${order._id}/status`, { status })
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
      setStatus(order.status) // revert the dropdown on failure
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    const previousTitle = document.title
    
    // Extract the order code (e.g., "Order-CE2271")
    const orderCode = `Order-${order._id.slice(-6).toUpperCase()}`
    
    // Temporarily set document title to the order code so the browser uses it as the default filename
    document.title = orderCode
    
    window.print()
    
    // Restore original title
    document.title = previousTitle
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Custom Header for Printed Page */}
        <div className="print-only-header">
          <h2>Eco&Bio - para</h2>
        </div>

        <div className="drawer-header">
          <div className="order-receipt-brand">
            <img src="/logo.png" alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} />
            <span className="print-order-number">Order #{order._id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="order-detail-actions no-print">
            <button className="btn btn-secondary btn-sm" type="button" onClick={handlePrint}>
              <i className="fa-solid fa-print"></i> Print
            </button>
            <button className="icon-btn" type="button" onClick={onClose} aria-label="Close order details">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="drawer-body">
          <p className="section-heading" style={{ marginTop: 0, paddingTop: 0, border: 'none' }}>
            Status
          </p>
          {canEdit ? (
            <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={saving}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{label(s)}</option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={handleStatusSave}
                disabled={saving || status === order.status}
              >
                {saving ? 'Saving…' : 'Update status'}
              </button>
              {error && <span className="error-text">{error}</span>}
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <StatusPill value={label(order.status)} />
            </div>
          )}

          <p className="section-heading">
            Items
          </p>
          <div className="order-item-list">
            {order.items.map((item, i) => (
              <div className="order-item-row" key={i}>
                <div className="product-thumb">
                  {item.image ? <img src={item.image} alt="" /> : <i className="fa-solid fa-image"></i>}
                </div>
                <div className="order-item-info">
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-meta">Qty {item.qty}</p>
                </div>
                <p className="order-item-price">{(item.price * item.qty).toFixed(2)} DH</p>
              </div>
            ))}
          </div>

          <p className="section-heading">Customer</p>
          <p className="order-customer-line">{order.shippingAddress?.name || order.user?.name || 'Guest customer'}</p>
          <p className="order-customer-line muted-text">{order.shippingAddress?.email || order.user?.email}</p>
          <p className="order-customer-line muted-text">{order.shippingAddress?.phone}</p>

          <p className="section-heading">Shipping Address</p>
          <p className="order-customer-line muted-text">
            {order.shippingAddress?.street}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode},{' '}
            {order.shippingAddress?.country}
          </p>

          <p className="section-heading">Payment method</p>
          <p className="order-customer-line">
            {order.paymentMethod === 'online' ? 'Online payment (card)' : 'Cash on delivery'}
          </p>
        </div>

        <div className="drawer-footer">
          <div>
            <p className="muted-text" style={{ margin: 0 }}>
              Subtotal: {order.subtotal.toFixed(2)} DH
              {order.discount > 0 && ` · Promo ${order.promoCode || ''}: -${order.discount.toFixed(2)} DH`}
              {` · Delivery: ${order.deliveryFee.toFixed(2)} DH`}
            </p>
          </div>
          <span className="order-total-label">Total</span>
          <span className="order-total-value">{order.total.toFixed(2)} DH</span>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail