import asyncHandler from '../utils/asyncHandler.js'
import VisitStat from '../models/VisitStat.js'
import WishlistItem from '../models/WishlistItem.js'
import Review from '../models/Review.js'

const UNKNOWN = 'ZZ'
// Set by Cloudflare / Vercel / CloudFront / some reverse proxies. When present
// they are more reliable than what the browser claims.
const GEO_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'cloudfront-viewer-country', 'x-country-code']

const isCountryCode = (value) =>
    typeof value === 'string' && /^[A-Za-z]{2}$/.test(value.trim()) && !['XX', 'T1'].includes(value.trim().toUpperCase())

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countryName = (code) => {
    if (code === UNKNOWN) return 'Unknown'
    try {
        return regionNames.of(code) || code
    } catch {
        return code
    }
}

const dayString = (date) => date.toISOString().slice(0, 10)

// @route  POST /api/stats/visit   body: { country }
// @access Public – one anonymous ping per browser session (sent by the storefront)
export const trackVisit = asyncHandler(async (req, res) => {
    const fromHeader = GEO_HEADERS.map((name) => req.headers[name]).find(isCountryCode)
    const claimed = isCountryCode(req.body?.country) ? req.body.country : ''
    const country = (fromHeader || claimed || UNKNOWN).trim().toUpperCase()

    await VisitStat.updateOne({ date: dayString(new Date()), country }, { $inc: { visits: 1 } }, { upsert: true })
    res.status(204).end()
})

// @route  GET /api/stats/visitors?days=30
// @access Private/Admin+Manager – visits grouped by country and by day
export const getVisitorStats = asyncHandler(async (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365)
    const since = dayString(new Date(Date.now() - (days - 1) * 86400000))
    const rows = await VisitStat.find({ date: { $gte: since } }).lean()

    const byCountry = {}
    const byDay = {}
    let totalVisits = 0
    rows.forEach((row) => {
        byCountry[row.country] = (byCountry[row.country] || 0) + row.visits
        byDay[row.date] = (byDay[row.date] || 0) + row.visits
        totalVisits += row.visits
    })

    const countries = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .map(([country, visits]) => ({
            country,
            name: countryName(country),
            visits,
            share: totalVisits ? Math.round((visits / totalVisits) * 1000) / 10 : 0,
        }))

    const daily = Object.entries(byDay)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, visits]) => ({ date, visits }))

    res.json({ days, totalVisits, countries, daily })
})

// @route  GET /api/stats/engagement
// @access Private/Admin+Manager – wishlist and community-review numbers
export const getEngagementStats = asyncHandler(async (req, res) => {
    const [wishlistItems, wishlistCustomers, topWishlisted, reviewTotals, staffReplies] = await Promise.all([
        WishlistItem.countDocuments(),
        WishlistItem.distinct('user'),
        WishlistItem.aggregate([
            { $group: { _id: '$product', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    count: 1,
                    name: '$product.name',
                    brand: '$product.brand',
                    image: '$product.image',
                },
            },
        ]),
        Review.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    hidden: { $sum: { $cond: [{ $eq: ['$status', 'hidden'] }, 1, 0] } },
                    likes: { $sum: { $ifNull: ['$likesCount', 0] } },
                    replies: { $sum: { $size: { $ifNull: ['$replies', []] } } },
                    averageRating: { $avg: { $cond: [{ $eq: ['$status', 'approved'] }, '$rating', null] } },
                },
            },
        ]),
        Review.aggregate([{ $unwind: '$replies' }, { $match: { 'replies.isStaff': true } }, { $count: 'n' }]),
    ])

    const r = reviewTotals[0] || {}
    res.json({
        wishlist: {
            totalItems: wishlistItems,
            customers: wishlistCustomers.length,
            topProducts: topWishlisted,
        },
        reviews: {
            total: r.total || 0,
            approved: r.approved || 0,
            pending: r.pending || 0,
            hidden: r.hidden || 0,
            likes: r.likes || 0,
            replies: r.replies || 0,
            staffReplies: staffReplies[0]?.n || 0,
            averageRating: r.averageRating != null ? Math.round(r.averageRating * 10) / 10 : null,
        },
    })
})
