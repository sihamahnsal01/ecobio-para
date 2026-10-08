import Promotion from '../models/Promotion.js'
import Subscriber from '../models/Subscriber.js'
import { sendPromotionEmail } from '../utils/email.js'
import { findActivePromotion } from '../utils/promo.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  GET /api/promotions
// @access Private/Admin
export const getPromotions = asyncHandler(async (req, res) => {
    const promotions = await Promotion.find({}).sort({ createdAt: -1 })
    res.json(promotions)
})

// @route  POST /api/promotions
// @access Private/Admin
export const createPromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.create(req.body)
    const subscribers = await Subscriber.find({}, 'email')
    let notification = { sent: false, reason: 'no-subscribers' }

    try {
        notification = await sendPromotionEmail(subscribers, promotion)
    } catch (error) {
        notification = { sent: false, reason: 'email-send-failed' }
        console.error('Promotion email notification failed:', error.message)
    }

    res.status(201).json({ promotion, notification })
})

// @route  PUT /api/promotions/:id
// @access Private/Admin
export const updatePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id)
    if (!promotion) {
        res.status(404)
        throw new Error('Promotion not found')
    }
    Object.assign(promotion, req.body)
    const updated = await promotion.save()
    res.json(updated)
})

// @route  DELETE /api/promotions/:id
// @access Private/Admin
export const deletePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id)
    if (!promotion) {
        res.status(404)
        throw new Error('Promotion not found')
    }
    await promotion.deleteOne()
    res.json({ message: 'Promotion deleted' })
})

// @route  GET /api/promotions/validate/:code
// @access Public
// For the storefront checkout to call once a "promo code" field exists there.
export const validatePromoCode = asyncHandler(async (req, res) => {
    // Same rules createOrder uses (utils/promo.js), so the two can't drift apart.
    const promotion = await findActivePromotion(req.params.code)
    res.json(promotion)
})