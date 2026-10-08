// An error that carries its own HTTP status code. The central errorHandler
// reads `statusCode` from these, so helpers/utilities can fail with the right
// status without needing access to `res`.
export default class HttpError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        this.isHttpError = true
    }
}
