import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import '../styles/Products.css'

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState('')

  const [promoteEmail, setPromoteEmail] = useState('')
  const [promoting, setPromoting] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/admin-users')
      .then(setAdmins)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setCreateMessage('')
    try {
      const created = await api.post('/admin-users', newAdmin)
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' })
      if (created.role === 'customer') {
        setCreateMessage(
          `Created ${created.name} as a customer account — they won't show in the staff list below.`
        )
      }
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handlePromote = async (e) => {
    e.preventDefault()
    setPromoting(true)
    setError('')
    try {
      await api.put('/admin-users/promote', { email: promoteEmail })
      setPromoteEmail('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setPromoting(false)
    }
  }

  const handleRevoke = async (admin) => {
    if (!confirm(`Revoke admin access for ${admin.name}? They'll become a regular customer account.`)) return
    setBusyId(admin._id)
    setError('')
    try {
      await api.put(`/admin-users/${admin._id}/revoke`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="products-admin">
      {error && <p className="error-text" style={{ margin: '0 0 4px' }}>{error}</p>}

      <div className="admin-users-forms">
        <form className="card filters-card" onSubmit={handleCreate}>
          <p className="section-heading" style={{ marginTop: 0, paddingTop: 0, border: 'none' }}>
            Create a new staff account
          </p>
          <div className="filters-row">
            <div className="field">
              <label>Name</label>
              <input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                minLength={6}
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="manager">Manager / Gestionnaire</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create Account'}
          </button>
          {createMessage && <p className="muted-text">{createMessage}</p>}
        </form>

        <form className="card filters-card" onSubmit={handlePromote}>
          <p className="section-heading" style={{ marginTop: 0, paddingTop: 0, border: 'none' }}>
            Grant admin access to an existing customer
          </p>
          <div className="filters-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Customer's email</label>
              <input
                type="email"
                placeholder="Must already have an account on the storefront"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={promoting}>
            {promoting ? 'Promoting…' : 'Promote to Admin'}
          </button>
        </form>
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Admin & Management Users</h3>
          <span className="muted-text">{admins.length} total</span>
        </div>

        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a._id === currentUser?._id
                return (
                  <tr key={a._id}>
                    <td>
                      {a.name} {isSelf && <span className="muted-text">(you)</span>}
                    </td>
                    <td>{a.email}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        backgroundColor: a.role === 'admin' ? '#e6f4ea' : '#e8f0fe',
                        color: a.role === 'admin' ? '#137333' : '#1a73e8'
                      }}>
                        {a.role}
                      </span>
                    </td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={isSelf || admins.length <= 1 || busyId === a._id}
                        title={isSelf ? "You can't revoke your own access" : admins.length <= 1 ? "Can't remove the last admin" : ''}
                        onClick={() => handleRevoke(a)}
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminUsers