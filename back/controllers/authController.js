import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import asyncHandler from '../utils/asyncHandler.js'

// @route  POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Name, email, and password are required')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        res.status(400)
        throw new Error('An account with this email already exists')
    }

    const user = await User.create({ name, email, password, phone })

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    })
})

// @route  POST /api/auth/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error('Email and password are required')
    }

    // password has `select: false` in the schema, so it must be requested explicitly
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
        res.status(401)
        throw new Error('Invalid email or password')
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    })
})

// @route  GET /api/auth/me
// @access Private
export const getProfile = asyncHandler(async (req, res) => {
    // req.user is set by the `protect` middleware
    res.json(req.user)
})

// Shape returned to the storefront for the signed-in customer (never includes the password).
const shapeProfile = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    role: user.role,
    addresses: user.addresses || [],
    createdAt: user.createdAt,
})

const MAX_ADDRESSES = 5
const cleanText = (value, max = 120) => String(value ?? '').trim().slice(0, max)

// @route  PUT /api/auth/me
// @access Private
// Lets a logged-in user update their own name, email, phone, avatar and
// saved delivery addresses.
// Intentionally does NOT allow changing `role` here — that stays
// restricted to the admin-only Admin Users management endpoints.
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, phone, avatar, addresses } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    if (email !== undefined) {
        const nextEmail = String(email).trim().toLowerCase()
        if (!nextEmail) {
            res.status(400)
            throw new Error('Email cannot be empty')
        }
        if (nextEmail !== user.email) {
            const existing = await User.findOne({ email: nextEmail })
            if (existing) {
                res.status(400)
                throw new Error('An account with this email already exists')
            }
            user.email = nextEmail
        }
    }

    if (name !== undefined) {
        const nextName = cleanText(name, 80)
        if (!nextName) {
            res.status(400)
            throw new Error('Name cannot be empty')
        }
        user.name = nextName
    }
    if (phone !== undefined) user.phone = cleanText(phone, 30)
    if (avatar !== undefined) user.avatar = cleanText(avatar, 500)

    if (addresses !== undefined) {
        if (!Array.isArray(addresses)) {
            res.status(400)
            throw new Error('addresses must be a list')
        }
        user.addresses = addresses.slice(0, MAX_ADDRESSES).map((a) => ({
            label: cleanText(a.label, 40) || 'Home',
            street: cleanText(a.street, 160),
            city: cleanText(a.city, 80),
            postalCode: cleanText(a.postalCode, 20),
            country: cleanText(a.country, 60) || 'Morocco',
        }))
    }

    await user.save()

    res.json(shapeProfile(user))
})

// @route  PUT /api/auth/me/password
// @access Private
// Body: { currentPassword, newPassword }
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        res.status(400)
        throw new Error('Current and new password are required')
    }
    if (String(newPassword).length < 6) {
        res.status(400)
        throw new Error('The new password must be at least 6 characters')
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user || !(await user.comparePassword(currentPassword))) {
        res.status(401)
        throw new Error('Your current password is incorrect')
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated' })
})
