export const formatPrice = (value) => `${Number(value || 0).toFixed(2)} DH`

export const formatDate = (value, withTime = false) => {
    if (!value) return ''
    const date = new Date(value)
    return withTime
        ? date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export const orderNumber = (order) => `#${String(order._id).slice(-6).toUpperCase()}`

export const itemCount = (order) => (order.items || []).reduce((total, item) => total + Number(item.qty || 0), 0)

export const initialsOf = (name) =>
    (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')

// Status label + colour family used by the order badges.
export const ORDER_STATUS = {
    pending: { label: 'Order placed', tone: 'warn', icon: 'fa-clock' },
    paid: { label: 'Confirmed', tone: 'info', icon: 'fa-circle-check' },
    shipped: { label: 'On the way', tone: 'info', icon: 'fa-truck-fast' },
    delivered: { label: 'Delivered', tone: 'success', icon: 'fa-house-circle-check' },
    cancelled: { label: 'Cancelled', tone: 'danger', icon: 'fa-ban' },
}

export const isActiveOrder = (order) => !['delivered', 'cancelled'].includes(order.status)

// Customers may cancel an order themselves only before it is paid or shipped.
export const canCancel = (order) => order.status === 'pending' && order.paymentStatus !== 'paid'

const STEP_INDEX = { pending: 0, paid: 1, shipped: 2, delivered: 3 }

// The four tracking steps shown under every order.
export function trackingSteps(order) {
    const online = order.paymentMethod === 'online'
    const reached = STEP_INDEX[order.status] ?? 0
    const steps = [
        { key: 'placed', label: 'Order placed', icon: 'fa-receipt', date: order.createdAt },
        { key: 'confirmed', label: online ? 'Payment received' : 'Confirmed', icon: 'fa-clipboard-check', date: order.paidAt },
        { key: 'shipped', label: 'Shipped', icon: 'fa-truck-fast' },
        { key: 'delivered', label: 'Delivered', icon: 'fa-house-circle-check', date: order.deliveredAt },
    ]
    return steps.map((step, index) => ({
        ...step,
        done: index <= reached,
        current: index === reached,
    }))
}

export const REVIEW_STATUS = {
    pending: { label: 'Awaiting approval', tone: 'warn' },
    approved: { label: 'Published', tone: 'success' },
    hidden: { label: 'Not published', tone: 'muted' },
}
