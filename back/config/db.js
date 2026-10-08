import mongoose from 'mongoose'

// Connects to MongoDB using the URI in .env (MONGO_URI).
// Called once from server.js on startup.
async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`)
        // Exit the process — there's no point running the API without a DB.
        process.exit(1)
    }
}

export default connectDB
