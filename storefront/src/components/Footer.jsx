// Footer.jsx
import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../assets/styles/Footer.css'
import storeDetails from '../data/storeDetails.json'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import { useWishlist } from './WishlistContext.jsx'
import { detectCountry, countryName } from '../utils/country.js'
import '../assets/styles/Community.css'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const SOCIALS = [
    { key: 'instagramURL', label: 'Instagram', icon: 'fa-brands fa-instagram' },
    { key: 'facebookURL', label: 'Facebook', icon: 'fa-brands fa-facebook-f' },
    { key: 'tiktokURL', label: 'TikTok', icon: 'fa-brands fa-tiktok' },
]
const MAX_FOOTER_CATEGORIES = 6

// Turns the per-day hours in storeDetails.json into short rows,
// e.g. Mon – Sat: 09:00 – 19:30 / Sun: Closed
function groupHours(hours) {
    const groups = []
    for (const day of DAYS) {
        const value = hours?.[day]
        if (!value) continue
        const last = groups[groups.length - 1]
        if (last && last.value === value) last.end = day
        else groups.push({ start: day, end: day, value })
    }
    return groups.map((group) => ({
        label: group.start === group.end
            ? DAY_LABELS[group.start]
            : `${DAY_LABELS[group.start]} – ${DAY_LABELS[group.end]}`,
        value: /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(group.value)
            ? group.value.replace('-', ' – ')
            : group.value,
    }))
}

function Footer() {
    const { user, logout } = useAuth()
    const [categories, setCategories] = useState([])
    const { wishlistCount } = useWishlist()
    const countryCode = useMemo(() => detectCountry(user), [user])
    const countryLabel = countryName(countryCode)

    useEffect(() => {
        let cancelled = false

        const loadCategories = async () => {
            try {
                const data = await api.get('/categories')
                if (!cancelled) setCategories(Array.isArray(data) ? data : [])
            } catch {
                if (!cancelled) setCategories([])
            }
        }

        loadCategories()
        return () => { cancelled = true }
    }, [])

    const { address, contact, hours, social } = storeDetails
    const phoneLink = `tel:${(contact.phone || '').replace(/[^\d+]/g, '')}`
    const whatsappLink = `https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}`
    const mapsLink = `https://www.google.com/maps?q=${address.lat},${address.lng}`
    const hourRows = groupHours(hours)
    const socialLinks = SOCIALS.filter((item) => social?.[item.key])

    return (
        <footer className="site-footer">
            <div className="footer-grid">
                {/* About the shop */}
                <div className="footer-col footer-brand">
                    <img className="footer-logo" src="/footerLogo.png" alt={storeDetails.name} />
                    <p className="footer-tagline">Your Health, Our Priority</p>
                    <p className="footer-about">
                        {storeDetails.description ||
                            'Eco&Bio Para is your online parapharmacy in Marrakech. Skincare, wellness and natural health products, chosen with care and delivered to your door.'}
                    </p>
                    <div className="footer-social">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        {socialLinks.map((item) => (
                            <a key={item.key} href={social[item.key]} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                                <i className={item.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop */}
                <nav className="footer-col" aria-label="Shop">
                    <h4 className="footer-heading">Shop</h4>
                    <ul className="footer-list">
                        <li><NavLink to="/products">All products</NavLink></li>
                        {categories.slice(0, MAX_FOOTER_CATEGORIES).map((category) => (
                            <li key={category._id || category.name}>
                                <NavLink to={`/products?category=${encodeURIComponent(category.name)}`}>
                                    {category.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Customer care */}
                <nav className="footer-col" aria-label="Customer care">
                    <h4 className="footer-heading">Customer care</h4>
                    <ul className="footer-list">
                        <li><NavLink to="/account/orders">Track your order</NavLink></li>
                        <li>
                            {user ? (
                                <button type="button" className="footer-account-link" onClick={logout}>Logout</button>
                            ) : (
                                <NavLink to="/account">Login / Sign up</NavLink>
                            )}
                        </li>
                        <li><NavLink to="/contact">Contact us</NavLink></li>
                        <li><NavLink to="/AboutUs">About us</NavLink></li>
                        <li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
                        <li><NavLink to="/aboutUs#about-team">Terms</NavLink></li>
                        <li><NavLink to="/Wishlist">Wishlist</NavLink></li>
                        <li><NavLink to="/Reviews">Reviews</NavLink></li>
                    </ul>
                </nav>

                {/* Visit & contact */}
                <div className="footer-col">
                    <h4 className="footer-heading">Visit us</h4>
                    <ul className="footer-contact">
                        <li>
                            <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                                {address.line1}, {address.line2}<br />
                                {address.postalCode} {address.city}, {address.country}
                            </a>
                        </li>
                        <li>
                            <i className="fa-solid fa-phone" aria-hidden="true"></i>
                            <a href={phoneLink}>{contact.phone}</a>
                        </li>
                        <li>
                            <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </li>
                    </ul>

                    <h4 className="footer-heading footer-heading-sub">Opening hours</h4>
                    <ul className="footer-hours">
                        {hourRows.map((row) => (
                            <li key={row.label}>
                                <span>{row.label}</span>
                                <span>{row.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="footer-payments">
                <span className="footer-payments-label">Payment options</span>
                <span className="footer-pay-chip">
                    <i className="fa-solid fa-money-bill-wave" aria-hidden="true"></i> Cash on delivery
                </span>
                <span className="footer-pay-chip">
                    <i className="fa-solid fa-credit-card" aria-hidden="true"></i> Card payment, secured by Stripe
                </span>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} {storeDetails.name}. All rights reserved.</p>
                <p className="footer-trust">
                    <i className="fa-solid fa-shield-halved"></i>
                    Certified products &middot; Secure payments &middot; Fast delivery
                </p>
                <div className="footer-icons">
                    <NavLink to="/account/wishlist" className="footer-icon-btn" aria-label="My wishlist" title="My wishlist">
                        <i className="fa-regular fa-heart"></i>
                        {wishlistCount > 0 && (
                            <span className="footer-icon-count">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
                        )}
                    </NavLink>
                    <span
                        className="footer-icon-btn footer-country"
                        title={countryLabel ? `Your country: ${countryLabel}` : 'Your country'}
                        aria-label={countryLabel ? `Your country: ${countryLabel}` : 'Your country'}
                    >
                        <i className="fa-solid fa-globe"></i>
                        {countryCode && <b>{countryCode}</b>}
                    </span>
                    <NavLink to="/reviews" className="footer-icon-btn" aria-label="Customer reviews" title="Customer reviews">
                        <i className="fa-regular fa-message"></i>
                    </NavLink>
                </div>
            </div>
        </footer>
    )
}

export default Footer
