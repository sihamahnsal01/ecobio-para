// Run with: npm run migrate-images
// Uploads product images from the local "uploads" folder to Cloudinary and
// updates the products in the ATLAS database with the new permanent links.
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { isCloudinaryEnabled, uploadToCloudinary, optimizedUrl } from '../config/cloudinary.js'

const uri = process.env.ATLAS_MONGO_URI

if (!uri || !uri.startsWith('mongodb+srv://')) {
    console.error('ATLAS_MONGO_URI is missing or is not an Atlas link (mongodb+srv://...). Stopping.')
    process.exit(1)
}
if (!isCloudinaryEnabled()) {
    console.error('Cloudinary keys are missing in .env. Stopping.')
    process.exit(1)
}

const uploadDir = path.join(process.cwd(), 'uploads')

await mongoose.connect(uri)
console.log(`Connected to: ${mongoose.connection.host}\n`)

const products = await Product.find({})
let moved = 0, skipped = 0, missing = 0

for (const product of products) {
    const image = product.image || ''

    if (image.includes('res.cloudinary.com')) {
        skipped++
        continue
    }

    const filename = path.basename(image.split('?')[0])
    const filePath = path.join(uploadDir, filename)

    if (!fs.existsSync(filePath)) {
        console.log(`  MISSING  ${product.name}  (no file "${filename}" in uploads)`)
        missing++
        continue
    }

    const result = await uploadToCloudinary(fs.readFileSync(filePath), 'products')
    const url = optimizedUrl(result.secure_url)
    await Product.updateOne({ _id: product._id }, { $set: { image: url } })
    console.log(`  OK       ${product.name}`)
    moved++
}

console.log(`\nDone: ${moved} moved, ${skipped} already on Cloudinary, ${missing} missing`)
await mongoose.disconnect()