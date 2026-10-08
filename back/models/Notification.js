import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['order', 'low_stock', 'contact'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        // Where clicking the notification should take the admin, e.g. '/orders'.
        link: {
            type: String,
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification