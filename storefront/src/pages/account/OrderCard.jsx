import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import { resolveImageUrl } from '../../utils/imageUrl.js'
import {
    ORDER_STATUS,
    canCancel,
    formatDate,
    formatPrice,
    itemCount,
    orderNumber,
    trackingSteps,
} from './accountUtils.js'

export function StatusBadge({ status }) {
    const meta = ORDER_STATUS[status] || { label: status, tone: 'muted', icon: 'fa-circle' }
    return (
        <span className={`acc-badge ${meta.tone}`}>
            <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
        </span>
    )
}

// Horizontal step tracker: Placed → Confirmed → Shipped → Delivered
export function OrderTracker({ order }) {
    if (order.status === 'cancelled') {
        return (
            <div className="acc-alert danger acc-tracker-cancelled">
                <i className="fa-solid fa-ban"></i> This order was cancelled{order.updatedAt ? ` on ${formatDate(order.updatedAt)}` : ''}.
            </div>
        )
    }
    const steps = trackingSteps(order)
    return (
        <ol className="acc-tracker" aria-label="Order progress">
            {steps.map((step) => (
                <li key={step.key} className={`${step.done ? 'done' : ''} ${step.current ? 'current' : ''}`.trim()}>
                    <span className="acc-tracker-dot"><i className={`fa-solid ${step.done ? step.icon : step.icon}`}></i></span>
                    <span className="acc-tracker-label">{step.label}</span>
                    {step.done && step.date && <span className="acc-tracker-date">{formatDate(step.date)}</span>}
                </li>
            ))}
        </ol>
    )
}

function OrderCard({ order, onUpdated, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const address = order.shippingAddress || {}
    const awaitingPayment = order.paymentMethod === 'online' && order.paymentStatus !== 'paid' && order.status === 'pending'

    const cancel = async () => {
        setBusy(true)
        setError('')
        try {
            const updated = await api.post(`/orders/${order._id}/cancel`, {})
            onUpdated?.(updated)
            setConfirming(false)
        } catch (err) {
            setError(err.message || 'Could not cancel this order')
        } finally {
            setBusy(false)
        }
    }

    return (
        <article className={`acc-card acc-order${open ? ' open' : ''}`}>
            <button type="button" className="acc-order-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                <div className="acc-order-id">
                    <strong>Order {orderNumber(order)}</strong>
                    <span>{formatDate(order.createdAt)} · {itemCount(order)} item{itemCount(order) > 1 ? 's' : ''}</span>
                </div>
                <div className="acc-order-thumbs" aria-hidden="true">
                    {(order.items || []).slice(0, 3).map((item, index) => (
                        <img key={index} src={resolveImageUrl(item.image)} alt="" loading="lazy" />
                    ))}
                    {order.items?.length > 3 && <span>+{order.items.length - 3}</span>}
                </div>
                <StatusBadge status={order.status} />
                <strong className="acc-order-total">{formatPrice(order.total)}</strong>
                <i className={`fa-solid fa-chevron-down acc-chevron`} aria-hidden="true"></i>
            </button>

            <OrderTracker order={order} />
            {awaitingPayment && (
                <p className="acc-alert warn"><i className="fa-regular fa-credit-card"></i> Waiting for your online payment.</p>
            )}

            {open && (
                <div className="acc-order-body">
                    <ul className="acc-order-items">
                        {(order.items || []).map((item, index) => {
                            const productId = item.product?._id || item.product
                            return (
                                <li key={index}>
                                    <img src={resolveImageUrl(item.image)} alt="" loading="lazy" />
                                    <div>
                                        {productId ? <Link to={`/products/${productId}`}>{item.name}</Link> : <span>{item.name}</span>}
                                        <small>{item.qty} × {formatPrice(item.price)}</small>
                                    </div>
                                    <strong>{formatPrice(item.qty * item.price)}</strong>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="acc-order-grid">
                        <div>
                            <h4>Delivery address</h4>
                            <p>
                                {address.name}<br />
                                {address.street}<br />
                                {address.postalCode} {address.city}, {address.country}<br />
                                {address.phone}
                            </p>
                        </div>
                        <div>
                            <h4>Payment</h4>
                            <p>
                                {order.paymentMethod === 'online' ? 'Online payment' : 'Cash on delivery'}<br />
                                <span className="acc-muted">
                                    {order.paymentStatus === 'paid' ? `Paid${order.paidAt ? ` on ${formatDate(order.paidAt)}` : ''}` : 'Not paid yet'}
                                </span>
                            </p>
                        </div>
                        <dl className="acc-totals">
                            <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                            {order.discount > 0 && (
                                <div><dt>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt><dd>−{formatPrice(order.discount)}</dd></div>
                            )}
                            <div><dt>Delivery</dt><dd>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Free'}</dd></div>
                            <div className="grand"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
                        </dl>
                    </div>

                    {error && <p className="acc-alert danger">{error}</p>}
                    <div className="acc-order-actions">
                        <Link className="acc-btn ghost small" to="/contact">
                            <i className="fa-regular fa-life-ring"></i> Need help?
                        </Link>
                        {canCancel(order) && !confirming && (
                            <button type="button" className="acc-btn danger-ghost small" onClick={() => setConfirming(true)}>
                                Cancel order
                            </button>
                        )}
                        {confirming && (
                            <div className="acc-confirm">
                                <span>Cancel this order?</span>
                                <button type="button" className="acc-btn danger small" disabled={busy} onClick={cancel}>
                                    {busy ? 'Cancelling…' : 'Yes, cancel'}
                                </button>
                                <button type="button" className="acc-btn ghost small" disabled={busy} onClick={() => setConfirming(false)}>
                                    Keep it
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </article>
    )
}

export default OrderCard
