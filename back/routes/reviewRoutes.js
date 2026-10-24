import express from 'express'
import {
    createReview,
    getProductReviews,
    getReviewFeed,
    toggleReviewLike,
    addReply,
    deleteReply,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
    getMyActivity,
    updateMyReview,
    deleteMyReview,
    updateReply,
} from '../controllers/reviewController.js'
import { protect, managerOrAdmin, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// public
router.get('/product/:productId', getProductReviews)
router.get('/feed', optionalAuth, getReviewFeed)

// signed-in customers (and staff)
router.get('/mine', protect, getMyActivity)
router.put('/mine/:id', protect, updateMyReview)
router.delete('/mine/:id', protect, deleteMyReview)
router.post('/', protect, createReview)
router.post('/:id/like', protect, toggleReviewLike)
router.post('/:id/replies', protect, addReply)
router.put('/:id/replies/:replyId', protect, updateReply)
router.delete('/:id/replies/:replyId', protect, deleteReply)

// admin dashboard
router.get('/', protect, managerOrAdmin, getAllReviews)
router.patch('/:id/status', protect, managerOrAdmin, updateReviewStatus)
router.delete('/:id', protect, managerOrAdmin, deleteReview)

export default router
