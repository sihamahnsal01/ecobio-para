import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        oldPrice: {
            type: Number,
            default: null,
        },
        image: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        tags: {
            // e.g. ['Bestseller', 'New', 'Sale', 'Organic']
            type: [String],
            default: [],
        },
        benefits: {
            type: [String],
            default: [],
        },
        format: {
            type: String,
            trim: true,
            default: '',
        },
        packSize: {
            type: String,
            trim: true,
            default: '',
        },
        dosage: {
            type: String,
            trim: true,
            default: '',
        },
        reference: {
            type: String,
            trim: true,
            default: '',
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

// Speeds up the category/price filtering the Products page does.
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ name: 1, brand: 1 }, { unique: true })
productSchema.index({ name: 'text', brand: 'text' })

const Product = mongoose.model('Product', productSchema)

export default Product