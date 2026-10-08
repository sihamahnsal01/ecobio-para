import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Promo code is required'],
            trim: true,
            uppercase: true,
            unique: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        // Leave null/empty to apply store-wide instead of to one category.
        category: {
            type: String,
            default: null,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

const Promotion = mongoose.model('Promotion', promotionSchema)

export default Promotion