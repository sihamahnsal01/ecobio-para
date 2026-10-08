import express from 'express'
import {
    getProducts,
    getAdminProducts,
    getBestSellingProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductPublication,
} from '../controllers/productController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'
const router = express.Router()

router.get('/', getProducts)
router.get('/admin', protect, managerOrAdmin, getAdminProducts)
router.get('/bestsellers', getBestSellingProducts)
router.patch('/:id/publish', protect, managerOrAdmin, toggleProductPublication)
router.get('/:id', getProductById)


router.post('/', protect, managerOrAdmin, createProduct)
router.put('/:id', protect, managerOrAdmin, updateProduct)
router.delete('/:id', protect, managerOrAdmin, deleteProduct)

export default router
