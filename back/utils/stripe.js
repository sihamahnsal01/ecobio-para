import Stripe from 'stripe'
import HttpError from './httpError.js'

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export const createCheckoutSession = async (order, req) => {
    if (!stripe) {
        throw new HttpError(503, 'Online payments are not configured')
    }

    const lineItems = order.items.map((item) => ({
        price_data: {
            currency: 'mad',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
    }))

    // Include the delivery fee so the Stripe total matches order.total.
    if (order.deliveryFee > 0) {
        lineItems.push({
            price_data: {
                currency: 'mad',
                product_data: { name: 'Delivery fee' },
                unit_amount: Math.round(order.deliveryFee * 100),
            },
            quantity: 1,
        })
    }

    // Stripe can't take negative line items, so a promo discount is sent as a
    // one-time coupon. This keeps the Stripe total equal to order.total.
    const discounts = []
    if (order.discount > 0) {
        const coupon = await stripe.coupons.create({
            amount_off: Math.round(order.discount * 100),
            currency: 'mad',
            duration: 'once',
            max_redemptions: 1,
            name: `Promo ${order.promoCode || ''}`.trim().slice(0, 40),
        })
        discounts.push({ coupon: coupon.id })
    }

    const origin = process.env.CLIENT_ORIGIN?.split(',')[0] || `${req.protocol}://${req.get('host')}`
    return stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: order.shippingAddress.email,
        line_items: lineItems,
        ...(discounts.length ? { discounts } : {}),
        // Unpaid sessions expire (Stripe's minimum is 30 min); the webhook then releases the stock.
        expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
        shipping_address_collection: { allowed_countries: ['MA'] },
        metadata: { orderId: order._id.toString() },
        success_url: `${origin}/?payment=success&order=${order._id}`,
        cancel_url: `${origin}/?payment=cancelled&order=${order._id}`,
    })
}
