const COLORS = {
  Processing: 'var(--status-blue-text)',
  Shipped: 'var(--status-green-text)',
  Unfulfilled: 'var(--status-gray-text)',
  Returned: 'var(--status-red-text)'
}

function OrderFunnel({ funnel }) {
  const entries = Object.entries(funnel || {})
  const max = Math.max(1, ...entries.map(([, v]) => v))

  return (
    <div className="order-funnel">
      {entries.map(([label, value]) => (
        <div className="funnel-row" key={label}>
          <span className="funnel-label">{label}</span>
          <div className="funnel-bar-track">
            <div
              className="funnel-bar-fill"
              style={{ width: `${(value / max) * 100}%`, background: COLORS[label] || 'var(--brand-green)' }}
            />
          </div>
          <span className="funnel-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default OrderFunnel
