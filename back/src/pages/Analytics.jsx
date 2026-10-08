import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import api from '../api/client.js'
import SalesChart from '../components/SalesChart.jsx'
import '../styles/Dashboard.css'

const SUB_TABS = [
  { to: '/analytics/sales', label: 'Sales' },
  { to: '/analytics/customers', label: 'Customers' },
  { to: '/analytics/products', label: 'Products' },
  { to: '/analytics/categories', label: 'Categories' },
]

const monthLabel = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

function Analytics() {
  return (
    <div className="analytics-page">
      <div className="tabs-row" style={{ marginBottom: 16 }}>
        {SUB_TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}

function useAnalytics(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(path)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [path])

  return { data, loading, error }
}

export function AnalyticsSales() {
  const { data, loading, error } = useAnalytics('/analytics/sales')

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>Sales — {monthLabel}</h3>
      </div>
      <div className="analytics-stat-row">
        <div>
          <p className="muted-text">Orders</p>
          <p className="analytics-stat-value">{data.totalOrders}</p>
        </div>
        <div>
          <p className="muted-text">Revenue</p>
          <p className="analytics-stat-value">{data.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div>
          <p className="muted-text">Avg. Order Value</p>
          <p className="analytics-stat-value">{data.avgOrderValue.toFixed(2)} DH</p>
        </div>
      </div>
      <SalesChart data={data.daily} />
      {data.daily.length === 0 && <p className="muted-text">No orders yet this month.</p>}
    </div>
  )
}

export function AnalyticsCustomers() {
  const { data, loading, error } = useAnalytics('/analytics/customers')

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>Customers — {monthLabel}</h3>
      </div>
      <div className="analytics-stat-row">
        <div>
          <p className="muted-text">New Customers</p>
          <p className="analytics-stat-value">{data.newCustomers}</p>
        </div>
        <div>
          <p className="muted-text">Active Customers</p>
          <p className="analytics-stat-value">{data.activeCustomers}</p>
        </div>
        <div>
          <p className="muted-text">Returning</p>
          <p className="analytics-stat-value">{data.returningCustomers}</p>
        </div>
      </div>

      <p className="section-heading">Top Customers by Spend</p>
      {data.topCustomers.length === 0 ? (
        <p className="muted-text">No orders yet this month.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {data.topCustomers.map((c) => (
              <tr key={c.email}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.totalSpent.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function AnalyticsProducts() {
  const { data, loading, error } = useAnalytics('/analytics/products')

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>Best-Selling Products — {monthLabel}</h3>
      </div>
      {data.topProducts.length === 0 ? (
        <p className="muted-text">No orders yet this month.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.productId}>
                <td>
                  <div className="product-thumb">
                    {p.image ? <img src={p.image} alt="" /> : <i className="fa-solid fa-image"></i>}
                  </div>
                </td>
                <td>{p.name}</td>
                <td>{p.qtySold}</td>
                <td>{p.revenue.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function AnalyticsCategories() {
  const { data, loading, error } = useAnalytics('/analytics/categories')

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>Revenue by Category — {monthLabel}</h3>
      </div>
      {data.categories.length === 0 ? (
        <p className="muted-text">No orders yet this month.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.category}>
                <td>{c.category}</td>
                <td>{c.qtySold}</td>
                <td>{c.revenue.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Analytics