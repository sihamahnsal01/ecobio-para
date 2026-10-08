import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import '../assets/styles/Account.css'

function Account() {
    const { user, loading, login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (loading) return <main className="account-page"><p>Loading account...</p></main>
    if (user) return <main className="account-page"><div className="account-card"><h1>Welcome, {user.name}</h1><p>You are signed in and can track your orders.</p><Link className="account-action" to="/orders">Track my orders</Link></div></main>

    const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
    const submit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            if (mode === 'login') await login({ email: form.email, password: form.password })
            else await register(form)
            navigate(location.state?.from || '/orders')
        } catch (err) {
            setError(err.message || 'Unable to authenticate')
        } finally { setSubmitting(false) }
    }

    return (
        <main className="account-page">
            <form className="account-card" onSubmit={submit}>
                <span className="account-eyebrow">Eco&amp;Bio account</span>
                <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
                {error && <p className="account-error">{error}</p>}
                {mode === 'register' && <input name="name" placeholder="Full name" value={form.name} onChange={update} required />}
                <input name="email" type="email" placeholder="Email address" value={form.email} onChange={update} required />
                {mode === 'register' && <input name="phone" placeholder="Phone number" value={form.phone} onChange={update} />}
                <input name="password" type="password" minLength="6" placeholder="Password" value={form.password} onChange={update} required />
                <button className="account-action" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
                <button type="button" className="account-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
                    {mode === 'login' ? 'Create a new account' : 'Already have an account? Sign in'}
                </button>
            </form>
        </main>
    )
}

export default Account
