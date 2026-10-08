import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import api from '../api/client.js'

function Topbar({ title, actions }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api
      .get('/notifications')
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {})
  }, [])

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        {actions}

        <button className="icon-btn bell-btn" title="Notifications" onClick={() => navigate('/notifications')}>
          <i className="fa-regular fa-bell"></i>
          {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>

        <div className="user-menu">
          <button className="user-menu-trigger" onClick={() => setMenuOpen((o) => !o)}>
            <div className="avatar-circle">
              {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.[0] || 'A'}
            </div>
            <span>{user?.name || 'User profile'}</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          {menuOpen && (
            <div className="user-menu-dropdown">
              <p className="user-menu-email">{user?.email}</p>
              <button onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar