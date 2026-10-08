import Notification from '../models/Notification.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  GET /api/notifications
// @access Private/Admin
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(50)
    const unreadCount = await Notification.countDocuments({ read: false })
    res.json({ notifications, unreadCount })
})

// @route  PUT /api/notifications/:id/read
// @access Private/Admin
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id)
    if (!notification) {
        res.status(404)
        throw new Error('Notification not found')
    }
    notification.read = true
    await notification.save()
    res.json(notification)
})

// @route  PUT /api/notifications/mark-all-read
// @access Private/Admin
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
})

// @route  DELETE /api/notifications/:id
// @access Private/Admin
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id)
    if (!notification) {
        res.status(404)
        throw new Error('Notification not found')
    }
    res.json({ message: 'Notification deleted' })
})