import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import OrderCard from './OrderCard.jsx'
import { isActiveOrder } from './accountUtils.js'

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'In progress' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
]

const matches = (order, filter) => {
    if (filter === 'active') return isActiveOrder(order)
    if (filter === 'all') return true
    return order.status === filter
}

function OrdersTab() {
    const [orders, setOrders] = useState(null)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        api.get('/orders/my')
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .catch((err) => setError(err.message || 'Unable to load your orders'))
    }, [])

    const visible = useMemo(() => (orders || []).filter((order) => matches(order, filter)), [orders, filter])
    const replace = (updated) => setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)))

    return (
        <>
            <div className="acc-head">
                <div>
                    <span className="acc-eyebrow">My account</span>
                    <h1>My orders</h1>
                    <p className="acc-muted">Follow each order from checkout to your door.</p>
                </div>
                <Link className="acc-btn ghost" to="/products">Continue shopping</Link>
            </div>

            {orders && orders.length > 0 && (
                <div className="acc-filters" role="tablist">
                    {FILTERS.map((f) => {
                        const count = orders.filter((o) => matches(o, f.key)).length
                        return (
                            <button
                                key={f.key}
                                type="button"
                                role="tab"
                                aria-selected={filter === f.key}
                                className={filter === f.key ? 'on' : ''}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label} <span>{count}</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {error && <p className="acc-alert danger">{error}</p>}
            {!error && orders === null && <p className="acc-muted">Loading your orders…</p>}

            {orders && orders.length === 0 && (
                <div className="acc-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <h2>No orders yet</h2>
                    <p className="acc-muted">When you place an order it will appear here with live tracking.</p>
                    <Link className="acc-btn" to="/products">Browse products</Link>
                </div>
            )}

            {orders && orders.length > 0 && visible.length === 0 && (
                <p className="acc-muted">No orders in this list.</p>
            )}

            <div className="acc-stack">
                {visible.map((order) => (
                    <OrderCard key={order._id} order={order} onUpdated={replace} />
                ))}
            </div>
        </>
    )
}

export default OrdersTab
