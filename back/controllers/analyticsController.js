import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'

function startOfMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

// @route  GET /api/analytics/sales
// @access Private/Admin
// Real daily order count + revenue for the current calendar month so far.
export const getSalesAnalytics = asyncHandler(async (req, res) => {
    const from = startOfMonth()
    const orders = await Order.find({ createdAt: { $gte: from }, status: { $ne: 'cancelled' } }).sort({
        createdAt: 1,
    })

    const byDay = {}
    let totalRevenue = 0
    orders.forEach((o) => {
        const day = o.createdAt.toISOString().slice(0, 10)
        if (!byDay[day]) byDay[day] = { date: day, orders: 0, revenue: 0 }
        byDay[day].orders += 1
        byDay[day].revenue += o.total
        totalRevenue += o.total
    })

    res.json({
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
        daily: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    })
})

// @route  GET /api/analytics/customers
// @access Private/Admin
// New customers this month, how many of this month's buyers DH ordered
// before (returning), and the top 5 by spend this month.
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
    const from = startOfMonth()

    const newCustomers = await User.countDocuments({ role: 'customer', createdAt: { $gte: from } })
    const ordersThisMonth = await Order.find({ createdAt: { $gte: from }, status: { $ne: 'cancelled' } })
    const customerIdsThisMonth = [
        ...new Set(ordersThisMonth.filter((o) => o.user).map((o) => o.user.toString())),
    ]

    let returningCustomers = 0
    for (const id of customerIdsThisMonth) {
        const earlierOrder = await Order.findOne({ user: id, createdAt: { $lt: from } })
        if (earlierOrder) returningCustomers++
    }

    const spendMap = {}
    ordersThisMonth.forEach((o) => {
        if (!o.user) return
        const id = o.user.toString()
        spendMap[id] = (spendMap[id] || 0) + o.total
    })
    const topIds = Object.entries(spendMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id)
    const topUsers = await User.find({ _id: { $in: topIds } })
    const topCustomers = topIds.map((id) => {
        const u = topUsers.find((x) => x._id.toString() === id)
        return { name: u?.name || 'Unknown', email: u?.email || '', totalSpent: spendMap[id] }
    })

    res.json({
        newCustomers,
        activeCustomers: customerIdsThisMonth.length,
        returningCustomers,
        topCustomers,
    })
})

// @route  GET /api/analytics/products
// @access Private/Admin
// Best-selling products this month, by quantity sold. Uses the name/image
// snapshot already stored on each order item — no extra Product lookup needed.
export const getProductAnalytics = asyncHandler(async (req, res) => {
    const from = startOfMonth()
    const orders = await Order.find({ createdAt: { $gte: from }, status: { $ne: 'cancelled' } })

    const productMap = {}
    orders.forEach((o) => {
        o.items.forEach((item) => {
            const key = item.product.toString()
            if (!productMap[key]) {
                productMap[key] = { productId: key, name: item.name, image: item.image, qtySold: 0, revenue: 0 }
            }
            productMap[key].qtySold += item.qty
            productMap[key].revenue += item.price * item.qty
        })
    })

    const topProducts = Object.values(productMap)
        .sort((a, b) => b.qtySold - a.qtySold)
        .slice(0, 10)

    res.json({ topProducts })
})

// @route  GET /api/analytics/categories
// @access Private/Admin
// Revenue/quantity by category this month. Order items don't store category
// directly, so this joins against current Product categories.
export const getCategoryAnalytics = asyncHandler(async (req, res) => {
    const from = startOfMonth()
    const orders = await Order.find({ createdAt: { $gte: from }, status: { $ne: 'cancelled' } })

    const products = await Product.find({}, 'category')
    const categoryById = Object.fromEntries(products.map((p) => [p._id.toString(), p.category]))

    const categoryMap = {}
    orders.forEach((o) => {
        o.items.forEach((item) => {
            const category = categoryById[item.product.toString()] || 'Uncategorized'
            if (!categoryMap[category]) categoryMap[category] = { category, qtySold: 0, revenue: 0 }
            categoryMap[category].qtySold += item.qty
            categoryMap[category].revenue += item.price * item.qty
        })
    })

    const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue)

    res.json({ categories })
})