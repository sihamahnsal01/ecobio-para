import api from '../api/client.js'
import { detectCountry } from './country.js'

const SESSION_KEY = 'ecobio_visit_tracked'

// Sends ONE anonymous visit ping per browser session so the backend can build
// "visitors by country" statistics. No cookie, no personal data, fails silently.
export function trackVisit(user) {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return
  }

  api
    .post('/stats/visit', {
      country: detectCountry(user),
      path: window.location.pathname,
      language: navigator.language || '',
    })
    .catch(() => {})
}
