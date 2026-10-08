import { Fragment, useEffect, useState } from 'react'
import api from '../../api/client.js'
import Toggle from './Toggle.jsx'

const PERMISSION_LABELS = {
  manageProducts: 'Manage Products',
  viewReports: 'View Reports',
  processOrders: 'Process Orders',
  manageCustomers: 'Manage Customers',
  viewUsers: 'View Users',
  sendReports: 'Send Reports'
}

function TeamTab() {
  const [users, setUsers] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '', role: 'Editor' })

  const load = () => api.get('/settings/team').then(setUsers)

  useEffect(() => {
    load()
  }, [])

  if (!users) return <p className="muted-text">Loading…</p>

  const updatePermission = async (user, key, value) => {
    await api.put(`/settings/team/${user._id}`, { permissions: { [key]: value } })
    load()
  }

  const updateRole = async (user, role) => {
    await api.put(`/settings/team/${user._id}`, { role })
    load()
  }

  const removeUser = async (user) => {
    if (!confirm(`Remove ${user.name}?`)) return
    await api.del(`/settings/team/${user._id}`)
    load()
  }

  const sendInvite = async () => {
    if (!invite.name || !invite.email) return
    await api.post('/settings/team', invite)
    setInvite({ name: '', email: '', role: 'Editor' })
    setInviting(false)
    load()
  }

  return (
    <div className="card settings-section">
      <div className="settings-header-row">
        <div>
          <h3>Team Permissions</h3>
          <p className="settings-section-sub">Manage roles and access for your team.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setInviting((v) => !v)}>
          <i className="fa-solid fa-user-plus"></i> Invite New Member
        </button>
      </div>

      {inviting && (
        <div className="invite-form">
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={sendInvite}>
            Send Invite
          </button>
        </div>
      )}

      <table className="team-table">
        <thead>
          <tr>
            <th>User name</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Fragment key={u._id}>
              <tr className="team-row" onClick={() => setExpandedId(expandedId === u._id ? null : u._id)}>
                <td>
                  <div className="team-user-cell">
                    <div className="sidebar-user-avatar" style={{ background: 'var(--brand-green-light)', color: 'var(--brand-green-dark)' }}>
                      {u.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select value={u.role} onChange={(e) => updateRole(u, e.target.value)}>
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                </td>
                <td>
                  <span className={`pill pill-${u.status === 'active' ? 'green' : 'gray'}`}>{u.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn" onClick={() => removeUser(u)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              {expandedId === u._id && (
                <tr>
                  <td colSpan={4}>
                    <div className="permissions-panel">
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                        <div className="permission-row" key={key}>
                          <span>{label}</span>
                          <Toggle on={!!u.permissions?.[key]} onChange={(v) => updatePermission(u, key, v)} />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TeamTab
