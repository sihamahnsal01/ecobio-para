function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="muted-text">No sales data for this period yet.</p>
  }

  const width = 640
  const height = 220
  const padding = 30

  const values = data.map((d) => d.orders)
  const maxVal = Math.max(1, ...values)

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2)
    const y = height - padding - (d.orders / maxVal) * (height - padding * 2)
    return [x, y]
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1][0]},${height - padding} L${points[0][0]},${
    height - padding
  } Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sales-chart-svg">
      <defs>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-green)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand-green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#salesFill)" stroke="none" />
      <path d={linePath} fill="none" stroke="var(--brand-green)" strokeWidth="2.5" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--brand-green)" />
      ))}
    </svg>
  )
}

export default SalesChart
