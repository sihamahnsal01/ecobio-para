import Category from '../models/Category.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  GET /api/categories
// @access Public
// Returns each category along with how many products currently use it.
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ name: 1 })
    const counts = await Product.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]))

    res.json(
        categories.map((c) => ({
            _id: c._id,
            name: c.name,
            productCount: countMap[c.name] || 0,
        }))
    )
})

// @route  POST /api/categories
// @access Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body
    if (!name || !name.trim()) {
        res.status(400)
        throw new Error('Category name is required')
    }
    const category = await Category.create({ name: name.trim() })
    res.status(201).json(category)
})

// @route  PUT /api/categories/:id
// @access Private/Admin
// Renaming a category updates every product that uses the old name too,
// so nothing silently falls out of the category it was in.
export const updateCategory = asyncHandler(async (req, res) => {
    const { name } = req.body
    if (!name || !name.trim()) {
        res.status(400)
        throw new Error('Category name is required')
    }

    const category = await Category.findById(req.params.id)
    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    const oldName = category.name
    category.name = name.trim()
    await category.save()

    if (oldName !== category.name) {
        await Product.updateMany({ category: oldName }, { category: category.name })
    }

    res.json(category)
})

// @route  DELETE /api/categories/:id
// @access Private/Admin
// Refuses to delete a category that still has products in it, so products
// can't silently end up with a category that no longer exists.
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    const productCount = await Product.countDocuments({ category: category.name })
    if (productCount > 0) {
        res.status(400)
        throw new Error(
            `Can't delete "${category.name}" — ${productCount} product(s) still use it. Move them to another category first.`
        )
    }

    await category.deleteOne()
    res.json({ message: 'Category deleted' })
})