// Run from the back/ folder:
//   node utils/checkAuth.js                 -> checks .env, MongoDB, admin accounts, and a test token
//   node utils/checkAuth.js <token>         -> also explains why a REAL token from the browser is rejected
// (get the token in the admin app's DevTools console:  localStorage.getItem('pp_admin_token'))
// Prints reasons only – never your secret.
import 'dotenv/config'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const ok = (msg) => console.log(`  OK    ${msg}`)
const bad = (msg) => console.log(`  FAIL  ${msg}`)
const info = (msg) => console.log(`        ${msg}`)

const secret = process.env.JWT_SECRET
const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
const browserToken = process.argv[2]

console.log('\n1) Environment')
if (secret) ok(`JWT_SECRET is set (${secret.length} characters)`)
else bad('JWT_SECRET is empty or missing -> every login/verify fails')
if (/^\d+$/.test(String(expiresIn))) bad(`JWT_EXPIRES_IN="${expiresIn}" is a bare number = milliseconds! Use 7d`)
else ok(`JWT_EXPIRES_IN="${expiresIn}"`)

console.log('\n2) MongoDB')
try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    ok(`connected to database "${mongoose.connection.name}"`)
} catch (err) {
    bad(`cannot connect: ${err.message}`)
    info('The API cannot check any token without the database -> 401 on everything. Start MongoDB / check MONGO_URI.')
    process.exit(1)
}

console.log('\n3) Staff accounts')
const staff = await User.find({ role: { $in: ['admin', 'manager'] } }).select('name email role')
if (staff.length === 0) bad('no admin/manager user in this database (run: npm run seed)')
staff.forEach((u) => ok(`${u.role.padEnd(8)} ${u.email}`))

if (secret && staff[0]) {
    console.log('\n4) Fresh token round-trip (what a new login produces)')
    try {
        const t = jwt.sign({ id: staff[0]._id }, secret, { expiresIn })
        const decoded = jwt.verify(t, secret)
        const found = await User.findById(decoded.id)
        found ? ok('sign -> verify -> user lookup works. A NEW login will be accepted.') : bad('user lookup failed')
    } catch (err) {
        bad(`${err.name}: ${err.message}`)
    }
}

if (browserToken) {
    console.log('\n5) The token from your browser')
    try {
        const decoded = jwt.verify(browserToken, secret)
        const found = await User.findById(decoded.id)
        found
            ? ok(`valid, belongs to ${found.email}. If the app still shows 401, the problem is elsewhere.`)
            : bad('signature is fine, but that user no longer exists in THIS database (different DB than when you logged in?)')
    } catch (err) {
        if (err.name === 'TokenExpiredError') bad('token EXPIRED -> just log in again')
        else if (err.message === 'invalid signature') bad('token was signed with a DIFFERENT JWT_SECRET (the .env changed since you logged in) -> log in again')
        else bad(`${err.name}: ${err.message}`)
    }
}

console.log('')
await mongoose.disconnect()
