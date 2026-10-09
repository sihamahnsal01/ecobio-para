import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import StatusPill from '../components/StatusPill.jsx'
import '../styles/Dashboard.css'
import '../styles/SalesHistory.css'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const PAYMENT_LABELS = { cash_on_delivery: 'Cash on delivery', online: 'Card (Stripe)' }

const money = (n) => `${Number(n || 0).toFixed(2)} DH`
const statusLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const dateTime = (value) =>
  value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const monthKey = (year, month) => `${year}-${month}`

const ASSET_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
const assetUrl = (image) => {
  if (!image) return ''
  if (/^(https?:|data:)/.test(image)) return image
  return `${ASSET_BASE}${image.startsWith('/') ? '' : '/'}${image}`
}

// Excel treats cells starting with = + - @ as formulas, so neutralise them.
const csvCell = (value) => {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function OrderDetails({ order }) {
  const { customer, address } = order
  return (
    <div className="sh-detail">
      <div className="sh-detail-col">
        <h4>Customer &amp; delivery</h4>
        <p><strong>{customer.name}</strong> {customer.hasAccount ? <span className="sh-tag">Account</span> : <span className="sh-tag sh-tag-muted">Guest</span>}</p>
        {customer.email && <p>{customer.email}</p>}
        {customer.phone && <p>{customer.phone}</p>}
        <p className="muted-text">
          {[address.street, [address.postalCode, address.city].filter(Boolean).join(' '), address.country]
            .filter(Boolean)
            .join(', ') || 'No address'}
        </p>
      </div>

      <div className="sh-detail-col sh-detail-items">
        <h4>Items ({order.itemCount})</h4>
        {order.items.map((item, i) => (
          <div className="sh-item" key={`${item.name}-${i}`}>
            <div className="sh-item-thumb">
              {item.image ? <img src={assetUrl(item.image)} alt="" /> : <i className="fa-solid fa-image"></i>}
            </div>
            <div className="sh-item-name">{item.name}</div>
            <div className="sh-item-qty muted-text">{item.qty} × {money(item.price)}</div>
            <div className="sh-item-total">{money(item.qty * item.price)}</div>
          </div>
        ))}
      </div>

      <div className="sh-detail-col">
        <h4>Payment</h4>
        <dl className="sh-dl">
          <dt>Subtotal</dt><dd>{money(order.subtotal)}</dd>
          {order.discount > 0 && (
            <>
              <dt>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt>
              <dd>− {money(order.discount)}</dd>
            </>
          )}
          <dt>Delivery</dt><dd>{money(order.deliveryFee)}</dd>
          <dt className="sh-total">Total</dt><dd className="sh-total">{money(order.total)}</dd>
          <dt>Method</dt><dd>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</dd>
          <dt>Payment status</dt><dd>{statusLabel(order.paymentStatus)}</dd>
          <dt>Placed</dt><dd>{dateTime(order.createdAt)}</dd>
          <dt>Paid</dt><dd>{dateTime(order.paidAt)}</dd>
          <dt>Delivered</dt><dd>{dateTime(order.deliveredAt)}</dd>
        </dl>
      </div>
    </div>
  )
}

export function SalesHistoryView({ data }) {
  const [year, setYear] = useState('all')
  const [openMonths, setOpenMonths] = useState(() => {
    const latestYear = data.years[0]
    const latestMonth = latestYear?.months[0]
    return new Set(latestMonth ? [monthKey(latestYear.year, latestMonth.month)] : [])
  })
  const [openOrders, setOpenOrders] = useState(() => new Set())

  const visibleYears = useMemo(
    () => (year === 'all' ? data.years : data.years.filter((y) => String(y.year) === year)),
    [data.years, year]
  )

  // oldest -> newest, for the revenue-by-month bars
  const series = useMemo(() => {
    const list = []
    visibleYears.forEach((y) =>
      y.months.forEach((m) => list.push({ key: monthKey(y.year, m.month), label: `${MONTHS[m.month].slice(0, 3)} ${String(y.year).slice(2)}`, revenue: m.revenue }))
    )
    return list.reverse()
  }, [visibleYears])
  const maxMonthRevenue = Math.max(1, ...series.map((s) => s.revenue))

  const toggle = (setter, key) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const expandAll = () =>
    setOpenMonths(new Set(visibleYears.flatMap((y) => y.months.map((m) => monthKey(y.year, m.month)))))
  const collapseAll = () => setOpenMonths(new Set())

  const exportCsv = () => {
    const rows = [[
      'Order ID', 'Date', 'Status', 'Payment method', 'Payment status', 'Customer', 'Email', 'Phone',
      'Street', 'City', 'Postal code', 'Country', 'Items', 'Subtotal', 'Discount', 'Promo code',
      'Delivery fee', 'Total', 'Paid at', 'Delivered at',
    ]]
    visibleYears.forEach((y) =>
      y.months.forEach((m) =>
        m.orderList.forEach((o) =>
          rows.push([
            o.orderNumber, dateTime(o.createdAt), o.status, PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod, o.paymentStatus,
            o.customer.name, o.customer.email, o.customer.phone,
            o.address.street, o.address.city, o.address.postalCode, o.address.country,
            o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
            o.subtotal, o.discount, o.promoCode, o.deliveryFee, o.total,
            o.paidAt ? dateTime(o.paidAt) : '', o.deliveredAt ? dateTime(o.deliveredAt) : '',
          ])
        )
      )
    )
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-history-${year}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const { totals } = data

  return (
    <div className="sales-history">
      <div className="sh-topbar">
        <Link to="/" className="see-more-link"><i className="fa-solid fa-arrow-left"></i> Back to dashboard</Link>
        <span className="muted-text">
          {data.since ? `Since ${new Date(data.since).toLocaleDateString([], { dateStyle: 'long' })}` : 'No orders yet'}
        </span>
      </div>

      <div className="sh-summary">
        <div className="card stat-card"><p className="stat-label">Revenue</p><p className="stat-value">{money(totals.revenue)}</p></div>
        <div className="card stat-card"><p className="stat-label">Orders</p><p className="stat-value">{totals.orders}</p></div>
        <div className="card stat-card"><p className="stat-label">Items sold</p><p className="stat-value">{totals.itemsSold}</p></div>
        <div className="card stat-card"><p className="stat-label">Average order</p><p className="stat-value">{money(totals.averageOrderValue)}</p></div>
        <div className="card stat-card"><p className="stat-label">Cancelled</p><p className="stat-value">{totals.cancelledCount}</p></div>
      </div>
      <p className="muted-text sh-note">Revenue and averages exclude cancelled orders. Months follow the server’s time zone.</p>

      {data.years.length === 0 ? (
        <div className="card" style={{ padding: 24 }}><p className="muted-text">No sales yet.</p></div>
      ) : (
        <>
          <div className="sh-toolbar">
            <div className="sh-chips">
              {['all', ...data.years.map((y) => String(y.year))].map((value) => (
                <button key={value} type="button" className={`sh-chip${year === value ? ' on' : ''}`} onClick={() => setYear(value)}>
                  {value === 'all' ? 'All years' : value}
                </button>
              ))}
            </div>
            <div className="sh-toolbar-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={expandAll}>Expand all</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={collapseAll}>Collapse all</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={exportCsv}>
                <i className="fa-solid fa-file-csv"></i> Export CSV
              </button>
            </div>
          </div>

          <div className="card sh-bars-card">
            <div className="card-header"><h3>Revenue by month</h3></div>
            <div className="sh-bars">
              {series.map((s) => (
                <div className="sh-bar-col" key={s.key} title={`${s.label}: ${money(s.revenue)}`}>
                  <div className="sh-bar" style={{ height: `${Math.max(4, (s.revenue / maxMonthRevenue) * 100)}%` }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {visibleYears.map((y) => (
            <section className="sh-year" key={y.year}>
              <header className="sh-year-head">
                <h2>{y.year}</h2>
                <span className="muted-text">
                  {y.orders} orders · {money(y.revenue)}{y.cancelledCount > 0 ? ` · ${y.cancelledCount} cancelled` : ''}
                </span>
              </header>

              {y.months.map((m) => {
                const key = monthKey(y.year, m.month)
                const open = openMonths.has(key)
                return (
                  <div className="card sh-month" key={key}>
                    <button type="button" className="sh-month-head" onClick={() => toggle(setOpenMonths, key)} aria-expanded={open}>
                      <i className={`fa-solid fa-chevron-${open ? 'down' : 'right'} sh-chevron`}></i>
                      <span className="sh-month-name">{MONTHS[m.month]} {y.year}</span>
                      <span className="sh-month-stat"><strong>{m.salesCount}</strong> sales</span>
                      <span className="sh-month-stat"><strong>{m.itemsSold}</strong> items</span>
                      {m.cancelledCount > 0 && <span className="sh-month-stat sh-cancelled">{m.cancelledCount} cancelled</span>}
                      <span className="sh-month-revenue">{money(m.revenue)}</span>
                      <span className="sh-share"><span style={{ width: `${(m.revenue / maxMonthRevenue) * 100}%` }} /></span>
                    </button>

                    {open && (
                      <div className="sh-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Order</th><th>Date</th><th>Customer</th><th>Items</th>
                              <th>Total</th><th>Payment</th><th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.orderList.map((o) => {
                              const isOpen = openOrders.has(o._id)
                              return (
                                <FragmentRow key={o._id} order={o} isOpen={isOpen} onToggle={() => toggle(setOpenOrders, o._id)} />
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          ))}
        </>
      )}
    </div>
  )
}

function FragmentRow({ order: o, isOpen, onToggle }) {
  return (
    <>
      <tr
        className={`sh-order-row${isOpen ? ' open' : ''}${o.status === 'cancelled' ? ' cancelled' : ''}`}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <td><i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'} sh-chevron`}></i> #{o.orderNumber}</td>
        <td>{dateTime(o.createdAt)}</td>
        <td>{o.customer.name}<span className="sh-sub muted-text">{o.address.city}</span></td>
        <td>{o.itemCount}</td>
        <td>{money(o.total)}</td>
        <td>{PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}<span className="sh-sub muted-text">{statusLabel(o.paymentStatus)}</span></td>
        <td><StatusPill value={statusLabel(o.status)} /></td>
      </tr>
      {isOpen && (
        <tr className="sh-detail-row">
          <td colSpan={7}><OrderDetails order={o} /></td>
        </tr>
      )}
    </>
  )
}

function SalesHistory() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/analytics/sales-history')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error-text">{error}</p>
  if (!data) return <p className="muted-text">Loading sales history…</p>
  return <SalesHistoryView data={data} />
}

export default SalesHistory
