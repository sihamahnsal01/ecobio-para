// PrivacyPolicy.jsx
import '../assets/styles/PrivacyPolicy.css'
import StoreDetails from '../data/storeDetails.json'


const SECTIONS = [
    { id: 'who-we-are', title: '1. Who We Are' },
    { id: 'data-we-collect', title: '2. Data We Collect' },
    { id: 'how-we-use-data', title: '3. How We Use Your Data' },
    { id: 'legal-basis', title: '4. Legal Basis for Processing' },
    { id: 'sharing', title: '5. Sharing Your Data' },
    { id: 'cookies', title: '6. Cookies' },
    { id: 'retention', title: '7. Data Retention' },
    { id: 'your-rights', title: '8. Your Rights (GDPR)' },
    { id: 'security', title: '9. Data Security' },
    { id: 'children', title: '10. Children’s Privacy' },
    { id: 'changes', title: '11. Changes to This Policy' },
    { id: 'contact', title: '12. Contact Us' },
]

function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <section className="legal-hero">
                <p className="eyebrow">LEGAL</p>
                <h1>Privacy Policy</h1>
                <p className="legal-updated">Last updated: July 30, 2026</p>
            </section>

            <div className="legal-body">
                <nav className="legal-toc">
                    <p className="toc-heading">On this page</p>
                    <ul>
                        {SECTIONS.map((s) => (
                            <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                        ))}
                    </ul>
                </nav>

                <div className="legal-content">
                    <p className="legal-intro">
                        {StoreDetails.name} ("we", "us", "our") respects your privacy and is
                        committed to protecting your personal data. This policy explains
                        what information we collect, how we use it, and the choices and
                        rights you have regarding your data, in accordance with the EU
                        General Data Protection Regulation (GDPR) and Moroccan data
                        protection law.
                    </p>

                    <section id="who-we-are">
                        <h2>1. Who We Are</h2>
                        <p>
                            {StoreDetails.name}  is an online and in-store {StoreDetails.tagline}  based in
                            {StoreDetails.address.city} , {StoreDetails.address.country} . For any questions about this policy or your data,
                            you can reach our Data Protection contact at{' '}
                            <a href="mailto:privacy@ecobio-para.ma">privacy@ecobio-para.ma</a>.
                        </p>
                    </section>
                    <section id="data-we-collect">
                        <h2>2. Data We Collect</h2>
                        <p>Depending on how you interact with us, we may collect:</p>
                        <ul>
                            <li><strong>Identity &amp; contact data</strong> — name, email, phone number, delivery and billing address.</li>
                            <li><strong>Order data</strong> — products purchased, order history, payment confirmation (we do not store full card numbers).</li>
                            <li><strong>Account data</strong> — login credentials and preferences, if you create an account.</li>
                            <li><strong>Communication data</strong> — messages you send via our contact form, email, or phone.</li>
                            <li><strong>Technical data</strong> — IP address, browser type, device information, and cookies (see Section 6).</li>
                            <li><strong>Health-related data you choose to share</strong> — for example, if you ask a para-pharmacist a question about a medical condition. This data is treated as a special category under GDPR and handled with additional care and only with your explicit consent.</li>
                        </ul>
                    </section>

                    <section id="how-we-use-data">
                        <h2>3. How We Use Your Data</h2>
                        <ul>
                            <li>To process and deliver your orders</li>
                            <li>To provide para-pharmacist advice or respond to your enquiries</li>
                            <li>To manage your account and order history</li>
                            <li>To send order confirmations, delivery updates, and service messages</li>
                            <li>To send marketing communications, only where you have opted in</li>
                            <li>To improve our website, products, and services</li>
                            <li>To comply with legal and regulatory obligations (e.g. para-pharmaceutical record-keeping)</li>
                        </ul>
                    </section>

                    <section id="legal-basis">
                        <h2>4. Legal Basis for Processing</h2>
                        <p>We process your data under one or more of the following legal bases:</p>
                        <ul>
                            <li><strong>Contract</strong> — to fulfil an order or provide a service you requested</li>
                            <li><strong>Consent</strong> — for marketing emails and for any health-related data you voluntarily share</li>
                            <li><strong>Legal obligation</strong> — for tax, consumer protection, and para-pharmaceutical regulations</li>
                            <li><strong>Legitimate interest</strong> — to keep our website secure and improve our services</li>
                        </ul>
                    </section>

                    <section id="sharing">
                        <h2>5. Sharing Your Data</h2>
                        <p>We do not sell your personal data. We may share it with:</p>
                        <ul>
                            <li>Delivery and courier partners, to fulfil your order</li>
                            <li>Payment processors, to securely handle transactions</li>
                            <li>IT and hosting providers, under data processing agreements</li>
                            <li>Regulatory or public authorities, where required by law</li>
                        </ul>
                    </section>

                    <section id="cookies">
                        <h2>6. Cookies</h2>
                        <p>
                            We use essential cookies to operate our website (e.g. keeping
                            items in your cart) and, with your consent, analytics and
                            marketing cookies to understand site usage and improve your
                            experience. You can manage your cookie preferences at any time
                            through our cookie banner or your browser settings.
                        </p>
                    </section>

                    <section id="retention">
                        <h2>7. Data Retention</h2>
                        <p>
                            We retain your data only as long as necessary for the purposes
                            described in this policy: order and invoicing data for the
                            period required by Moroccan tax law, account data for as long as
                            your account is active, and marketing data until you withdraw
                            consent.
                        </p>
                    </section>

                    <section id="your-rights">
                        <h2>8. Your Rights (GDPR)</h2>
                        <p>Under the GDPR, you have the right to:</p>
                        <ul>
                            <li>Access the personal data we hold about you</li>
                            <li>Correct inaccurate or incomplete data</li>
                            <li>Request deletion of your data ("right to be forgotten")</li>
                            <li>Restrict or object to certain processing</li>
                            <li>Request data portability</li>
                            <li>Withdraw consent at any time, where processing is based on consent</li>
                            <li>Lodge a complaint with the Moroccan Data Protection Authority (Garante per la protezione dei dati personali)</li>
                        </ul>
                        <p>
                            To exercise any of these rights, contact us at{' '}
                            <a href="mailto:privacy@ecobio-para.ma">{StoreDetails.contact.email} </a>.
                        </p>
                    </section>

                    <section id="security">
                        <h2>9. Data Security</h2>
                        <p>
                            We use appropriate technical and organizational measures,
                            including encryption and access controls, to protect your data
                            against unauthorized access, loss, or misuse.
                        </p>
                    </section>

                    <section id="children">
                        <h2>10. Children's Privacy</h2>
                        <p>
                            Our services are not directed at children under 16. We do not
                            knowingly collect personal data from children without parental
                            consent.
                        </p>
                    </section>

                    <section id="changes">
                        <h2>11. Changes to This Policy</h2>
                        <p>
                            We may update this policy from time to time. Material changes
                            will be posted on this page with an updated "last updated"
                            date.
                        </p>
                    </section>

                    <section id="contact">
                        <h2>12. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or how we
                            handle your data, contact us at{' '}
                            <a href="mailto:privacy@ecobio-para.ma">{StoreDetails.contact.email} </a>{' '}
                            or {StoreDetails.contact.phone}.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
