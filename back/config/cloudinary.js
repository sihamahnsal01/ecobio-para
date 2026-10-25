import { v2 as cloudinary } from 'cloudinary'

// Cloudinary is used only when the 3 keys are in .env (or in Render's settings).
// Without them, images are saved in the local "uploads" folder like before.
export function isCloudinaryEnabled() {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
}

let configured = false
function configure() {
    if (configured) return
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    })
    configured = true
}

// Uploads an image (from memory) to Cloudinary, inside ecobio-para/<folder>
export function uploadToCloudinary(buffer, folder) {
    configure()
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `ecobio-para/${folder}`, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
        )
        stream.end(buffer)
    })
}

// Adds automatic format + compression, so images load faster
export function optimizedUrl(url) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/')
}