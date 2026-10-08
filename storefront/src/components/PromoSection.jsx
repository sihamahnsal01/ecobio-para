import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, RotateCcw, Users, Lock, ArrowRight } from 'lucide-react'
import '../assets/styles/PromoSection.css'
import StoreDetails from '../data/storeDetails.json'
import api from '../api/client.js'

function PromoSection() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ type: '', message: '' })
    const [submitting, setSubmitting] = useState(false)

    const subscribe = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setStatus({ type: '', message: '' })

        try {
            await api.post('/subscribers', { email })
            setEmail('')
            setStatus({ type: 'success', message: 'You are subscribed. We will email you about new offers.' })
        } catch {
            setStatus({ type: '', message: '' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="promo-wrap">
            {/* Hero banner */}
            <div className="promo-banner block={true}">
                <div className="promo-banner-left">
                    <span className="promo-badge">⚡ LIMITED TIME OFFER</span>
                    <h2 className="promo-title">Free shipping on orders over 350 {StoreDetails.settings.currency}</h2>
                    <p className="promo-text">
                        Stock up on your favourite vitamins, skincare, and wellness
                        essentials. Free next-day delivery across Italy on qualifying orders.
                    </p>
                    <Link to="/products" className="promo-cta">
                        Shop Now <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="promo-banner-right">
                    <div className="promo-perk">
                        <Truck size={22} />
                        <div>
                            <p className="perk-title">Free Next-Day Delivery</p>
                            <p className="perk-sub">On orders over 350 {StoreDetails.settings.currency} across Morocco</p>
                        </div>
                    </div>
                    <div className="promo-perk">
                        <ShieldCheck size={22} />
                        <div>
                            <p className="perk-title">Certified Products Only</p>
                            <p className="perk-sub">Morocco Ministry of Health approved</p>
                        </div>
                    </div>
                    <div className="promo-perk">
                        <RotateCcw size={22} />
                        <div>
                            <p className="perk-title">30-Day Easy Returns</p>
                            <p className="perk-sub">No questions asked return policy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why choose us */}
            <div className="why-choose block={true}">
                <p className="why-eyebrow">WHY CHOOSE US</p>
                <h3 className="why-title">Trusted by 1,000+ customers</h3>

                <div className="why-grid">
                    <div className="why-card">
                        <div className="why-card-top">
                            <ShieldCheck size={22} />
                            <span className="why-stat">100% <small>CERTIFIED</small></span>
                        </div>
                        <p className="why-card-title">Certified Products</p>
                        <p className="why-card-text">
                            All products approved by the moroccan Ministry of Health.
                        </p>
                    </div>

                    <div className="why-card">
                        <div className="why-card-top">
                            <Truck size={22} />
                            <span className="why-stat">24h <small>DELIVERY</small></span>
                        </div>
                        <p className="why-card-title">Fast Delivery</p>
                        <p className="why-card-text">
                            Next-day delivery across moroccan. Free shipping on orders over 350 {StoreDetails.settings.currency}.
                        </p>
                    </div>

                    <div className="why-card">
                        <div className="why-card-top">
                            <Users size={22} />
                            <span className="why-stat">2+ <small>YEARS EXP.</small></span>
                        </div>
                        <p className="why-card-title">Expert Pharmacist Advice</p>
                        <p className="why-card-text">
                            Our licensed pharmacists are available to answer your health questions.
                        </p>
                    </div>

                    <div className="why-card">
                        <div className="why-card-top">
                            <Lock size={22} />
                            <span className="why-stat">SSL <small>SECURED</small></span>
                        </div>
                        <p className="why-card-title">Secure Payments</p>
                        <p className="why-card-text">
                            Your transactions are protected with 256-bit SSL encryption.
                        </p>
                    </div>
                </div>
            </div>

            {/* Newsletter */}
            <div className="newsletter block={true}">
                <div>
                    <p className="newsletter-title">Get wellness tips &amp; exclusive offers</p>
                    <p className="newsletter-sub">Join 5,000+ subscribers. No spam, unsubscribe anytime.</p>
                </div>
                <form className="newsletter-form" onSubmit={subscribe}>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        aria-label="Email address"
                        required
                    />
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
                {status.message && <p className={`newsletter-status ${status.type}`}>{status.message}</p>}
            </div>
        </section>
    )
}

export default PromoSection