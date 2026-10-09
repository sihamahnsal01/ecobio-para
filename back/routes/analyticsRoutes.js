import express from 'express'
import {
    getSalesAnalytics,
    getCustomerAnalytics,
    getProductAnalytics,
    getCategoryAnalytics,
} from '../controllers/analyticsController.js'
import { getSalesHistory } from '../controllers/salesHistoryController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/sales', protect, managerOrAdmin, getSalesAnalytics)
router.get('/sales-history', protect, managerOrAdmin, getSalesHistory)
router.get('/customers', protect, managerOrAdmin, getCustomerAnalytics)
router.get('/products', protect, managerOrAdmin, getProductAnalytics)
router.get('/categories', protect, managerOrAdmin, getCategoryAnalytics)

export default router
