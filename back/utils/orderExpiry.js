import Order from '../models/Order.js'
import { restockOrder } from './stock.js'

// Cancels an unpaid online order and gives its stock back. The status change
// is a single conditional update, so it is safe to call from both the Stripe
// webhook and the background sweeper. Returns the order, or null if it was no
// longer eligible (e.g. it got paid in the meantime).
export async function cancelUnpaidOnlineOrder(filter) {
    const order = await Order.findOneAndUpdate(
        { paymentMethod: 'online', paymentStatus: 'pending', status: 'pending', ...filter },
        { $set: { status: 'cancelled', paymentStatus: 'failed' } },
        { new: true }
    )
    if (!order) return null
    await restockOrder(order._id)
    return order
}

// Safety net for customers who never reach Stripe, or whose "expired" webhook
// was missed: cancels online orders whose payment window has passed.
export async function expireUnpaidOnlineOrders() {
    const stale = await Order.find(
        {
            paymentMethod: 'online',
            paymentStatus: 'pending',
            status: 'pending',
            paymentExpiresAt: { $lt: new Date() },
        },
        '_id'
    )

    let cancelled = 0
    for (const { _id } of stale) {
        const done = await cancelUnpaidOnlineOrder({ _id, paymentExpiresAt: { $lt: new Date() } })
        if (done) cancelled += 1
    }
    return cancelled
}

export function startOrderExpirySweeper(intervalMs = 5 * 60 * 1000) {
    const run = () =>
        expireUnpaidOnlineOrders()
            .then((n) => {
                if (n) console.log(`Cancelled ${n} unpaid online order(s) and restored their stock`)
            })
            .catch((err) => console.error('Order expiry sweep failed:', err.message))

    setTimeout(run, 15 * 1000).unref?.()
    setInterval(run, intervalMs).unref?.()
}
