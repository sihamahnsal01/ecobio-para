// Catches requests to routes that don't exist.
export function notFound(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`)
    res.status(404)
    next(error)
}

// Central error handler. Any `next(err)` call, or a thrown error inside
// an async route wrapped in try/catch, ends up here.
export function errorHandler(err, req, res, next) {
    // Mongoose bad ObjectId
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    // Errors thrown by our own helpers (utils/httpError.js) carry their status.
    if (err.isHttpError) {
        statusCode = err.statusCode
    }

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404
        message = 'Resource not found'
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(', ')
    }

    // Duplicate key (e.g. email already registered)
    if (err.code === 11000) {
        statusCode = 400
        const field = Object.keys(err.keyValue || {})[0]
        message = `${field} already in use`
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
}
