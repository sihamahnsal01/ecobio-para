import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app.css'
import './assets/styles/tablet.css'
import './assets/styles/mobile.css'
import './assets/styles/darkMood.css'
import './assets/styles/heroBackground.css'
import './assets/styles/motion.css'
import App from './App.jsx'
import { CartProvider } from './components/CartContext.jsx'
import { WishlistProvider } from './components/WishlistContext.jsx'
import { AuthProvider } from './api/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)

// ---- Hide the splash screen (defined in index.html) ----
// Shown for at least MIN_LOADER_MS, and until the page has fully loaded.
// Change MIN_LOADER_MS to make it shorter or longer (milliseconds).
const MIN_LOADER_MS = 2000
const MAX_LOADER_MS = 4000 // safety: never keep users waiting longer than this

const loaderStart = performance.now()
let loaderHidden = false

function hideLoader() {
  if (loaderHidden) return
  loaderHidden = true
  const loader = document.getElementById('app-loader')
  if (!loader) return
  loader.classList.add('hide')
  setTimeout(() => loader.remove(), 700) // after the fade-out finishes
}

function scheduleHide() {
  const elapsed = performance.now() - loaderStart
  setTimeout(hideLoader, Math.max(0, MIN_LOADER_MS - elapsed))
}

if (document.readyState === 'complete') {
  scheduleHide()
} else {
  window.addEventListener('load', scheduleHide, { once: true })
}
setTimeout(hideLoader, MAX_LOADER_MS)
