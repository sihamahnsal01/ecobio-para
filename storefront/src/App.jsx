import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './app.css'
import CookieConsent from './components/CookieConsent'
import Header from './components/header'
import Home from './pages/home.jsx'
import Contact from './pages/contact.jsx'
import About from './pages/aboutUs.jsx'
import Products from './pages/products.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Services from './pages/services.jsx'
import Footer from './components/Footer.jsx'
import PrivacyPolicy from './pages/privacy-policy.jsx'
import Account from './pages/Account.jsx'
import Reviews from './pages/Reviews.jsx'
import { trackVisit } from './utils/stats.js'
import MotionEffects from './components/MotionEffects.jsx'
// Responsive rules load after every page/component stylesheet so they win.
import './assets/styles/tablet.css'
import './assets/styles/mobile.css'

function App() {
  useEffect(() => { trackVisit() }, [])

  return (
      <>
        <BrowserRouter>
          <MotionEffects />
          <Header />
          <div className='container1'>
          <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/products' element={<Products />} />
              <Route path='/products/:id' element={<ProductDetails />} />
              <Route path='/services' element={<Services />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/AboutUs' element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/account/*" element={<Account />} />
              <Route path="/reviews" element={<Reviews />} />
              {/* old links keep working */}
              <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
              <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
          </Routes>
          </div>
          <Footer />
          <CookieConsent />
        </BrowserRouter>
      </>
  )
}

export default App
