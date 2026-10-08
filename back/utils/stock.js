import Product from '../models/Product.js'
import Order from '../models/Order.js'
import HttpError from './httpError.js'

export const LOW_STOCK_THRESHOLD = 5

// Gives stock back. items: [{ product, qty }]
export async function releaseStock(items) {
    for (const item of items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } })
    }
}

// Takes stock for every item, atomically per product: the `stock: { $gte }`
// condition and the decrement happen in ONE database operation, so two buyers
// at the same moment can never both take the last unit.
// If any item can't be reserved, everything reserved so far is put back.
// Returns the updated product documents (used for low-stock alerts).
export async function reserveStock(items) {
    const reserved = []
    const updatedProducts = []
    try {
        for (const item of items) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.qty } },
                { $inc: { stock: -item.qty } },
                { new: true }
            )
            if (!updated) {
                throw new HttpError(400, `Not enough stock for ${item.name || 'a product'}`)
            }
            reserved.push(item)
            updatedProducts.push(updated)
        }
    } catch (err) {
        await releaseStock(reserved)
        throw err
    }
    return updatedProducts
}

// Puts an order's stock back exactly once. The `stockRestored` flag is claimed
// atomically, so cancelling twice (or cancelling while the expiry job runs)
// can't double-restore.
export async function restockOrder(orderId) {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, stockRestored: { $ne: true } },
        { $set: { stockRestored: true } },
        { new: false }
    )
    if (!order) return false
    await releaseStock(order.items)
    return true
}

// The reverse: an order that was cancelled (stock given back) is being
// reopened, or a payment arrived for it. Takes the stock again — and throws a
// 400 (leaving everything unchanged) if there isn't enough.
export async function reopenOrderStock(orderId) {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, stockRestored: true },
        { $set: { stockRestored: false } },
        { new: false }
    )
    if (!order) return false
    try {
        await reserveStock(order.items.map((i) => ({ product: i.product, qty: i.qty, name: i.name })))
    } catch (err) {
        await Order.updateOne({ _id: orderId }, { $set: { stockRestored: true } })
        throw err
    }
    return true
}
