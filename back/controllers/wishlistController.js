import asyncHandler from '../utils/asyncHandler.js'
import WishlistItem from '../models/WishlistItem.js'
import Product from '../models/Product.js'

// @route  GET /api/wishlist
// @access Private – the signed-in customer's saved products, newest first.
// Products that were deleted or unpublished since are skipped.
export const getWishlist = asyncHandler(async (req, res) => {
    const items = await WishlistItem.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('product')
    res.json(items.map((item) => item.product).filter((product) => product && product.isPublished))
})

// @route  POST /api/wishlist/:productId
// @access Private – idempotent: adding the same product twice is fine.
export const addToWishlist = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId)
    if (!product || !product.isPublished) {
        res.status(404)
        throw new Error('Product not found')
    }

    const exists = await WishlistItem.exists({ user: req.user._id, product: product._id })
    if (!exists) {
        try {
            await WishlistItem.create({ user: req.user._id, product: product._id })
        } catch (err) {
            if (err.code !== 11000) throw err // double-tap race: already saved
        }
    }

    res.status(201).json({ added: true })
})

// @route  DELETE /api/wishlist/:productId
// @access Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
    await WishlistItem.deleteOne({ user: req.user._id, product: req.params.productId })
    res.json({ removed: true })
})
