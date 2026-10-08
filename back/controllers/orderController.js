import Order from '../models/Order.js'
import Notification from '../models/Notification.js'
import { createCheckoutSession, stripe } from '../utils/stripe.js'
import asyncHandler from '../utils/asyncHandler.js'
import { priceOrder } from '../utils/pricing.js'
import { reserveStock, releaseStock, restockOrder, reopenOrderStock, LOW_STOCK_THRESHOLD } from '../utils/stock.js'
import { cancelUnpaidOnlineOrder } from '../utils/orderExpiry.js'

// How long a customer has to reach Stripe after placing an online order.
// Once they open Stripe Checkout, the session's own expiry takes over.
const ONLINE_PAYMENT_WINDOW_MS = 60 * 60 * 1000
// Extra time after a Stripe session expires, so its webhook arrives before our sweeper acts.
const SESSION_EXPIRY_GRACE_MS = 5 * 60 * 1000

// @route  POST /api/orders/quote
// @access Public
// Body: { items: [{ productId, qty }], promoCode? }
// Returns the exact amounts createOrder would charge (subtotal, discount,
// delivery, total) so the storefront never has to guess or keep its own copy
// of the pricing rules.
export const quoteOrder = asyncHandler(async (req, res) => {
    const { items, promoCode } = req.body
    const { subtotal, discount, promoCode: appliedCode, deliveryFee, total } = await priceOrder(items, promoCode)
    res.json({ subtotal, discount, promoCode: appliedCode, deliveryFee, total })
})

// @route  POST /api/orders
// @access Public (logged-in customers are linked to the order)
// Body: { items: [{ productId, qty }], shippingAddress, paymentMethod, promoCode? }
// Prices, promo discount and delivery fee are all computed on the server from
// the database, so a tampered request body can't change what's actually charged.
export const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, promoCode } = req.body

    if (!items || items.length === 0) {
        res.status(400)
        throw new Error('Order must contain at least one item')
    }
    if (!shippingAddress) {
        res.status(400)
        throw new Error('Shipping address is required')
    }
    if (!['cash_on_delivery', 'online'].includes(paymentMethod)) {
        res.status(400)
        throw new Error('Choose a valid payment method')
    }
    if (paymentMethod === 'online' && !stripe) {
        res.status(503)
        throw new Error('Online payment is temporarily unavailable')
    }
    for (const field of ['name', 'email', 'phone', 'street', 'city', 'postalCode', 'country']) {
        if (!shippingAddress[field]) {
            res.status(400)
            throw new Error(`Shipping ${field} is required`)
        }
    }

    const pricing = await priceOrder(items, promoCode)

    // Take the stock first, atomically. If two customers want the last unit,
    // exactly one of them gets it and the other receives "Not enough stock".
    const stockItems = pricing.lines.map(({ product, qty }) => ({
        product: product._id,
        qty,
        name: product.name,
    }))
    const updatedProducts = await reserveStock(stockItems)

    let order
    try {
        order = await Order.create({
            user: req.user?._id,
            items: pricing.lines.map(({ product, qty }) => ({
                product: product._id,
                name: product.name,
                price: product.price,
                qty,
                image: product.image,
            })),
            shippingAddress,
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            promoCode: pricing.promoCode || undefined,
            deliveryFee: pricing.deliveryFee,
            total: pricing.total,
            paymentMethod,
            paymentStatus: 'pending',
            paymentExpiresAt:
                paymentMethod === 'online' ? new Date(Date.now() + ONLINE_PAYMENT_WINDOW_MS) : undefined,
        })
    } catch (err) {
        // The order wasn't saved, so don't keep the stock reserved.
        await releaseStock(stockItems)
        throw err
    }

    for (const product of updatedProducts) {
        if (product.stock <= LOW_STOCK_THRESHOLD) {
            await Notification.create({
                type: 'low_stock',
                message: `Low stock: "${product.name}" has only ${product.stock} left`,
                link: '/products/inventory',
            })
        }
    }

    await Notification.create({
        type: 'order',
        message: `New order from ${shippingAddress.name} — ${order.total.toFixed(2)} DH`,
        link: '/orders',
    })

    res.status(201).json(order)
})

// @route  GET /api/orders/my
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
})

