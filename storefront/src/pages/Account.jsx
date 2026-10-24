import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import { useWishlist } from '../components/WishlistContext.jsx'
import AuthForm from './account/AuthForm.jsx'
import Overview from './account/Overview.jsx'
import OrdersTab from './account/OrdersTab.jsx'
import WishlistTab from './account/WishlistTab.jsx'
import ReviewsTab from './account/ReviewsTab.jsx'
import ProfileTab from './account/ProfileTab.jsx'
import { initialsOf } from './account/accountUtils.js'
import '../assets/styles/Account.css'
import '../assets/styles/Community.css'

const TABS = [
    { to: '/account', label: 'Overview', icon: 'fa-solid fa-gauge', end: true },
    { to: '/account/orders', label: 'My orders', icon: 'fa-solid fa-box' },
    { to: '/account/wishlist', label: 'Wishlist', icon: 'fa-regular fa-heart', badge: 'wishlist' },
    { to: '/account/reviews', label: 'Reviews & comments', icon: 'fa-regular fa-comment' },
    { to: '/account/profile', label: 'Profile & security', icon: 'fa-regular fa-user' },
]

// /account and its sub-pages. Visitors see the sign-in form; customers get the dashboard.
function Account() {
    const { user, loading, logout } = useAuth()
    const { wishlistCount } = useWishlist()
    const navigate = useNavigate()

    if (loading) {
        return (
            <main className="account-page">
                <p className="acc-muted acc-center">Loading your account…</p>
            </main>
        )
    }
    if (!user) return <AuthForm />

    const signOut = () => {
        logout()
        navigate('/account', { replace: true })
    }

    return (
        <main className="account-page">
            <div className="acc-layout">
                <aside className="acc-sidebar">
                    <div className="acc-identity">
                        {user.avatar ? (
                            <img className="acc-avatar" src={user.avatar} alt="" />
                        ) : (
                            <span className="acc-avatar" aria-hidden="true">{initialsOf(user.name)}</span>
                        )}
                        <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <nav className="acc-nav" aria-label="My account">
                        {TABS.map((tab) => (
                            <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <i className={tab.icon}></i>
                                <span>{tab.label}</span>
                                {tab.badge === 'wishlist' && wishlistCount > 0 && <b className="acc-count">{wishlistCount}</b>}
                            </NavLink>
                        ))}
                        <button type="button" className="acc-signout" onClick={signOut}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Sign out</span>
                        </button>
                    </nav>
                </aside>

                <section className="acc-content">
                    <Routes>
                        <Route index element={<Overview />} />
                        <Route path="orders" element={<OrdersTab />} />
                        <Route path="wishlist" element={<WishlistTab />} />
                        <Route path="reviews" element={<ReviewsTab />} />
                        <Route path="profile" element={<ProfileTab />} />
                        <Route path="*" element={<Navigate to="/account" replace />} />
                    </Routes>
                </section>
            </div>
        </main>
    )
}

export default Account
