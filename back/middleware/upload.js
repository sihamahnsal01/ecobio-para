import multer from 'multer'
import path from 'path'

// Only these file types are allowed
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

// Keep the file in memory; uploadController sends it to Cloudinary
// (online) or saves it in the uploads folder (local development).
const storage = multer.memoryStorage()

// Check BOTH the extension and the file type, so an .html or .svg file
// can't be disguised as an image.
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only JPG, PNG, WEBP, AVIF or GIF images are allowed'), false)
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

export default upload