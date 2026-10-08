import express from 'express'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, managerOrAdmin, getNotifications)
router.put('/mark-all-read', protect, managerOrAdmin, markAllAsRead) // must come before '/:id/read'
router.put('/:id/read', protect, managerOrAdmin, markAsRead)
router.delete('/:id', protect, managerOrAdmin, deleteNotification)

export default router