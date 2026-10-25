import express from 'express'
import upload from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploadController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'
import { uploadLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

// Tells the controller which Cloudinary folder to use
const setFolder = (name) => (req, res, next) => {
    req.uploadFolder = name
    next()
}

// Public — used by the storefront review form. Limited to 20 images per hour per visitor.
router.post('/review-image', uploadLimiter, setFolder('reviews'), upload.single('image'), uploadImage)

// Private — used by the admin dashboard (products, avatars, etc.)
router.post('/', protect, managerOrAdmin, setFolder('products'), upload.single('image'), uploadImage)

export default router