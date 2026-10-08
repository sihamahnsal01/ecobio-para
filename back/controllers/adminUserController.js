import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

// @route   GET /api/admin-users
// @access  Private/Admin
export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ['admin', 'manager'] } }).select('-password')
  res.json(users)
})

// @route   POST /api/admin-users
// @access  Private/Admin
export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email, and password are required')
  }

  if (role && !['admin', 'manager', 'customer'].includes(role)) {
    res.status(400)
    throw new Error("Role must be 'admin', 'manager', or 'customer'")
  }

  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('A user with this email already exists')
  }

  const user = await User.create({ name, email, password, phone: phone || '', role: role || 'admin' })
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role })
})

// @route   PUT /api/admin-users/promote
// @access  Private/Admin
export const promoteToAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    res.status(400)
    throw new Error('Customer email is required')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(404)
    throw new Error('No account found with this email address')
  }

  user.role = 'admin'
  await user.save()
  res.json({ message: `${user.name} has been promoted to admin`, role: user.role })
})

// Shared guard: refuses to strip admin rights from the last remaining
// admin account, and refuses to let an admin revoke/delete themselves.
// Used by both revokeAdminAccess and deleteAdminUser below.
async function assertNotSelfOrLastAdmin(req, res, targetUser) {
  const isSelf = targetUser._id.toString() === req.user._id.toString()
  if (isSelf) {
    res.status(400)
    throw new Error('You cannot revoke or delete your own admin account while logged in as it')
  }

  if (targetUser.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      res.status(400)
      throw new Error('Cannot remove the last remaining admin account')
    }
  }
}

// @route   PUT /api/admin-users/:id/revoke
// @access  Private/Admin
export const revokeAdminAccess = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await assertNotSelfOrLastAdmin(req, res, user)

  user.role = 'customer'
  await user.save()
  res.json({ message: `Admin access revoked for ${user.name}`, role: user.role })
})

// @route   PUT /api/admin-users/:id
// @access  Private/Admin
export const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Changing your OWN role, or downgrading the last admin's role away
  // from 'admin', goes through the same guard as an explicit revoke.
  const isSelf = user._id.toString() === req.user._id.toString()
  const isDowngradingRole = req.body.role && req.body.role !== user.role
  if (isDowngradingRole && user.role === 'admin') {
    if (isSelf) {
      res.status(400)
      throw new Error('You cannot change your own role while logged in as this account')
    }
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      res.status(400)
      throw new Error('Cannot remove the last remaining admin account')
    }
  }

  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  user.phone = req.body.phone !== undefined ? req.body.phone : user.phone
  if (req.body.role) {
    user.role = req.body.role
  }

  const updatedUser = await user.save()
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role
  })
})

// @route   DELETE /api/admin-users/:id
// @access  Private/Admin
export const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await assertNotSelfOrLastAdmin(req, res, user)

  await user.deleteOne()
  res.json({ message: 'User deleted successfully' })
})