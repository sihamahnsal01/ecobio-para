import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import api from '../api/client.js'
import '../assets/styles/CustomerOrders.css'

function Orders() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [orders, setOrders] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        if (!loading && !user) navigate('/account', { state: { from: location.pathname } })
    }, [loading, user, navigate, location.pathname])

    useEffect(() => {
        if (user) api.get('/orders/my').then(setOrders).catch((err) => setError(err.message))
    }, [user])

    if (loading || !user) return <main className="customer-orders"><p>Checking your account...</p></main>

    return (
        <main className="customer-orders">
            <div className="orders-heading"><div><span>My account</span><h1>Track your orders</h1></div><Link to="/products">Continue shopping</Link></div>
            {error && <p className="customer-order-error">Unable to load your orders.</p>}
            {!error && orders.length === 0 && <div className="customer-order-empty"><h2>No orders yet</h2><Link to="/products">Browse products</Link></div>}
            <div className="customer-order-list">
                {orders.map((order) => (
                    <article className="customer-order-card" key={order._id}>
                        <div className="customer-order-top"><strong>Order #{order._id.slice(-6).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span><b>{order.status}</b></div>
                        <p>{order.items.reduce((total, item) => total + item.qty, 0)} item(s) · {order.paymentMethod === 'online' ? 'Online payment' : 'Cash on delivery'}</p>
                        <strong>{Number(order.total).toFixed(2)} DH</strong>
                    </article>
                ))}
            </div>
        </main>
    )
}

export default Orders
