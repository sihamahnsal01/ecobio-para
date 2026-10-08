import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import '../styles/Products.css'

const ICONS = {
  order: 'fa-receipt',
  low_stock: 'fa-triangle-exclamation',
  contact: 'fa-envelope',
}

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/notifications')
      .then((data) => setNotifications(data.notifications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openNotification = async (n) => {
    if (!n.read) {
      await api.put(`/notifications/${n._id}/read`)
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
    }
    if (n.link) navigate(n.link)
  }

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = async (notification) => {
    if (!window.confirm('Delete this notification?')) return
    try {
      await api.del(`/notifications/${notification._id}`)
      setNotifications((previous) => previous.filter((item) => item._id !== notification._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="products-admin">
      <div className="products-toolbar-row">
        <h3 style={{ margin: 0 }}>Notifications</h3>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card products-table-card">
        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="muted-text" style={{ padding: '20px' }}>
            No notifications yet. You'll see alerts here for new orders, low stock, and new contact messages.
          </p>
        ) : (
          <div className="notification-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notification-row${n.read ? '' : ' unread'}`}
                onClick={() => openNotification(n)}
                role="button"
                tabIndex={0}
              >
                <div className="notification-icon">
                  <i className={`fa-solid ${ICONS[n.type] || 'fa-bell'}`}></i>
                </div>
                <div className="notification-body">
                  <p className="notification-message">{n.message}</p>
                  <p className="muted-text">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="notification-dot"></span>}
                <button type="button" className="btn btn-danger btn-sm notification-delete delete-x" onClick={(event) => { event.stopPropagation(); deleteNotification(n) }} aria-label="Delete notification">
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications