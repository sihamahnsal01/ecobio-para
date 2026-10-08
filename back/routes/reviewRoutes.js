import express from 'express'
import {
    createReview,
    getProductReviews,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
} from '../controllers/reviewController.js'
import { protect, managerOrAdmin, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/product/:productId', getProductReviews)
router.post('/', optionalAuth, createReview)

router.get('/', protect, managerOrAdmin, getAllReviews)
router.patch('/:id/status', protect, managerOrAdmin, updateReviewStatus)
router.delete('/:id', protect, managerOrAdmin, deleteReview)

export default router
