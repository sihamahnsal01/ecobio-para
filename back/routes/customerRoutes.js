import express from 'express'
import { getCustomers, deleteCustomer } from '../controllers/customerController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, managerOrAdmin, getCustomers)
router.delete('/:id', protect, managerOrAdmin, deleteCustomer)

export default router