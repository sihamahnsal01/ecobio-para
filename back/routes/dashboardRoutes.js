import express from 'express'
import { getDashboardSummary } from '../controllers/dashboardController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/summary', protect, managerOrAdmin, getDashboardSummary)

export default router