import { ASSET_BASE_URL } from './apiBase.js'

// Turns "/uploads/foo.jpg" (or a bare path) into a full URL on the API server.
export function resolveImageUrl(image, fallback = '/placeholder.png') {
  if (!image) return fallback
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) return image
  if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
  return `${ASSET_BASE_URL}/${image}`
}
