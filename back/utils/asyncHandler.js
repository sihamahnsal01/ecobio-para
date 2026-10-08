// Wraps an async route handler so any thrown error / rejected promise
// is passed to next(err) automatically, instead of needing try/catch
// in every controller function.
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

export default asyncHandler
