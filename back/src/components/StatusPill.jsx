const COLOR_MAP = {
  Active: 'green',
  Paid: 'green',
  Shipped: 'green',
  Draft: 'gray',
  Unfulfilled: 'gray',
  Invited: 'gray',
  invited: 'gray',
  active: 'green',
  'Out of Stock': 'red',
  Failed: 'red',
  Pending: 'yellow',
  Processing: 'blue',
  Returned: 'red',
  Refunded: 'yellow',
  Delivered: 'green',
  Cancelled: 'red'
}

function StatusPill({ value }) {
  const color = COLOR_MAP[value] || 'gray'
  return <span className={`pill pill-${color}`}>{value}</span>
}

export default StatusPill