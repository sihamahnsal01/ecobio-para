import express from 'express'
import { trackVisit, getVisitorStats, getEngagementStats } from '../controllers/statsController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

// Tiny in-memory limiter for the public ping (20 per minute per IP), so the
// counters can't be inflated by a script hammering the endpoint.
const hits = new Map()
function visitLimiter(req, res, next) {
    const now = Date.now()
    const entry = hits.get(req.ip)
    if (!entry || entry.reset < now) {
        hits.set(req.ip, { count: 1, reset: now + 60_000 })
        return next()
    }
    if (entry.count >= 20) return res.status(429).json({ message: 'Too many requests' })
    entry.count += 1
    next()
}
setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of hits) if (entry.reset < now) hits.delete(ip)
}, 5 * 60_000).unref()

router.post('/visit', visitLimiter, trackVisit)
router.get('/visitors', protect, managerOrAdmin, getVisitorStats)
router.get('/engagement', protect, managerOrAdmin, getEngagementStats)

export default router
