import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        // Snapshot fields so historical orders stay accurate even if
        // the product's name/price changes later.
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        image: { type: String },
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: (v) => Array.isArray(v) && v.length > 0,
        },
        shippingAddress: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true, default: 'Morocco' },
        },
        subtotal: { type: Number, required: true },
        // Promo code applied at checkout (validated server-side) and the amount it took off.
        promoCode: { type: String },
        discount: { type: Number, default: 0, min: 0 },
        deliveryFee: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ['cash_on_delivery', 'online'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paidAt: { type: Date },
        // True once this order's stock has been given back (cancelled/expired/deleted).
        // Prevents restoring the same stock twice.
        stockRestored: { type: Boolean, default: false },
        // Latest Stripe Checkout session, and when an unpaid online order is given up on.
        stripeSessionId: { type: String },
        paymentExpiresAt: { type: Date },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
