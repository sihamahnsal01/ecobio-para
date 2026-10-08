import asyncHandler from '../utils/asyncHandler.js'

// @route  POST /api/upload
// @access Private/Admin
// Expects multipart/form-data with a single field named "image".
// Returns the public URL to use as a Product's `image` field.
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400)
        throw new Error('No image file was uploaded')
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    res.status(201).json({ url })
})
