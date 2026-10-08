// AboutUs.jsx
import '../assets/styles/AboutUs.css'
import PharmacyMap from '../components/PharmacyMap'
import StoreDetails from '../data/storeDetails.json'
const STATS = [
    { value: '10,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Certified Products' },
    { value: 2 +'+', label: 'Years of Experience' },
    { value: '4.9/5', label: 'Average Rating' },
]

const VALUES = [
    {
        icon: 'fa-solid fa-shield-halved',
        title: 'Certified Quality',
        text: `Every product we sell is approved by the ${StoreDetails.address.country} Ministry of Health and meets strict EU regulations.`
    },
    {
        icon: 'fa-solid fa-user-doctor',
        title: 'Expert Guidance',
        text: `Our licensed ${StoreDetails.tagline} are available to answer questions and help you choose the right products.`
    },
    {
        icon: 'fa-solid fa-truck-fast',
        title: 'Fast, Reliable Delivery',
        text: `Next-day delivery across ${StoreDetails.address.country}, with free shipping on orders over DH 35.`
    },
    {
        icon: 'fa-regular fa-heart',
        title: 'Care First',
        text: `We treat every customer like a neighbor walking into our ${StoreDetails.tagline} \u2014 with patience and honesty.`
    },
]

const TEAM = [
    { name: 'Dr. Elena Marino', role: 'Founder & Chief Pharmacist', image: '/team/elena.jpg' },
    { name: 'Marco Bianchi', role: 'Head of Operations', image: '/team/marco.jpg' },
    { name: 'Dr. Sofia Greco', role: 'Clinical Pharmacist', image: '/team/sofia.jpg' },
    { name: 'Luca Romano', role: 'Customer Care Lead', image: '/team/luca.jpg' },
]

function AboutUs() {
    return (
        <div className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <p className="eyebrow">OUR STORY</p>
                <h1>Health advice you can trust, care you can feel</h1>
                <p className="about-hero-text">
                    {StoreDetails.name} started as a single {StoreDetails.tagline} counter in {StoreDetails.address.country} in 2024.
                    Today we help thousands of customers across Morocco access certified
                    health, beauty, and wellness products \u2014 backed by real {StoreDetails.tagline} expertise.
                </p>
            </section>

            {/* Stats */}
            <section className="about-stats">
                {STATS.map((s) => (
                    <div className="stat-card" key={s.label}>
                        <p className="stat-value">{s.value}</p>
                        <p className="stat-label">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Story split */}
            <section className="about-story">
                <PharmacyMap />

                <div className="about-story-text">
                    <p className="eyebrow">HOW WE STARTED</p>
                    <h2>From a neighborhood counter to a trusted online {StoreDetails.tagline}</h2>
                    <p>
                        Our founder, a licensed pharmacist, opened {StoreDetails.name} to give her
                        {StoreDetails.address.country} neighborhood honest, unhurried health advice \u2014 something she
                        felt was missing from larger chains.
                    </p>
                    <p>
                        As more customers asked for the same trustworthy guidance online, we
                        built a digital {StoreDetails.tagline} that keeps that same promise: every product
                        certified, every question answered by a real {StoreDetails.tagline}, every order
                        handled with care.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="about-values">
                <p className="eyebrow center">WHAT WE STAND FOR</p>
                <h2 className="values-title">Our values</h2>

                <div className="values-grid">
                    {VALUES.map((v) => (
                        <div className="value-card" key={v.title}>
                            <div className="value-icon">
                                <i className={v.icon}></i>
                            </div>
                            <p className="value-title">{v.title}</p>
                            <p className="value-text">{v.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="about-team" id='about-team'>
                <p className="eyebrow center">MEET THE TEAM</p>
                <h2 className="team-title">The people behind {StoreDetails.name}</h2>

                <div className="team-grid">
                    {TEAM.map((m) => (
                        <div className="team-card" key={m.name}>
                            <div className="team-photo">
                                <img src={m.image} alt={m.name} />
                            </div>
                            <p className="team-name">{m.name}</p>
                            <p className="team-role">{m.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta">
                <p className="about-cta-title">Have a question for our {StoreDetails.tagline}?</p>
                <p className="about-cta-sub">
                    We're here Monday to Saturday, {StoreDetails.hours.monday}, ready to help you find the right products.
                </p>
                <div className="about-cta-actions">
                    <a href="/contact" className="pill-btn light">
                        <i className="fa-regular fa-envelope"></i> Contact Us
                    </a>
                    <a href="/products" className="pill-btn outline">
                        <i className="fa-solid fa-bag-shopping"></i> Browse Products
                    </a>
                </div>
            </section>
        </div>
    )
}

export default AboutUs
