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

// @route  PUT /api/auth/me
// @access Private
// Lets a logged-in user update their own name, email, and phone.
// Intentionally does NOT allow changing `role` here — that stays
// restricted to the admin-only Admin Users management endpoints.
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, phone, avatar } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    if (email && email !== user.email) {
        const existing = await User.findOne({ email })
        if (existing) {
            res.status(400)
            throw new Error('An account with this email already exists')
        }
        user.email = email
    }

    if (name) user.name = name
    if (phone !== undefined) user.phone = phone
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
    })
})