// Contact.jsx
import { useState } from 'react'
import '../assets/styles/Contact.css'
import StoreDetails from '../data/storeDetails.json'

const HOURS = [
    { day: 'Monday', time: StoreDetails.hours.monday },
    { day: 'Tuesday', time: StoreDetails.hours.tuesday },
    { day: 'Wednesday', time: StoreDetails.hours.wednesday },
    { day: 'Thursday', time: StoreDetails.hours.thursday},
    { day: 'Friday', time: StoreDetails.hours.friday },
    { day: 'Saturday', time: StoreDetails.hours.saturday },
    { day: 'Sunday', time: StoreDetails.hours.sunday}
]

const FAQS = [
    {
        q: `Do I need a prescription to buy products on ${StoreDetails.name}?`,
        a: `No. All products in our online catalog are over-the-counter (OTC) and do not require a medical prescription. They are certified by the Moroccan Ministry of Health for direct sale. For prescription medications, please visit our physical para-pharmacy in Morocco.`
    },
    {
        q: 'How long does delivery take?',
        a: 'Standard delivery across Morocco takes 1-2 business days. Orders over DH 35 qualify for free next-day delivery.'
    },
    {
        q: 'What is your return policy?',
        a: 'We offer a 30-day, no-questions-asked return policy on unopened products. Contact our team to start a return.'
    },
    {
        q: 'Can I get para-pharmacist advice online?',
        a: 'Yes, our licensed para-pharmacists are available via the contact form or phone during opening hours to answer your questions.'
    },
    {
        q: 'How do I track my order?',
        a: 'Once your order ships, you\u2019ll receive a tracking link by email. You can also check order status from your account.'
    },
]

