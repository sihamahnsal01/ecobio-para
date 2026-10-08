import Promotion from '../models/Promotion.js'
import HttpError from './httpError.js'

const round2 = (n) => Math.round(n * 100) / 100

// Looks up a promo code and checks it is currently usable.
// Throws an HttpError (404 unknown, 400 inactive) otherwise.
export async function findActivePromotion(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase()
    const promotion = code ? await Promotion.findOne({ code }) : null

    if (!promotion) {
        throw new HttpError(404, 'Promo code not found')
    }

    // The admin form saves date-only values (midnight UTC), so treat the end
    // date as valid through the END of that day, not the start of it.
    const endOfLastDay = new Date(promotion.endDate)
    endOfLastDay.setUTCHours(23, 59, 59, 999)

    const now = new Date()
    if (!promotion.active || promotion.startDate > now || endOfLastDay < now) {
        throw new HttpError(400, 'This promo code is not currently active')
    }

    return promotion
}

// lines: [{ product, qty }] where product is the database document.
// A promo with a category only discounts items of that category; a promo
// with no category discounts the whole cart. The discount can never be more
// than the eligible amount.
export function calculateDiscount(promotion, lines) {
    const category = promotion.category ? String(promotion.category).trim().toLowerCase() : null

    const eligible = lines
        .filter(({ product }) => !category || String(product.category || '').trim().toLowerCase() === category)
        .reduce((sum, { product, qty }) => sum + product.price * qty, 0)

    const raw = promotion.discountType === 'percentage'
        ? (eligible * promotion.discountValue) / 100
        : promotion.discountValue

    return round2(Math.min(Math.max(raw, 0), eligible))
}
