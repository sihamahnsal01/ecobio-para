import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import api from '../api/client.js'
import SalesChart from '../components/SalesChart.jsx'
import '../styles/Dashboard.css'
import '../styles/Reviews.css'

const SUB_TABS = [
  { to: '/analytics/sales', label: 'Sales' },
  { to: '/analytics/customers', label: 'Customers' },
  { to: '/analytics/products', label: 'Products' },
  { to: '/analytics/categories', label: 'Categories' },
  { to: '/analytics/visitors', label: 'Visitors' },
  { to: '/analytics/engagement', label: 'Wishlist & Reviews' },
]

const ASSET_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
const assetUrl = (image) => {
  if (!image) return ''
  if (/^(https?:|data:)/.test(image)) return image
  return `${ASSET_BASE}${image.startsWith('/') ? '' : '/'}${image}`
}

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

export function AnalyticsVisitors() {
  const [days, setDays] = useState(30)
  const { data, loading, error } = useAnalytics(`/stats/visitors?days=${days}`)

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.visits))
  const top = data.countries[0]

  return (
    <div className="card chart-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Visitors by country</h3>
        <select className="range-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 12 months</option>
        </select>
      </div>
      <div className="analytics-stat-row">
        <div>
          <p className="muted-text">Visits (sessions)</p>
          <p className="analytics-stat-value">{data.totalVisits}</p>
        </div>
        <div>
          <p className="muted-text">Countries</p>
          <p className="analytics-stat-value">{data.countries.length}</p>
        </div>
        <div>
          <p className="muted-text">Top country</p>
          <p className="analytics-stat-value">{top ? top.name : '—'}</p>
        </div>
      </div>

      {data.daily.length > 0 && (
        <div className="visits-bars" title="Visits per day">
          {data.daily.slice(-60).map((d) => (
            <div key={d.date} style={{ height: `${Math.max(6, (d.visits / maxDaily) * 100)}%` }} title={`${d.date}: ${d.visits}`} />
          ))}
        </div>
      )}

      {data.countries.length === 0 ? (
        <p className="muted-text">No visits recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Country</th>
              <th>Visits</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.countries.map((c) => (
              <tr key={c.country}>
                <td><span className="country-code">{c.country}</span></td>
                <td>{c.name}</td>
                <td>{c.visits}</td>
                <td>
                  <div className="share-bar"><span style={{ width: `${c.share}%` }} /></div>
                  <span className="muted-text">{c.share}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted-text" style={{ padding: '8px 20px 0' }}>
        One anonymous ping per browser session. “ZZ” means the country could not be detected.
      </p>
    </div>
  )
}

export function AnalyticsEngagement() {
  const { data, loading, error } = useAnalytics('/stats/engagement')

  if (loading) return <p className="muted-text">Loading…</p>
  if (error) return <p className="error-text">{error}</p>

  const { wishlist, reviews } = data

  return (
    <div className="analytics-two-col">
      <div className="card chart-card">
        <div className="card-header">
          <h3>Wishlists</h3>
        </div>
        <div className="analytics-stat-row">
          <div>
            <p className="muted-text">Saved products</p>
            <p className="analytics-stat-value">{wishlist.totalItems}</p>
          </div>
          <div>
            <p className="muted-text">Customers</p>
            <p className="analytics-stat-value">{wishlist.customers}</p>
          </div>
        </div>
        <p className="section-heading">Most wishlisted products</p>
        {wishlist.topProducts.length === 0 ? (
          <p className="muted-text">Nothing has been wishlisted yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Saved by</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.topProducts.map((p) => (
                <tr key={p.productId}>
                  <td>
                    <div className="product-thumb">
                      {p.image ? <img src={assetUrl(p.image)} alt="" /> : <i className="fa-solid fa-image"></i>}
                    </div>
                  </td>
                  <td>{p.name}{p.brand ? <span className="muted-text"> · {p.brand}</span> : null}</td>
                  <td>{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card chart-card">
        <div className="card-header">
          <h3>Community reviews</h3>
        </div>
        <div className="analytics-stat-row">
          <div>
            <p className="muted-text">Reviews</p>
            <p className="analytics-stat-value">{reviews.total}</p>
          </div>
          <div>
            <p className="muted-text">Pending</p>
            <p className="analytics-stat-value">{reviews.pending}</p>
          </div>
          <div>
            <p className="muted-text">Avg. rating</p>
            <p className="analytics-stat-value">{reviews.averageRating ?? '—'}</p>
          </div>
        </div>
        <div className="analytics-stat-row">
          <div>
            <p className="muted-text">Helpful votes</p>
            <p className="analytics-stat-value">{reviews.likes}</p>
          </div>
          <div>
            <p className="muted-text">Replies</p>
            <p className="analytics-stat-value">{reviews.replies}</p>
          </div>
          <div>
            <p className="muted-text">Team replies</p>
            <p className="analytics-stat-value">{reviews.staffReplies}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics