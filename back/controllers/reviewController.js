import asyncHandler from '../utils/asyncHandler.js'
import Review from '../models/Review.js'
import Product from '../models/Product.js'

async function recalculateProductRating(productId) {
    const approved = await Review.find({ product: productId, status: 'approved' })
    const count = approved.length
    const average = count ? approved.reduce((sum, r) => sum + r.rating, 0) / count : 0

    await Product.findByIdAndUpdate(productId, {
        rating: Math.round(average * 10) / 10,
        reviews: count,
    })
}

export const createReview = asyncHandler(async (req, res) => {
    const { productId, name, rating, comment, image } = req.body

    if (!productId || !name || !rating || !comment) {
        res.status(400)
        throw new Error('productId, name, rating, and comment are required')
    }

    const product = await Product.findById(productId)
    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    const review = await Review.create({
        product: productId,
        user: req.user ? req.user._id : undefined,
        name,
        rating,
        comment,
        image: image || '',
        status: 'pending',
    })

    res.status(201).json(review)
})

export const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({
        product: req.params.productId,
        status: 'approved',
    }).sort('-createdAt')

    res.json(reviews)
})

export const getAllReviews = asyncHandler(async (req, res) => {
    const { status } = req.query
    const filter = status ? { status } : {}

    const reviews = await Review.find(filter)
        .populate('product', 'name image')
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