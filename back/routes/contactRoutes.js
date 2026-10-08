import express from 'express'
import {
    submitContactMessage,
    getContactMessages,
    updateContactMessageStatus,
} from '../controllers/contactController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', submitContactMessage)

// Admin-only
router.get('/', protect, managerOrAdmin, getContactMessages)
router.put('/:id/status', protect, managerOrAdmin, updateContactMessageStatus)

export default router
