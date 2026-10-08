import User from '../models/User.js'
import Order from '../models/Order.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  GET /api/customers
// @access Private/Admin
// There's no separate "Customer" model — a customer is just a User with
// role: 'customer'. Order stats (count + total spent) are computed from
// the Order collection rather than stored redundantly on the user.
export const getCustomers = asyncHandler(async (req, res) => {
    const { search } = req.query

    const query = { role: 'customer' }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ]
    }

    const customers = await User.find(query).sort({ createdAt: -1 })

    const stats = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $match: { user: { $ne: null } } },
        { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ])
    const statsMap = Object.fromEntries(stats.map((s) => [s._id.toString(), s]))

    const result = customers.map((c) => {
        const s = statsMap[c._id.toString()]
        return {
            _id: c._id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            totalOrders: s?.totalOrders || 0,
            totalSpent: Number(s?.totalSpent) || 0,
        }
    })

    res.json(result)
})

// @route  DELETE /api/customers/:id
// @access Private/Admin
export const deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' })
    if (!customer) {
        res.status(404)
        throw new Error('Customer not found')
    }

    await Order.updateMany({ user: customer._id }, { $unset: { user: 1 } })
    res.json({ message: 'Customer deleted' })
})