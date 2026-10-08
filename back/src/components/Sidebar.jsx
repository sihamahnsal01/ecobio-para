import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'fa-grip', end: true },
  {
    label: 'Products',
    icon: 'fa-tags',
    match: '/products',
    children: [
      { to: '/products', label: 'All Products' },
      { to: '/products/new', label: 'Add Product' },
      { to: '/products/categories', label: 'Categories' },
      { to: '/products/inventory', label: 'Inventory' },
    ],
  },
  { to: '/orders', label: 'Orders', icon: 'fa-receipt' },
  { to: '/customers', label: 'Customers', icon: 'fa-users' },
  { to: '/reviews', label: 'Reviews', icon: 'fa-star' },
  { to: '/promotions', label: 'Promotions', icon: 'fa-tag' },
  {
    label: 'Analytics',
    icon: 'fa-chart-line',
    match: '/analytics',
    children: [
      { to: '/analytics/sales', label: 'Sales' },
      { to: '/analytics/customers', label: 'Customers' },
      { to: '/analytics/products', label: 'Products' },
      { to: '/analytics/categories', label: 'Categories' },
    ],
  },
  { to: '/reports', label: 'Reports', icon: 'fa-file-lines' },
  { to: '/notifications', label: 'Notifications', icon: 'fa-bell' },
  { to: '/admin-users', label: 'Admin Users', icon: 'fa-user-shield' },
  {
    label: 'Settings',
    icon: 'fa-gear',
    match: '/settings',
    children: [
      { to: '/settings?tab=profile', label: 'My Profile' },
      { to: '/settings?tab=account', label: 'Account' },
      { to: '/settings?tab=security', label: 'Security' },
      { to: '/settings?tab=notifications', label: 'Notifications' },
      { to: '/settings?tab=general', label: 'Store Settings' },
    ],
  },
]

function NavGroup({ item, isOpen, onToggle, pathname }) {
  const isActive = pathname.startsWith(item.match)
  return (
    <div className="sidebar-group">
      <button
        type="button"
        className={`sidebar-link sidebar-group-toggle${isActive ? ' active-group' : ''}`}
        onClick={onToggle}
      >
        <i className={`fa-solid ${item.icon}`}></i>
        <span>{item.label}</span>
        <i className={`fa-solid fa-chevron-down sidebar-chevron${isOpen ? ' open' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="sidebar-submenu">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              className={({ isActive: linkActive }) =>
                `sidebar-sublink${linkActive ? ' active' : ''}`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navItems = NAV_ITEMS.filter(
    (item) => item.to !== '/admin-users' || user?.role === 'admin'
  )

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {}
    NAV_ITEMS.forEach((item) => {
      if (item.children && pathname.startsWith(item.match)) initial[item.label] = true
    })
    return initial
  })

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="" onError={(e) => (e.target.style.display = 'none')} />
        <span>Eco&Bio - para</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.children ? (
            <NavGroup
              key={item.label}
              item={item}
              isOpen={!!openGroups[item.label]}
              onToggle={() => toggleGroup(item.label)}
              pathname={pathname}
            />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          )
        )}

        <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.avatar ? <img src={user.avatar} alt="" /> : user.name?.[0] || 'A'}
          </div>
          <div>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
