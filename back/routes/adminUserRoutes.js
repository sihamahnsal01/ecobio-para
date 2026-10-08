import express from 'express'
import {
  getAdminUsers,
  createAdminUser,
  promoteToAdmin,
  revokeAdminAccess,
  updateAdminUser,
  deleteAdminUser
} from '../controllers/adminUserController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, adminOnly, getAdminUsers)
router.post('/', protect, adminOnly, createAdminUser)
router.put('/promote', protect, adminOnly, promoteToAdmin)
router.put('/:id/revoke', protect, adminOnly, revokeAdminAccess)

// Route handlers for editing and deletion
router.put('/:id', protect, adminOnly, updateAdminUser)
router.delete('/:id', protect, adminOnly, deleteAdminUser)

export default router