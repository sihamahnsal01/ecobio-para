import rateLimit from 'express-rate-limit'

// Login: max 10 failed attempts per 15 minutes per IP address.
// Successful logins don't count, so real users are never blocked.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
})

// Register: max 5 new accounts per hour per IP address (stops fake account spam).
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many accounts created. Please try again later.' },
})

// Public review photo upload: max 20 images per hour per IP address.
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many uploads. Please try again later.' },
})