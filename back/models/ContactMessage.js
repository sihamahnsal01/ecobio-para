import mongoose from 'mongoose'

// Stores submissions from the Contact.jsx form (name, email, phone, subject, message).
const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        subject: {
            type: String,
            required: true,
            enum: ['order', 'product', 'return', 'other'],
        },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'in_progress', 'resolved'],
            default: 'new',
        },
    },
    { timestamps: true }
)

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)

export default ContactMessage
