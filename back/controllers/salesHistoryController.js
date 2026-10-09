import Order from '../models/Order.js'
import asyncHandler from '../utils/asyncHandler.js'

const round2 = (n) => Math.round(n * 100) / 100

// One order, with everything the admin may want to see.
const shapeOrder = (order) => {
    const address = order.shippingAddress || {}
    const items = (order.items || []).map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image || '',
    }))

    return {
        _id: order._id,
        orderNumber: String(order._id).slice(-6).toUpperCase(),
        createdAt: order.createdAt,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt || null,
        deliveredAt: order.deliveredAt || null,
        customer: {
            name: address.name || order.user?.name || 'Guest',
            email: address.email || order.user?.email || '',
            phone: address.phone || '',
            hasAccount: Boolean(order.user),
        },
        address: {
            street: address.street || '',
            city: address.city || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
        },
        items,
        itemCount: items.reduce((sum, item) => sum + item.qty, 0),
        subtotal: order.subtotal ?? 0,
        discount: order.discount ?? 0,
        promoCode: order.promoCode || '',
        deliveryFee: order.deliveryFee ?? 0,
        total: order.total,
    }
}

const emptyBucket = () => ({ orders: 0, salesCount: 0, cancelledCount: 0, revenue: 0, itemsSold: 0 })

// @route  GET /api/analytics/sales-history
// @access Private/Admin+Manager
// Every order since the platform started, grouped year -> month, newest first.
// "Revenue" and "sales" exclude cancelled orders (same rule as the Analytics
// pages); cancelled orders are still listed and counted separately.
// Months are grouped using the server's local time zone.
export const getSalesHistory = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).lean()

    const totals = emptyBucket()
    const years = new Map()

    for (const order of orders) {
        const date = new Date(order.createdAt)
        const yearNumber = date.getFullYear()
        const monthNumber = date.getMonth() // 0 = January

        if (!years.has(yearNumber)) years.set(yearNumber, { year: yearNumber, ...emptyBucket(), months: new Map() })
        const year = years.get(yearNumber)

        if (!year.months.has(monthNumber)) {
            year.months.set(monthNumber, { month: monthNumber, ...emptyBucket(), orderList: [] })
        }
        const month = year.months.get(monthNumber)

        const shaped = shapeOrder(order)
        const cancelled = order.status === 'cancelled'

        for (const bucket of [totals, year, month]) {
            bucket.orders += 1
            if (cancelled) {
                bucket.cancelledCount += 1
            } else {
                bucket.salesCount += 1
                bucket.revenue += order.total
                bucket.itemsSold += shaped.itemCount
            }
        }
        month.orderList.push(shaped)
    }

    const yearList = [...years.values()]
        .sort((a, b) => b.year - a.year)
        .map((year) => ({
            ...year,
            revenue: round2(year.revenue),
            months: [...year.months.values()]
                .sort((a, b) => b.month - a.month)
                .map((month) => ({ ...month, revenue: round2(month.revenue) })),
        }))

    res.json({
        since: orders.length ? orders[orders.length - 1].createdAt : null,
        totals: {
            ...totals,
            revenue: round2(totals.revenue),
            averageOrderValue: totals.salesCount ? round2(totals.revenue / totals.salesCount) : 0,
        },
        years: yearList,
    })
})
