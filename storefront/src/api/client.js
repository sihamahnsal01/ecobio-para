const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CUSTOMER_TOKEN_KEY = 'eco_bio_customer_token'
async function request(path, { method = 'GET', body, params } = {}) {
  
  let url = `${API_URL}${path}`

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== null)
    ).toString()

    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem(CUSTOMER_TOKEN_KEY)
        ? { Authorization: `Bearer ${localStorage.getItem(CUSTOMER_TOKEN_KEY)}` }
        : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON payload
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

export default api