// @route  POST /api/orders/claim
// @access Private
// Attach orders placed before account creation to the verified account email.
export const claimGuestOrders = asyncHandler(async (req, res) => {
    const email = req.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const result = await Order.updateMany(
        {
            user: null,
            'shippingAddress.email': { $regex: `^${email}$`, $options: 'i' },
        },
        { $set: { user: req.user._id } }
    )

    res.json({ claimed: result.modifiedCount })
})

// @route  POST /api/orders/:id/pay
// @access Public with matching order email
export const createOnlinePayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order || order.paymentMethod !== 'online') {
        res.status(404)
        throw new Error('Online order not found')
    }
    if (order.shippingAddress.email.toLowerCase() !== String(req.body.email || '').trim().toLowerCase()) {
        res.status(403)
        throw new Error('Payment authorization failed')
    }
    if (order.paymentStatus === 'paid') {
        res.status(400)
        throw new Error('This order has already been paid')
    }
    if (order.status === 'cancelled') {
        res.status(400)
        throw new Error('This order was cancelled. Please place a new order.')
    }

    const session = await createCheckoutSession(order, req)

    // Remember the latest session so only ITS expiry can cancel the order.
    await Order.updateOne(
        { _id: order._id },
        {
            $set: {
                stripeSessionId: session.id,
                paymentExpiresAt: new Date(session.expires_at * 1000 + SESSION_EXPIRY_GRACE_MS),
            },
        }
    )

    res.json({ url: session.url })
})

// Marks an order paid. If it had already been cancelled (and its stock given
// back) before the money arrived, try to take the stock again; if that's
// impossible, still record the payment and alert the admin — the customer has paid.
async function markOrderPaid(orderId) {
    const order = await Order.findById(orderId)
    if (!order || order.paymentStatus === 'paid') return

    if (order.status === 'cancelled') {
        try {
            await reopenOrderStock(order._id)
        } catch {
            await Notification.create({
                type: 'order',
                message: `Order #${order._id.toString().slice(-6).toUpperCase()} was paid after being cancelled and some items are out of stock — fulfil or refund it manually`,
                link: '/orders',
            })
        }
    }

    order.paymentStatus = 'paid'
    order.paidAt = new Date()
    if (['pending', 'cancelled'].includes(order.status)) order.status = 'paid'
    await order.save()
}

export const handleStripeWebhook = asyncHandler(async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ message: 'Payment webhook is not configured' })
    }

    let event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch {
        return res.status(400).json({ message: 'Invalid payment webhook signature' })
    }

    const session = event.data.object
    const orderId = session?.metadata?.orderId

    if (event.type === 'checkout.session.completed') {
        if (session.payment_status === 'paid' && orderId) {
            await markOrderPaid(orderId)
        }
    } else if (event.type === 'checkout.session.expired') {
        // The customer abandoned this Stripe session: cancel the order and free the stock.
        // Only the order's LATEST session counts, so an older expired link can't cancel it.
        if (orderId) {
            await cancelUnpaidOnlineOrder({ _id: orderId, stripeSessionId: session.id })
        }
    }

    res.json({ received: true })
})

// @route  GET /api/orders/:id
// @access Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    const isOwner = order.user && order.user.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to view this order')
    }

    res.json(order)
})

// @route  GET /api/orders
// @access Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 })
    res.json(orders)
})

// @route  PUT /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        res.status(400)
        throw new Error('Invalid order status')
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    // Cancelling gives the stock back; reopening a cancelled order takes it
    // again (and is refused with "Not enough stock" if it's no longer there).
    const wasCancelled = order.status === 'cancelled'
    if (status === 'cancelled' && !wasCancelled) {
        await restockOrder(order._id)
    } else if (status !== 'cancelled' && wasCancelled) {
        await reopenOrderStock(order._id)
    }

    order.status = status
    if (status === 'paid') order.paidAt = new Date()
    if (status === 'delivered') order.deliveredAt = new Date()
    if (status === 'paid') order.paymentStatus = 'paid'
    if (status === 'cancelled' && order.paymentStatus !== 'paid') order.paymentStatus = 'failed'

    const updated = await order.save()
    res.json(updated)
})

// @route  DELETE /api/orders/:id
// @access Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    // Deleting an order that never left the shop returns its stock. Shipped and
    // delivered orders already went out, so their stock stays deducted
    // (cancelled ones were restored when they were cancelled).
    if (!['cancelled', 'shipped', 'delivered'].includes(order.status)) {
        await restockOrder(order._id)
    }

    await order.deleteOne()
    res.json({ message: 'Order deleted' })
})
