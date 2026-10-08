// Single source of truth for the server's base URL, used to build
// image/asset URLs (e.g. "/uploads/foo.jpg" -> full URL).
//
// api/client.js's API_URL points at .../api for JSON requests. Static
// files (uploads) are served from the server ROOT, not under /api, so
// this strips a trailing /api. Both read the same VITE_API_URL env
// var, so set that once in your .env / hosting config and both the
// API calls and the images will point at the right server.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const ASSET_BASE_URL = API_URL.replace(/\/api\/?$/, '')