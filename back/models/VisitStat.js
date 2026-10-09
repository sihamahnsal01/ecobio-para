import mongoose from 'mongoose'

// Anonymous visit counters: one document per (day, country).
// No IP address, no user id, no cookie is stored – only a number.
const visitStatSchema = new mongoose.Schema({
    date: {
        type: String, // 'YYYY-MM-DD' (UTC)
        required: true,
    },
    country: {
        type: String, // ISO 3166-1 alpha-2, or 'ZZ' when unknown
        required: true,
        uppercase: true,
        trim: true,
    },
    visits: {
        type: Number,
        default: 0,
    },
})

visitStatSchema.index({ date: 1, country: 1 }, { unique: true })

export default mongoose.model('VisitStat', visitStatSchema)
