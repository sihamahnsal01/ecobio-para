import express from 'express'
import {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    validatePromoCode,
} from '../controllers/promotionController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/validate/:code', validatePromoCode) // public — must come before the protected GET '/'
router.get('/', protect, managerOrAdmin, getPromotions)
router.post('/', protect, managerOrAdmin, createPromotion)
router.put('/:id', protect, managerOrAdmin, updatePromotion)
router.delete('/:id', protect, managerOrAdmin, deletePromotion)

export default router