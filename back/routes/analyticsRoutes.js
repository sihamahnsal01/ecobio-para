import express from 'express'
import {
    getSalesAnalytics,
    getCustomerAnalytics,
    getProductAnalytics,
    getCategoryAnalytics,
} from '../controllers/analyticsController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/sales', protect, managerOrAdmin, getSalesAnalytics)
router.get('/customers', protect, managerOrAdmin, getCustomerAnalytics)
router.get('/products', protect, managerOrAdmin, getProductAnalytics)
router.get('/categories', protect, managerOrAdmin, getCategoryAnalytics)

export default router