import Order from '../models/Order.js'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  GET /api/dashboard/summary
// @access Private/Admin
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await Order.find({}).sort({ createdAt: -1 })

    const totalOrders = orders.length
    // Cancelled orders are not revenue (same rule as Analytics and the Sales history page).
    const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

    const newCustomers = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: thirtyDaysAgo },
    })

    // Group orders by day for the last 30 days, for the sales chart.
    const salesByDay = {}
    orders
        .filter((o) => o.createdAt >= thirtyDaysAgo)
        .forEach((o) => {
            const day = o.createdAt.toISOString().slice(0, 10)
            salesByDay[day] = (salesByDay[day] || 0) + 1
        })
    const salesPerformance = Object.entries(salesByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, orders]) => ({ date, orders }))

    // Order model uses: pending/paid/shipped/delivered/cancelled.
    // Mapped here to the labels OrderFunnel/StatusPill already expect.
    const STATUS_LABELS = {
        pending: 'Unfulfilled',
        paid: 'Processing',
        shipped: 'Shipped',
        delivered: 'Shipped',
        cancelled: 'Returned',
    }
    const orderStatusFunnel = { Unfulfilled: 0, Processing: 0, Shipped: 0, Returned: 0 }
    orders.forEach((o) => {
        const label = STATUS_LABELS[o.status] || 'Unfulfilled'
        orderStatusFunnel[label]++
    })

    const recentOrders = orders.slice(0, 5).map((o) => ({
        _id: o._id,
        orderNumber: o._id.toString().slice(-6).toUpperCase(),
        customer: { name: o.shippingAddress?.name || 'Guest' },
        createdAt: o.createdAt,
        fulfillmentStatus: STATUS_LABELS[o.status] || 'Unfulfilled',
        totalAmount: o.total,
    }))

    res.json({ totalOrders, revenue, newCustomers, salesPerformance, orderStatusFunnel, recentOrders })
})