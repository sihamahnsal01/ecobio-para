import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, changePassword } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

router.post('/register', registerLimiter, registerUser)
router.post('/login', loginLimiter, loginUser)
router.get('/me', protect, getProfile)
router.put('/me', protect, updateProfile)
router.put('/me/password', protect, loginLimiter, changePassword)

export default router