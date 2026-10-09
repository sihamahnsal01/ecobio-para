import mongoose from 'mongoose'

// One row per (customer, product). A separate collection (instead of an array
// on User) makes "most wishlisted products" a cheap aggregation for the admin.
const wishlistItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    { timestamps: true }
)

wishlistItemSchema.index({ user: 1, product: 1 }, { unique: true })
wishlistItemSchema.index({ product: 1 })

export default mongoose.model('WishlistItem', wishlistItemSchema)
