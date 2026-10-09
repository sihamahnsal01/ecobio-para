import asyncHandler from '../utils/asyncHandler.js'
import Review from '../models/Review.js'
import Product from '../models/Product.js'

const MAX_REPLY_LENGTH = 500

const isStaffUser = (user) => user?.role === 'admin' || user?.role === 'manager'
const sameId = (a, b) => Boolean(a) && Boolean(b) && String(a) === String(b)

async function recalculateProductRating(productId) {
    const approved = await Review.find({ product: productId, status: 'approved' })
    const count = approved.length
    const average = count ? approved.reduce((sum, r) => sum + r.rating, 0) / count : 0

    await Product.findByIdAndUpdate(productId, {
        rating: Math.round(average * 10) / 10,
        reviews: count,
    })
}

// ---- response shapes used by the storefront "Customer reviews" page ----

const shapeReply = (reply, viewer) => ({
    _id: reply._id,
    text: reply.text,
    createdAt: reply.createdAt,
    isStaff: Boolean(reply.isStaff),
    mine: Boolean(viewer) && sameId(reply.user?._id || reply.user, viewer._id),
    user: { _id: reply.user?._id || null, name: reply.user?.name || 'Customer' },
})

const shapeFeedReview = (review, viewer) => ({
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    image: review.image || '',
    createdAt: review.createdAt,
    likesCount: review.likesCount ?? (review.likes || []).length,
    likedByMe: Boolean(viewer) && (review.likes || []).some((id) => sameId(id, viewer._id)),
    author: { _id: review.user?._id || null, name: review.user?.name || review.name },
    product: review.product
        ? {
              _id: review.product._id,
              name: review.product.name,
              brand: review.product.brand,
              price: review.product.price,
              image: review.product.image,
          }
        : null,
    replies: (review.replies || []).map((reply) => shapeReply(reply, viewer)),
})

// @route  POST /api/reviews
// @access Private (signed-in customers) – the review is saved under the
//         account's own name, and stays "pending" until staff approve it.
export const createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment, image } = req.body
    const numericRating = Number(rating)

    if (!productId || !comment || !String(comment).trim()) {
        res.status(400)
        throw new Error('productId, rating, and comment are required')
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        res.status(400)
        throw new Error('rating must be a whole number from 1 to 5')
    }

    const product = await Product.findById(productId)
    if (!product || !product.isPublished) {
        res.status(404)
        throw new Error('Product not found')
    }

    const review = await Review.create({
        product: productId,
        user: req.user._id,
        name: req.user.name,
        rating: numericRating,
        comment: String(comment).trim(),
        image: image || '',
        status: 'pending',
    })

    res.status(201).json(review)
})

// @route  GET /api/reviews/product/:productId
// @access Public
export const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({
        product: req.params.productId,
        status: 'approved',
    })
        .select('-likes -replies') // don't expose user ids / threads on the product page
        .sort('-createdAt')

    res.json(reviews)
})

// @route  GET /api/reviews/feed?page=1&limit=10&sort=recent|liked&rating=1..5
// @access Public (optionalAuth adds likedByMe / mine for signed-in visitors)
export const getReviewFeed = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 30)
    const rating = Number(req.query.rating)
    const sort = req.query.sort === 'liked' ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 }

    // only reviews of products that are visible in the shop
    const publishedIds = await Product.find({ isPublished: true }).distinct('_id')
    const filter = { status: 'approved', product: { $in: publishedIds } }
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) filter.rating = rating

    const [reviews, total, averages] = await Promise.all([
        Review.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('product', 'name brand price image')
            .populate('user', 'name')
            .populate('replies.user', 'name')
            .lean(),
        Review.countDocuments(filter),
        Review.aggregate([{ $match: filter }, { $group: { _id: null, average: { $avg: '$rating' } } }]),
    ])

    res.json({
        reviews: reviews.map((review) => shapeFeedReview(review, req.user)),
        page,
        pages: Math.max(Math.ceil(total / limit), 1),
        total,
        averageRating: averages[0] ? Math.round(averages[0].average * 10) / 10 : null,
    })
})

// @route  POST /api/reviews/:id/like
// @access Private – toggles the signed-in user's like
export const toggleReviewLike = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, status: 'approved' })
    if (!review) {
        res.status(404)
        throw new Error('Review not found')
    }

    const index = review.likes.findIndex((id) => sameId(id, req.user._id))
    if (index >= 0) review.likes.splice(index, 1)
    else review.likes.push(req.user._id)
    review.likesCount = review.likes.length
    await review.save()

    res.json({ liked: index < 0, likesCount: review.likesCount })
})

// @route  POST /api/reviews/:id/replies   body: { text }
// @access Private – customers reply under approved reviews; admins/managers
//         can reply to any review (their replies are flagged isStaff).
export const addReply = asyncHandler(async (req, res) => {
    const text = String(req.body.text || '').trim()
    if (!text) {
        res.status(400)
        throw new Error('Reply text is required')
    }
    if (text.length > MAX_REPLY_LENGTH) {
        res.status(400)
        throw new Error(`Replies are limited to ${MAX_REPLY_LENGTH} characters`)
    }

    const staff = isStaffUser(req.user)
    const review = await Review.findById(req.params.id)
    if (!review || (!staff && review.status !== 'approved')) {
        res.status(404)
        throw new Error('Review not found')
    }

    review.replies.push({ user: req.user._id, text, isStaff: staff })
    await review.save()
    const reply = review.replies[review.replies.length - 1]

    res.status(201).json({
        _id: reply._id,
        text: reply.text,
        createdAt: reply.createdAt,
        isStaff: staff,
        mine: true,
        user: { _id: req.user._id, name: req.user.name },
    })
})

// @route  DELETE /api/reviews/:id/replies/:replyId
// @access Private – the author of the reply, or any admin/manager
export const deleteReply = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
    const reply = review?.replies.id(req.params.replyId)
    if (!review || !reply) {
        res.status(404)
        throw new Error('Reply not found')
    }

    if (!isStaffUser(req.user) && !sameId(reply.user, req.user._id)) {
        res.status(403)
        throw new Error('You can only delete your own replies')
    }

    review.replies.pull(reply._id)
    await review.save()

    res.json({ message: 'Reply deleted' })
})

// ---- admin dashboard ----

export const getAllReviews = asyncHandler(async (req, res) => {
    const { status } = req.query
    const filter = status ? { status } : {}

    const reviews = await Review.find(filter)
        .populate('product', 'name image')
        .populate('user', 'name email')
        .populate('replies.user', 'name role')
        .sort('-createdAt')

    res.json(reviews)
})

export const updateReviewStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!['pending', 'approved', 'hidden'].includes(status)) {
        res.status(400)
        throw new Error('status must be pending, approved, or hidden')
    }

    const review = await Review.findById(req.params.id)
    if (!review) {
        res.status(404)
        throw new Error('Review not found')
    }

    review.status = status
    await review.save()
    await recalculateProductRating(review.product)

    res.json(review)
})

export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
    if (!review) {
        res.status(404)
        throw new Error('Review not found')
    }

    const productId = review.product
    await review.deleteOne()
    await recalculateProductRating(productId)

    res.json({ message: 'Review deleted' })
})
