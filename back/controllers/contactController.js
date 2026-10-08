import ContactMessage from '../models/ContactMessage.js'
import Notification from '../models/Notification.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  POST /api/contact
// @access Public
// Matches the fields sent by Contact.jsx's form: name, email, phone, subject, message
export const submitContactMessage = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !subject || !message) {
        res.status(400)
        throw new Error('Name, email, subject, and message are required')
    }

    const entry = await ContactMessage.create({ name, email, phone, subject, message })

    await Notification.create({
        type: 'contact',
        message: `New message from ${name}: ${subject}`,
        // No admin page displays ContactMessage entries yet, so this has
        // nowhere useful to link to — leave it unlinked for now.
        link: null,
    })

    res.status(201).json({ message: "Thanks — we'll be in touch shortly.", id: entry._id })
})

// @route  GET /api/contact
// @access Private/Admin
export const getContactMessages = asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 })
    res.json(messages)
})

// @route  PUT /api/contact/:id/status
// @access Private/Admin
export const updateContactMessageStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const entry = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status },
        { returnDocument: 'after', runValidators: true }
    )
    if (!entry) {
        res.status(404)
        throw new Error('Message not found')
    }
    res.json(entry)
})