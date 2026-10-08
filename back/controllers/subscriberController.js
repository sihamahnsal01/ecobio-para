import Subscriber from '../models/Subscriber.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  POST /api/subscribers
// @access Public
export const subscribe = asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()

    if (!email) {
        res.status(400)
        throw new Error('Email address is required')
    }

    const subscriber = await Subscriber.findOneAndUpdate(
        { email },
        { $setOnInsert: { email } },
        { returnDocument: 'after', upsert: true, runValidators: true }
    )

    res.status(201).json({ message: 'You are subscribed to promotion updates.', subscriber })
})
