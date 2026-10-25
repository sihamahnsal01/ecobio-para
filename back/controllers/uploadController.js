import fs from 'fs/promises'
import path from 'path'
import asyncHandler from '../utils/asyncHandler.js'
import { isCloudinaryEnabled, uploadToCloudinary, optimizedUrl } from '../config/cloudinary.js'

const uploadDir = path.join(process.cwd(), 'uploads')

// @route  POST /api/upload  and  POST /api/upload/review-image
// Expects multipart/form-data with a single field named "image".
// Returns { url } to save on the product / review.
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400)
        throw new Error('No image file was uploaded')
    }

    const folder = req.uploadFolder || 'products'

    // Online: send to Cloudinary (permanent link)
    if (isCloudinaryEnabled()) {
        const result = await uploadToCloudinary(req.file.buffer, folder)
        return res.status(201).json({ url: optimizedUrl(result.secure_url) })
    }

    // Local development without Cloudinary: save in the uploads folder like before
    await fs.mkdir(uploadDir, { recursive: true })
    const ext = path.extname(req.file.originalname).toLowerCase()
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    await fs.writeFile(path.join(uploadDir, filename), req.file.buffer)

    res.status(201).json({ url: `${req.protocol}://${req.get('host')}/uploads/${filename}` })
})