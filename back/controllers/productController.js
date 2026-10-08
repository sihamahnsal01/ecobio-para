import Product from '../models/Product.js'
import Order from '../models/Order.js'
import asyncHandler from '../utils/asyncHandler.js'

const normalizeImageUrl = (image, req) => {
    if (!image) return image
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
        return image
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`
    return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`
}

// --- Auto-computed tags -----------------------------------------------
// 'New', 'Bestseller', and 'Sale' are never stored on the product — they
// are computed fresh on every read, so they can never go stale (no cron
// job needed to "expire" New, no manual upkeep for Bestseller/Sale).
// 'Organic' is the only tag an admin sets manually, since it's a real
// product attribute the system has no way to infer.
const NEW_TAG_WINDOW_DAYS = 7
const BESTSELLER_LIMIT = 6

// Same aggregation as getBestSellingProducts below, extracted so both
// that endpoint and the tag computation share one source of truth.
const getBestsellerIds = async () => {
    const sales = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', qtySold: { $sum: '$items.qty' } } },
        { $sort: { qtySold: -1 } },
        { $limit: BESTSELLER_LIMIT },
    ])
    return new Set(sales.map((s) => String(s._id)))
}

const computeDisplayTags = (product, bestsellerIds) => {
    const auto = []
    const ageDays = (Date.now() - new Date(product.createdAt).getTime()) / 86400000
    if (ageDays <= NEW_TAG_WINDOW_DAYS) auto.push('New')
    if (bestsellerIds.has(String(product._id))) auto.push('Bestseller')
    if ((product.stock ?? 0) <= 0) auto.push('Sale')

    const manual = (product.tags || []).filter((t) => t === 'Organic')
    return [...auto, ...manual]
}

const normalizeProduct = (product, req, bestsellerIds = new Set()) => {
    if (!product) return product
    const obj = product.toObject?.() || product
    return {
        ...obj,
        image: normalizeImageUrl(obj.image, req),
        tags: computeDisplayTags(obj, bestsellerIds),
    }
}

const isDuplicateProduct = async (name, brand, excludeId = null) => {
    const query = {
        name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        brand: { $regex: `^${brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    }

    if (excludeId) query._id = { $ne: excludeId }

    const existing = await Product.findOne(query)
    return Boolean(existing)
}

// @route  GET /api/products
// @access Public
// Supports query params matching the frontend Products.jsx filters:
//   ?category=Beauty%20%26%20Skincare
//   ?maxPrice=35
//   ?tag=Bestseller
//   ?sort=price_asc | price_desc | top_rated
//   ?search=vitamin
export const getProducts = asyncHandler(async (req, res) => {
    const { category, maxPrice, tag, sort, search } = req.query

    const filter = { isPublished: true }
    if (category && category !== 'All') filter.category = category
    if (maxPrice) filter.price = { $lte: Number(maxPrice) }
    if (search) filter.$text = { $search: search }

    let query = Product.find(filter)

    if (sort === 'price_asc') query = query.sort({ price: 1 })
    if (sort === 'price_desc') query = query.sort({ price: -1 })
    if (sort === 'top_rated') query = query.sort({ reviews: -1 })

    const [products, bestsellerIds] = await Promise.all([query, getBestsellerIds()])
    let normalized = products.map((product) => normalizeProduct(product, req, bestsellerIds))

    // Tags are computed, not stored, so this filters in memory rather
    // than as a Mongo query field.
    if (tag) normalized = normalized.filter((p) => p.tags.includes(tag))

    res.json(normalized)
})

// @route  GET /api/products/admin
// @access Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
    const { category, search } = req.query
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (search) filter.$text = { $search: search }
    const [products, bestsellerIds] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }),
        getBestsellerIds(),
    ])
    res.json(products.map((product) => normalizeProduct(product, req, bestsellerIds)))
})

// @route  PATCH /api/products/:id/publish
// @access Private/Admin
export const toggleProductPublication = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }
    product.isPublished = req.body.isPublished === true
    await product.save()
    res.json(normalizeProduct(product, req, await getBestsellerIds()))
})

// @route  GET /api/products/bestsellers
// @access Public
export const getBestSellingProducts = asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 12)
    const sales = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', qtySold: { $sum: '$items.qty' } } },
        { $sort: { qtySold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        { $match: { 'product.isPublished': true } },
    ])

    // This list IS the bestseller list, so every item on it qualifies
    // for the 'Bestseller' tag by definition.
    const bestsellerIds = new Set(sales.map((s) => String(s._id)))

    res.json(sales.map(({ product, qtySold }) => ({
        ...normalizeProduct(product, req, bestsellerIds),
        qtySold,
    })))
})

// @route  GET /api/products/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, isPublished: true })
    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }
    res.json(normalizeProduct(product, req, await getBestsellerIds()))
})

// @route  POST /api/products
// @access Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const { name, brand } = req.body

    if (!name || !brand) {
        res.status(400)
        throw new Error('Product name and brand are required')
    }

    const duplicate = await isDuplicateProduct(name, brand)
    if (duplicate) {
        res.status(409)
        throw new Error('A product with this name and brand already exists')
    }

    const product = await Product.create({
        ...req.body,
        image: normalizeImageUrl(req.body.image, req),
    })

    res.status(201).json(normalizeProduct(product, req, await getBestsellerIds()))
})

// @route  PUT /api/products/:id
// @access Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const { name, brand } = req.body

    if (name && brand) {
        const duplicate = await isDuplicateProduct(name, brand, req.params.id)
        if (duplicate) {
            res.status(409)
            throw new Error('A product with this name and brand already exists')
        }
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            ...req.body,
            image: req.body.image ? normalizeImageUrl(req.body.image, req) : req.body.image,
        },
        {
            returnDocument: 'after',
            runValidators: true,
        }
    )
    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }
    res.json(normalizeProduct(product, req, await getBestsellerIds()))
})

// @route  DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }
    res.json({ message: 'Product deleted' })
})