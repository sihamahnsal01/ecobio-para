import mongoose from 'mongoose'

// A reply written under a review, by a customer or by the shop's staff.
const replySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        // true when the author is an admin or a manager (shown as "Eco&Bio team")
        isStaff: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'hidden'],
            default: 'pending',
        },
        // users who marked the review as helpful (one like per user)
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        // kept in sync with likes.length so the feed can sort by "most liked"
        likesCount: {
            type: Number,
            default: 0,
        },
        replies: [replySchema],
    },
    { timestamps: true }
)

reviewSchema.index({ status: 1, createdAt: -1 })
reviewSchema.index({ status: 1, likesCount: -1, createdAt: -1 })

export default mongoose.model('Review', reviewSchema)
