// Services.jsx
import '../assets/styles/Services.css'
import StoreDetails from '../data/storeDetails.json'

const SERVICES = [
    {
        icon: 'fa-solid fa-user-doctor',
        title: 'para-Pharmacist Consultation',
        text: 'Speak one-on-one with a licensed para-pharmacist about symptoms, medications, or which products are right for you.',
        tag: 'Free',
    },
    {
        icon: 'fa-solid fa-truck-fast',
        title: 'Fast Home Delivery',
        text: 'Next-day delivery across Morocco, with free shipping on orders over 350 dh',
        tag: 'From 49.99 dh',
    },
    {
        icon: 'fa-solid fa-heart-pulse',
        title: 'Health Checks',
        text: 'In-store blood pressure, glucose, and cholesterol screening with a same-day para-pharmacist review.',
        tag: 'From DH 150',
    },
    {
        icon: 'fa-solid fa-pills',
        title: 'Prescription Refill Reminders',
        text: 'Never run out — we’ll remind you by email or SMS when it’s time to reorder recurring medications.',
        tag: 'Free',
    },
    {
        icon: 'fa-solid fa-spa',
        title: 'Skin & Beauty Advice',
        text: 'Personalized skincare routines from our beauty consultants, based on your skin type and concerns.',
        tag: 'Free',
    },
    {
        icon: 'fa-solid fa-repeat',
        title: 'Subscribe & Save',
        text: 'Set your favourite vitamins and supplements to auto-deliver monthly and save 10% on every order.',
        tag: 'Save 10%',
    },
]

const STEPS = [
    { step: '01', title: 'Choose a service', text: 'Pick a consultation, health check, or subscription that fits your needs.' },
    { step: '02', title: 'Book or order online', text: 'Reserve a time slot in-store or complete your order in a few clicks.' },
    { step: '03', title: 'Get expert care', text: 'A licensed pharmacist handles your request — in person, online, or at your door.' },
]

function Services() {
    return (
        <div className="services-page">
            {/* Hero */}
            <section className="services-hero">
                <p className="eyebrow">WHAT WE OFFER</p>
                <h1>{StoreDetails.name} services built around you</h1>
                <p className="services-hero-text">
                    Beyond products on a shelf, {StoreDetails.name} offers real para-pharmacist
                    expertise — consultations, health checks, and delivery designed
                    to fit your life.
                </p>
            </section>

            {/* Services grid */}
            <section className="services-grid-section">
                <div className="services-grid">
                    {SERVICES.map((s) => (
                        <div className="service-card" key={s.title}>
                            <div className="service-card-top">
                                <div className="service-icon">
                                    <i className={s.icon}></i>
                                </div>
                                <span className="service-tag">{s.tag}</span>
                            </div>
                            <p className="service-title">{s.title}</p>
                            <p className="service-text">{s.text}</p>
                            <a href="/contact" className="service-link">
                                Learn more <i className="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works">
                <p className="eyebrow center">HOW IT WORKS</p>
                <h2 className="how-title">Getting help is simple</h2>

                <div className="steps-row">
                    {STEPS.map((s, i) => (
                        <div className="step-card" key={s.step}>
                            <span className="step-number">{s.step}</span>
                            <p className="step-title">{s.title}</p>
                            <p className="step-text">{s.text}</p>
                            {i < STEPS.length - 1 && <span className="step-connector"></span>}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="services-cta">
                <p className="services-cta-title">Not sure which service you need?</p>
                <p className="services-cta-sub">
                    Message our para-pharmacist team and we'll point you in the right direction.
                </p>
                <div className="services-cta-actions">
                    <a href="/contact" className="pill-btn light">
                        <i className="fa-regular fa-envelope"></i> Contact Us
                    </a>
                    <a href="tel:+390612345678" className="pill-btn outline">
                        <i className="fa-solid fa-phone"></i> Call Us Now
                    </a>
                </div>
            </section>
        </div>
    )
}

export default Services
