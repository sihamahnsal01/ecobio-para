import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Verifies the Bearer token on the Authorization header and attaches
// the corresponding user to req.user. Use on any route that requires login.
export async function protect(req, res, next) {
    let token

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user no longer exists' })
        }

        next()
    } catch (err) {
        // Diagnostic: shows the REAL reason in the API terminal
        // (e.g. 'TokenExpiredError jwt expired', 'JsonWebTokenError invalid signature', or a MongoDB error).
        console.error('[auth] token check failed ->', err.name + ':', err.message)
        return res.status(401).json({ message: 'Not authorized, invalid or expired token' })
    }
}

// Use after `protect` on routes that should be admin-only.
export function adminOnly(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next()
    }
    return res.status(403).json({ message: 'Admin access required' })
}
// Use after `protect` on routes that admins AND managers can access.
// Managers get full operational access; only user-management routes
// (adminUserRoutes.js) stay locked to adminOnly.
export function managerOrAdmin(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        return next()
    }
    return res.status(403).json({ message: 'Admin or manager access required' })
}
// Use on routes that work for both guests and logged-in users (e.g.
// submitting a review). If a valid token is present, req.user is set;
// if not, req.user stays undefined and the request still proceeds.
export async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id)
        } catch {
            // invalid/expired token — just proceed as a guest
        }
    }
    next()
}
