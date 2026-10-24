import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/client.js'
import { useAuth } from '../../api/AuthContext.jsx'

const MAX_ADDRESSES = 5
const emptyAddress = () => ({ label: 'Home', street: '', city: '', postalCode: '', country: 'Morocco' })

// Small "Saved ✓" / error line under each form
function FormStatus({ status }) {
    if (!status) return null
    return <p className={`acc-alert ${status.ok ? 'success' : 'danger'}`} role="status">{status.message}</p>
}

function DetailsForm() {
    const { user, updateUser } = useAuth()
    const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState(null)

    const update = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        setStatus(null)
    }

    const submit = async (event) => {
        event.preventDefault()
        setBusy(true)
        setStatus(null)
        try {
            const profile = await api.put('/auth/me', form)
            updateUser(profile)
            setStatus({ ok: true, message: 'Your details were saved.' })
        } catch (err) {
            setStatus({ ok: false, message: err.message })
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="acc-card acc-form" onSubmit={submit}>
            <h2><i className="fa-regular fa-id-card"></i> Personal details</h2>
            <div className="acc-form-grid">
                <label className="acc-field">
                    <span>Full name</span>
                    <input name="name" autoComplete="name" value={form.name} onChange={update} required />
                </label>
                <label className="acc-field">
                    <span>Phone</span>
                    <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} />
                </label>
                <label className="acc-field wide">
                    <span>Email address</span>
                    <input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required />
                </label>
            </div>
            <FormStatus status={status} />
            <div className="acc-row-actions">
                <button className="acc-btn" disabled={busy}>{busy ? 'Saving…' : 'Save details'}</button>
            </div>
        </form>
    )
}

function AddressesForm() {
    const { user, updateUser } = useAuth()
    const [addresses, setAddresses] = useState(() => (user.addresses?.length ? user.addresses : []))
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState(null)

    const change = (index, field, value) => {
        setAddresses((list) => list.map((a, i) => (i === index ? { ...a, [field]: value } : a)))
        setStatus(null)
    }
    const add = () => setAddresses((list) => [...list, emptyAddress()])
    const remove = (index) => {
        setAddresses((list) => list.filter((_, i) => i !== index))
        setStatus(null)
    }

    const submit = async (event) => {
        event.preventDefault()
        setBusy(true)
        setStatus(null)
        try {
            const profile = await api.put('/auth/me', { addresses })
            updateUser(profile)
            setAddresses(profile.addresses || [])
            setStatus({ ok: true, message: 'Your addresses were saved.' })
        } catch (err) {
            setStatus({ ok: false, message: err.message })
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="acc-card acc-form" id="addresses" onSubmit={submit}>
            <h2><i className="fa-solid fa-location-dot"></i> Delivery addresses</h2>
            {addresses.length === 0 && <p className="acc-muted">No saved address yet.</p>}
            {addresses.map((address, index) => (
                <fieldset key={address._id || index} className="acc-address">
                    <legend>
                        <input
                            className="acc-address-label"
                            value={address.label}
                            onChange={(e) => change(index, 'label', e.target.value)}
                            aria-label="Address name"
                            placeholder="Home, Work…"
                        />
                        <button type="button" className="acc-icon-btn" onClick={() => remove(index)} aria-label="Remove address">
                            <i className="fa-regular fa-trash-can"></i>
                        </button>
                    </legend>
                    <div className="acc-form-grid">
                        <label className="acc-field wide">
                            <span>Street address</span>
                            <input value={address.street || ''} autoComplete="street-address" onChange={(e) => change(index, 'street', e.target.value)} required />
                        </label>
                        <label className="acc-field">
                            <span>City</span>
                            <input value={address.city || ''} autoComplete="address-level2" onChange={(e) => change(index, 'city', e.target.value)} required />
                        </label>
                        <label className="acc-field">
                            <span>Postal code</span>
                            <input value={address.postalCode || ''} autoComplete="postal-code" onChange={(e) => change(index, 'postalCode', e.target.value)} />
                        </label>
                        <label className="acc-field">
                            <span>Country</span>
                            <input value={address.country || ''} autoComplete="country-name" onChange={(e) => change(index, 'country', e.target.value)} />
                        </label>
                    </div>
                </fieldset>
            ))}
            <FormStatus status={status} />
            <div className="acc-row-actions">
                {addresses.length < MAX_ADDRESSES && (
                    <button type="button" className="acc-btn ghost" onClick={add}><i className="fa-solid fa-plus"></i> Add an address</button>
                )}
                <button className="acc-btn" disabled={busy}>{busy ? 'Saving…' : 'Save addresses'}</button>
            </div>
        </form>
    )
}

function PasswordForm() {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState(null)

    const update = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        setStatus(null)
    }

    const submit = async (event) => {
        event.preventDefault()
        if (form.newPassword !== form.confirm) {
            setStatus({ ok: false, message: 'The two new passwords do not match.' })
            return
        }
        setBusy(true)
        setStatus(null)
        try {
            await api.put('/auth/me/password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
            setForm({ currentPassword: '', newPassword: '', confirm: '' })
            setStatus({ ok: true, message: 'Your password was changed.' })
        } catch (err) {
            setStatus({ ok: false, message: err.message })
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="acc-card acc-form" id="security" onSubmit={submit}>
            <h2><i className="fa-solid fa-lock"></i> Password</h2>
            <div className="acc-form-grid">
                <label className="acc-field wide">
                    <span>Current password</span>
                    <input name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={update} required />
                </label>
                <label className="acc-field">
                    <span>New password</span>
                    <input name="newPassword" type="password" autoComplete="new-password" minLength="6" value={form.newPassword} onChange={update} required />
                </label>
                <label className="acc-field">
                    <span>Repeat new password</span>
                    <input name="confirm" type="password" autoComplete="new-password" minLength="6" value={form.confirm} onChange={update} required />
                </label>
            </div>
            <p className="acc-hint">At least 6 characters.</p>
            <FormStatus status={status} />
            <div className="acc-row-actions">
                <button className="acc-btn" disabled={busy}>{busy ? 'Updating…' : 'Change password'}</button>
            </div>
        </form>
    )
}

function ProfileTab() {
    const { hash } = useLocation()

    // jump to #addresses / #security when linked from the overview
    useEffect(() => {
        if (!hash) return
        const target = document.querySelector(hash)
        if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }, [hash])

    return (
        <>
            <div className="acc-head">
                <div>
                    <span className="acc-eyebrow">My account</span>
                    <h1>Profile &amp; security</h1>
                    <p className="acc-muted">Keep your details up to date for faster checkout and delivery.</p>
                </div>
            </div>
            <div className="acc-stack">
                <DetailsForm />
                <AddressesForm />
                <PasswordForm />
            </div>
        </>
    )
}

export default ProfileTab
