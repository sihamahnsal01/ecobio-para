import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import { useAuth } from '../../api/AuthContext.jsx'
import { useWishlist } from '../../components/WishlistContext.jsx'
import { resolveImageUrl } from '../../utils/imageUrl.js'
import OrderCard from './OrderCard.jsx'
import { formatDate, isActiveOrder } from './accountUtils.js'

function Overview() {
    const { user } = useAuth()
    const { items: wishlist } = useWishlist()
    const [orders, setOrders] = useState(null)
    const [activity, setActivity] = useState(null)

    useEffect(() => {
        api.get('/orders/my').then((d) => setOrders(Array.isArray(d) ? d : [])).catch(() => setOrders([]))
        api.get('/reviews/mine').then(setActivity).catch(() => setActivity({ reviews: [], replies: [] }))
    }, [])

    const firstName = (user.name || '').split(' ')[0]
    const active = (orders || []).filter(isActiveOrder)
    const latest = active[0] || (orders || [])[0]
    const commentCount = activity ? activity.reviews.length + activity.replies.length : null
    const replaceLatest = (updated) => setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)))

    const stats = [
        { label: 'Orders', value: orders?.length, icon: 'fa-box', to: '/account/orders' },
        { label: 'In progress', value: orders ? active.length : undefined, icon: 'fa-truck-fast', to: '/account/orders' },
        { label: 'Wishlist', value: wishlist.length, icon: 'fa-heart', to: '/account/wishlist' },
        { label: 'Reviews & comments', value: commentCount ?? undefined, icon: 'fa-comment', to: '/account/reviews' },
    ]

    return (
        <>
            <div className="acc-head">
                <div>
                    <span className="acc-eyebrow">My account</span>
                    <h1>Hello{firstName ? `, ${firstName}` : ''} 👋</h1>
                    <p className="acc-muted">
                        Member since {formatDate(user.createdAt) || 'today'}. Here is what's happening with your account.
                    </p>
                </div>
            </div>

            <div className="acc-stats">
                {stats.map((stat) => (
                    <Link key={stat.label} to={stat.to} className="acc-stat">
                        <i className={`fa-solid ${stat.icon}`}></i>
                        <strong>{stat.value ?? '–'}</strong>
                        <span>{stat.label}</span>
                    </Link>
                ))}
            </div>

            <section className="acc-section">
                <div className="acc-section-head">
                    <h2>{latest && isActiveOrder(latest) ? 'Your current order' : 'Latest order'}</h2>
                    {orders?.length > 0 && <Link to="/account/orders">All orders</Link>}
                </div>
                {orders === null ? (
                    <p className="acc-muted">Loading…</p>
                ) : latest ? (
                    <OrderCard order={latest} onUpdated={replaceLatest} />
                ) : (
                    <div className="acc-card acc-empty small">
                        <p className="acc-muted">You haven't ordered anything yet.</p>
                        <Link className="acc-btn small" to="/products">Start shopping</Link>
                    </div>
                )}
            </section>

            <section className="acc-section">
                <div className="acc-section-head">
                    <h2>From your wishlist</h2>
                    {wishlist.length > 0 && <Link to="/account/wishlist">See all</Link>}
                </div>
                {wishlist.length === 0 ? (
                    <div className="acc-card acc-empty small">
                        <p className="acc-muted">Save products you love with the ♡ button.</p>
                    </div>
                ) : (
                    <div className="acc-mini-grid">
                        {wishlist.slice(0, 4).map((product) => {
                            const id = product._id || product.id
                            return (
                                <Link key={id} to={`/products/${id}`} className="acc-mini">
                                    <img src={resolveImageUrl(product.image)} alt="" loading="lazy" />
                                    <span>{product.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="acc-section">
                <div className="acc-quick">
                    <Link to="/account/profile"><i className="fa-regular fa-id-card"></i> Edit my details</Link>
                    <Link to="/account/profile#addresses"><i className="fa-solid fa-location-dot"></i> Delivery addresses</Link>
                    <Link to="/account/profile#security"><i className="fa-solid fa-lock"></i> Change password</Link>
                    <Link to="/reviews"><i className="fa-regular fa-star"></i> Customer reviews</Link>
                </div>
            </section>
        </>
    )
}

export default Overview
