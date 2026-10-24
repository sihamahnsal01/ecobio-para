import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../api/AuthContext.jsx'

// Sign-in / create-account card shown at /account to visitors.
function AuthForm() {
    const { login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login')
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))

    const submit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            if (mode === 'login') await login({ email: form.email, password: form.password })
            else await register(form)
            // go back where the visitor came from, or to the account dashboard
            const from = location.state?.from
            navigate(from && from !== '/account' ? from : location.pathname, { replace: true })
        } catch (err) {
            setError(err.message || 'Unable to authenticate')
        } finally {
            setSubmitting(false)
        }
    }

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        setError('')
    }

    return (
        <main className="account-page account-page--auth">
            <div className="auth-shell">
                <aside className="auth-aside">
                    <span className="acc-eyebrow">Eco&amp;Bio account</span>
                    <h2>Everything in one place</h2>
                    <ul>
                        <li><i className="fa-solid fa-truck-fast"></i> Track every order, step by step</li>
                        <li><i className="fa-regular fa-heart"></i> Keep a wishlist on every device</li>
                        <li><i className="fa-regular fa-comment"></i> Manage your reviews and replies</li>
                        <li><i className="fa-regular fa-user"></i> Save your details for faster checkout</li>
                    </ul>
                </aside>

                <form className="auth-card" onSubmit={submit} noValidate={false}>
                    <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
                    <p className="acc-muted">
                        {mode === 'login' ? 'Welcome back! Sign in to see your orders.' : 'It only takes a minute.'}
                    </p>
                    {location.state?.notice && !error && <p className="acc-alert info">{location.state.notice}</p>}
                    {error && <p className="acc-alert danger" role="alert">{error}</p>}

                    {mode === 'register' && (
                        <label className="acc-field">
                            <span>Full name</span>
                            <input name="name" autoComplete="name" value={form.name} onChange={update} required />
                        </label>
                    )}
                    <label className="acc-field">
                        <span>Email address</span>
                        <input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required />
                    </label>
                    {mode === 'register' && (
                        <label className="acc-field">
                            <span>Phone <em>(optional)</em></span>
                            <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} />
                        </label>
                    )}
                    <label className="acc-field">
                        <span>Password</span>
                        <div className="acc-password">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                minLength="6"
                                value={form.password}
                                onChange={update}
                                required
                            />
                            <button
                                type="button"
                                className="acc-icon-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </label>

                    <button className="acc-btn" disabled={submitting}>
                        {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                    <button type="button" className="acc-link-btn" onClick={switchMode}>
                        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
                    </button>
                </form>
            </div>
        </main>
    )
}

export default AuthForm
