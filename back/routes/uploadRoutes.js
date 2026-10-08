import express from 'express'
import upload from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploadController.js'
import { protect, managerOrAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public — used by the storefront review form. Guests need to be able to
// attach a photo to a review without being logged in.
router.post('/review-image', upload.single('image'), uploadImage)

// Private — used by the admin dashboard (products, avatars, etc.)
router.post('/', protect, managerOrAdmin, upload.single('image'), uploadImage)

export default router