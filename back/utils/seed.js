// Run with: npm run seed
// Wipes the products collection and repopulates it with sample data
// matching the products shown in Products.jsx, so the frontend has
// real data to fetch from /api/products instead of the hardcoded array.
// Also makes sure one admin user exists so the admin dashboard login
// actually works (register/login endpoints already existed, but nothing
// was ever seeding a user account before this).

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Category from '../models/Category.js'

dotenv.config()

// Override with real values via .env if you don't want these defaults.
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@ecobio-para.ma'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123'

const CATEGORY_NAMES = [
    'Health & Wellness',
    'Beauty & Skincare',
    'Vitamins & Supplements',
    'Baby Care',
    'Herbal & Natural',
    'Personal Care',
]

const products = [
    {
        name: 'Vitamina C 1000mg Integratore', brand: 'NATURAVITA',
        category: 'Vitamins & Supplements', price: 12.99, oldPrice: 15.99,
        rating: 5, reviews: 124, image: '/products/vitamin-c.jpg',
        tags: ['Bestseller', 'Sale'], stock: 80, isPublished: true,
    },
    {
        name: 'Crema Solare SPF 50+ Protezione Alta', brand: 'SOLEMIO',
        category: 'Beauty & Skincare', price: 18.50, oldPrice: null,
        rating: 5, reviews: 89, image: '/products/sunscreen.jpg',
        tags: ['Bestseller'], stock: 60, isPublished: true,
    },
    {
        name: 'Siero Anti-Età Viso Premium', brand: 'DERMALUX',
        category: 'Beauty & Skincare', price: 34.99, oldPrice: 42.00,
        rating: 5, reviews: 312, image: '/products/anti-age-serum.jpg',
        tags: ['Bestseller', 'Sale'], stock: 40, isPublished: true,
    },
    {
        name: 'Omega-3 Olio di Pesce Capsule', brand: 'MAREPURO',
        category: 'Vitamins & Supplements', price: 22.00, oldPrice: null,
        rating: 5, reviews: 198, image: '/products/omega-3.jpg',
        tags: ['Bestseller'], stock: 70, isPublished: true,
    },
    {
        name: 'Probiotici Quotidiani Capsule', brand: 'FLORABENE',
        category: 'Health & Wellness', price: 19.99, oldPrice: null,
        rating: 5, reviews: 267, image: '/products/probiotics.jpg',
        tags: ['Bestseller'], stock: 55, isPublished: true,
    },
    {
        name: 'Multivitamine per Bambini Gommose', brand: 'BIMBOSANO',
        category: 'Baby Care', price: 17.99, oldPrice: null,
        rating: 5, reviews: 334, image: '/products/kids-vitamins.jpg',
        tags: ['Bestseller'], stock: 90, isPublished: true,
    },
    {
        name: 'Siero all\u2019Acido Ialuronico Puro', brand: 'DERMALUX',
        category: 'Beauty & Skincare', price: 28.99, oldPrice: null,
        rating: 5, reviews: 421, image: '/products/hyaluronic-serum.jpg',
        tags: ['Bestseller', 'New'], stock: 35, isPublished: true,
    },
    {
        name: 'Biotina per la Crescita dei Capelli', brand: 'BIOCAPELLI',
        category: 'Herbal & Natural', price: 17.99, oldPrice: null,
        rating: 5, reviews: 289, image: '/products/biotin.jpg',
        tags: ['Bestseller'], stock: 65, isPublished: true,
    },
]

async function run() {
    await connectDB()

    await Product.deleteMany({})
    await Product.insertMany(products)
    console.log(`Seeded ${products.length} products`)

    // Categories are their own collection now — only create the ones that
    // don't already exist, so re-running this doesn't wipe out categories
    // you've since renamed or added from the admin dashboard.
    for (const name of CATEGORY_NAMES) {
        await Category.updateOne({ name }, { name }, { upsert: true })
    }
    console.log(`Ensured ${CATEGORY_NAMES.length} categories exist`)


    // Don't wipe/recreate the admin on every run — just make sure one exists.
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    if (existingAdmin) {
        console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
    } else {
        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // hashed automatically by the User model's pre-save hook
            role: 'admin',
        })
        console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    }

    await mongoose.connection.close()
    process.exit(0)
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
