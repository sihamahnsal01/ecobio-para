import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import 'dotenv/config'

// Import middleware (file extension .js is REQUIRED in ES Modules)
import { notFound, errorHandler } from './middleware/errorHandler.js'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import adminUserRoutes from './routes/adminUserRoutes.js'
import subscriberRoutes from './routes/subscriberRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import { handleStripeWebhook } from './controllers/orderController.js'
import { startOrderExpirySweeper } from './utils/orderExpiry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
app.set('trust proxy', 1) // needed on Render so image links use https
// --- Database ---
connectDB()
// --- Middleware ---

// Only allow our own websites (listed in CLIENT_ORIGIN in .env) to call the API
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())

  app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
}))

app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)
app.use(express.json())

// Expose the folder where images are saved on disk (e.g., 'uploads' or 'public')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/products', express.static(path.join(__dirname, 'uploads')))

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin-users', adminUserRoutes)
app.use('/api/subscribers', subscriberRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/stats', statsRoutes)

// --- Root Route ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend API is running smoothly!'
    })
})

// --- Error handling (must be last) ---
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cancels unpaid online orders after their payment window and restores their stock.
startOrderExpirySweeper()