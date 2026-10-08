import express from 'express'
import {
    createOrder,
    quoteOrder,
    createOnlinePayment,
    claimGuestOrders,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/orderController.js'
import { protect, managerOrAdmin, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/', optionalAuth, createOrder)
router.post('/quote', quoteOrder)
router.post('/claim', protect, claimGuestOrders)
router.post('/:id/pay', createOnlinePayment)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)

// Admin-only
router.get('/', protect, managerOrAdmin, getAllOrders)
router.put('/:id/status', protect, managerOrAdmin, updateOrderStatus)
router.delete('/:id', protect, managerOrAdmin, deleteOrder)

export default router