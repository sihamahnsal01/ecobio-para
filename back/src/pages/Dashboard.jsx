import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import StatusPill from '../components/StatusPill.jsx'
import SalesChart from '../components/SalesChart.jsx'
import OrderFunnel from '../components/OrderFunnel.jsx'
import '../styles/Dashboard.css'
import '../styles/SalesHistory.css'

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error-text">{error}</p>
  if (!data) return <p className="muted-text">Loading dashboard…</p>

  return (
    <div className="dashboard">
      <div className="stat-cards">
        <div className="card stat-card">
          <div className="stat-label-row">
            <p className="stat-label">Total Orders</p>
            <Link to="/orders" className="see-more-link">
              See more <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <p className="stat-value">{data.totalOrders}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Revenue</p>
          <p className="stat-value">{data.revenue.toFixed(2)} DH</p>
        </div>
        <div className="card stat-card">
          <div className="stat-label-row">
            <p className="stat-label">New Customers</p>
            <Link to="/customers" className="see-more-link">
              See more <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <p className="stat-value">{data.newCustomers}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header card-header-row">
            <h3>Sales Performance (Last 30 Days)</h3>
            <Link to="/sales-history" className="see-more-link">
              See more <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <SalesChart data={data.salesPerformance} />
        </div>

        <div className="card funnel-card">
          <div className="card-header">
            <h3>Order Status</h3>
          </div>
          <OrderFunnel funnel={data.orderStatusFunnel} />
        </div>
      </div>

      <div className="card recent-orders-card">
        <div className="card-header">
          <h3>Recent Orders</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.customer?.name}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <StatusPill value={o.fulfillmentStatus} />
                </td>
                <td>{o.totalAmount.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