function Contact() {
    const [openFaq, setOpenFaq] = useState(0)
    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Wire this up to your actual email/API endpoint
        setSubmitted(true)
    }

    return (
        <div className="contact-page">
            {/* Hero */}
            <section className="contact-hero">
                <span className="contact-status">
                    <span className="status-dot"></span>
                    Open Mon-Sat &middot; 09:00-19:30
                </span>
                <h1>We're here to help</h1>
                <p className="contact-hero-text">
                    Visit our {StoreDetails.tagline} in Marrakech, call us, or send a message. Our licensed
                    para-pharmacists are ready to answer your health and wellness questions.
                </p>
                <div className="contact-hero-actions">
                    <a href="tel:+390612345678" className="pill-btn">
                        <i className="fa-solid fa-phone"></i> {StoreDetails.contact.phone}
                    </a>
                    <a href="mailto:info@ecobio-para.ma" className="pill-btn">
                        <i className="fa-regular fa-envelope"></i> {StoreDetails.contact.email}
                    </a>
                </div>
            </section>

            {/* Map + hours */}
            <section className="contact-info-grid">
                <div className="contact-map-col">
                    <div className="contact-map">
                            <div className="map-pin">
                                <p className="map-pin-name">{StoreDetails.tagline}</p>
                                <p className="map-pin-address">
                                    {StoreDetails.address.line2}
                                    {StoreDetails.address.line1}
                                    {StoreDetails.address.city}
                                </p>
                            </div>
                    </div>

                    <div className="find-us-card">
                        <p className="find-us-title">Find Us</p>
                        <div className="find-us-row">
                            <i className="fa-solid fa-location-dot"></i>
                            <div>
                                <p className="find-us-label">ADDRESS</p>
                                <p>{StoreDetails.address.line2} {StoreDetails.address.line1}<br />{StoreDetails.address.postalCode} {StoreDetails.address.city}, {StoreDetails.address.country}</p>
                            </div>
                        </div>
                        <div className="find-us-row">
                            <i className="fa-solid fa-phone"></i>
                            <div>
                                <p className="find-us-label">PHONE</p>
                                <p>{StoreDetails.contact.phone}</p>
                            </div>
                        </div>
                        <div className="find-us-row">
                            <i className="fa-regular fa-envelope"></i>
                            <div>
                                <p className="find-us-label">EMAIL</p>
                                <p>{StoreDetails.contact.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hours-card">
                    <div className="hours-header">
                        <div>
                            <p className="hours-title">Opening Hours</p>
                            <p className="hours-sub">Marrakech local time (CET)</p>
                        </div>
                        <span className="hours-icon"><i className="fa-regular fa-clock"></i></span>
                    </div>

                    <ul className="hours-list">
                        {HOURS.map((h) => (
                            <li key={h.day} className={h.today ? 'today-row' : ''}>
                                <span>
                                    {h.today && <span className="status-dot small"></span>}
                                    {h.day}
                                    {h.today && <span className="today-tag">Today</span>}
                                </span>
                                <span>
                                    {h.time}
                                    <span className="status-dot small trailing"></span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className="hours-note">
                        <i className="fa-regular fa-circle-question"></i>
                        Hours may vary on public holidays. Call ahead to confirm.
                    </p>
                </div>
            </section>

            {/* Form */}
            <section className="contact-form-grid">
                <div className="contact-form-intro">
                    <p className="eyebrow">GET IN TOUCH</p>
                    <h2>Send us a message</h2>
                    <p className="contact-form-text">
                        Have a question about a product, need para-pharmacist advice, or want
                        to check on your order? Our team responds within 2 business hours.
                    </p>

                    <div className="perk-row">
                        <i className="fa-regular fa-clock"></i>
                        <div>
                            <p className="perk-title">Fast Response</p>
                            <p className="perk-sub">We reply within 2 business hours</p>
                        </div>
                    </div>
                    <div className="perk-row">
                        <i className="fa-regular fa-circle-check"></i>
                        <div>
                            <p className="perk-title">Confidential</p>
                            <p className="perk-sub">Your health data is always private</p>
                        </div>
                    </div>
                    <div className="perk-row">
                        <i className="fa-solid fa-user-doctor"></i>
                        <div>
                            <p className="perk-title">Expert Advice</p>
                            <p className="perk-sub">Licensed para-pharmacists on staff</p>
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-field">
                            <label>FULL NAME <span>*</span></label>
                            <input
                                name="name" value={form.name} onChange={handleChange}
                                placeholder="Marco Rossi" required
                            />
                        </div>
                        <div className="form-field">
                            <label>EMAIL <span>*</span></label>
                            <input
                                type="email" name="email" value={form.email} onChange={handleChange}
                                placeholder="marco@email.it" required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>PHONE (OPTIONAL)</label>
                            <input
                                name="phone" value={form.phone} onChange={handleChange}
                                placeholder="+212 XXX XXX XXXX"
                            />
                        </div>
                        <div className="form-field">
                            <label>SUBJECT <span>*</span></label>
                            <select name="subject" value={form.subject} onChange={handleChange} required>
                                <option value="">Select a subject</option>
                                <option value="order">Order Question</option>
                                <option value="product">Product Advice</option>
                                <option value="return">Return / Refund</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>MESSAGE <span>*</span></label>
                        <textarea
                            name="message" value={form.message} onChange={handleChange}
                            placeholder="How can we help you today? Describe your question or request in detail..."
                            rows={5} required
                        />
                    </div>

                    <p className="form-legal">
                        By submitting this form, you agree to our <a href="/privacy-policy">Privacy Policy</a>.
                        Your data is processed in accordance with GDPR regulations.
                    </p>

                    <button type="submit" className="submit-btn">
                        <i className="fa-regular fa-paper-plane"></i> Send Message
                    </button>

                    {submitted && <p className="form-success">Thanks — we'll be in touch shortly.</p>}
                </form>
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <p className="eyebrow center">FAQ</p>
                <h2 className="faq-title">Frequently Asked Questions</h2>
                <p className="faq-sub">
                    Can't find what you're looking for? Contact us directly and our para-pharmacist team will help.
                </p>

                <div className="faq-list">
                    {FAQS.map((item, i) => (
                        <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={item.q}>
                            <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <span>{item.q}</span>
                                <span className="faq-toggle">
                                    {openFaq === i ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-plus"></i>}
                                </span>
                            </button>
                            {openFaq === i && <p className="faq-answer">{item.a}</p>}
                        </div>
                    ))}
                </div>

                <div className="faq-cta">
                    <p className="faq-cta-title">Still have questions?</p>
                    <p className="faq-cta-sub">
                        Our parapharmacist team is ready to help you find the right products for your health needs.
                    </p>
                    <div className="faq-cta-actions">
                        <a href="tel:+212 673-534182" className="pill-btn light">
                            <i className="fa-solid fa-phone"></i> Call Us Now
                        </a>
                        <a href="mailto:info@ecobio-para.ma" className="pill-btn outline">
                            <i className="fa-regular fa-envelope"></i> Send Email
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact
