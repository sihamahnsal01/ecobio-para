import Product from '../models/Product.js'
import HttpError from './httpError.js'
import { findActivePromotion, calculateDiscount } from './promo.js'

// Single source of truth for delivery pricing. The storefront gets these
// numbers from POST /api/orders/quote instead of keeping its own copy.
export const FREE_DELIVERY_THRESHOLD = 500
export const DELIVERY_FEE = 45

const round2 = (n) => Math.round(n * 100) / 100

// Prices a cart entirely from database data (never from the client).
// items: [{ productId, qty }]   promoCode: optional string
// Returns { lines, subtotal, discount, promoCode, deliveryFee, total }.
// Does NOT touch stock — createOrder reserves stock separately and atomically.
export async function priceOrder(items, promoCode) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new HttpError(400, 'Order must contain at least one item')
    }

    // Merge duplicate products so each one is validated/reserved once.
    const qtyByProduct = new Map()
    for (const item of items) {
        const qty = Number(item.qty)
        if (!Number.isInteger(qty) || qty < 1) {
            throw new HttpError(400, 'Product quantity must be a positive whole number')
        }
        const id = String(item.productId)
        qtyByProduct.set(id, (qtyByProduct.get(id) || 0) + qty)
    }

    const lines = []
    for (const [id, qty] of qtyByProduct) {
        const product = await Product.findById(id)
        if (!product) {
            throw new HttpError(404, `Product not found: ${id}`)
        }
        if (product.stock < qty) {
            throw new HttpError(400, `Not enough stock for ${product.name}`)
        }
        lines.push({ product, qty })
    }

    const subtotal = round2(lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0))

    let discount = 0
    let appliedCode = null
    if (promoCode && String(promoCode).trim()) {
        const promotion = await findActivePromotion(promoCode)
        discount = calculateDiscount(promotion, lines)
        if (discount <= 0) {
            throw new HttpError(400, 'This promo code does not apply to the items in your cart')
        }
        appliedCode = promotion.code
    }

    // Free delivery is judged on what the customer actually pays for goods.
    const discountedSubtotal = round2(subtotal - discount)
    const deliveryFee = discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const total = round2(discountedSubtotal + deliveryFee)

    return { lines, subtotal, discount, promoCode: appliedCode, deliveryFee, total }
}
