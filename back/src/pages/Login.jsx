import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import '../styles/Login.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ecobio-para.ma')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card card" onSubmit={handleSubmit}>
        <div className="login-logo">Eco&Bio - para</div>
        <p className="login-sub">Sign in to the admin dashboard</p>

        {error && <p className="login-error">{error}</p>}

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
          />
        </div>

        <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="login-hint">Seeded admin: admin@ecobio-para.ma / admin123</p>
      </form>
    </div>
  )
}

export default Login
