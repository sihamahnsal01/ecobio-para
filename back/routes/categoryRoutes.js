import express from 'express'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getCategories)
router.post('/', protect, managerOrAdmin, createCategory)
router.put('/:id', protect, managerOrAdmin, updateCategory)
router.delete('/:id', protect, managerOrAdmin, deleteCategory)

export default router