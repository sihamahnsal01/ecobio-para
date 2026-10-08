const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('pp_admin_token')

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_URL}${path}`
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString()
    if (qs) url += `?${qs}`
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data
}

// Separate from request() because file uploads use multipart/form-data,
// not JSON — the browser needs to set its own Content-Type (with the
// multipart boundary), so we must NOT set 'Content-Type' ourselves here.
async function uploadFile(file) {
  const formData = new FormData()
  formData.append('image', file)

  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = data?.message || `Upload failed with status ${res.status}`
    throw new Error(message)
  }

  return data // { url }
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  uploadFile,
}

export default api