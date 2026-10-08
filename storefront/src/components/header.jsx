import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import '../app.css'
import headerLogo from '/headerLogo.png'
import Mood from './theme'
import { useCart } from './CartContext.jsx'
import CartPanel from './CartPanel.jsx'
import storeDetails from '../data/storeDetails.json'

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { cartCount, setIsCartOpen } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  // Sync state with URL parameter without triggering redundant re-renders
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search') || ''
    setSearch((prev) => (prev !== query ? query : prev))
  }, [location.search])

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
    setIsSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <>
      <header>
        <img className="logo" src={headerLogo} alt={storeDetails.name} />

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </div>

        <nav className={menuOpen ? "open" : ""}>
          <ul>
            <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink></li>
            <li><NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink></li>
            <li><NavLink to="/AboutUs" onClick={() => setMenuOpen(false)}>About Us</NavLink></li>
          </ul>
        </nav>

        <section>
        <form 
          className={`divInput${isSearchOpen ? ' expanded' : ''}`} 
          onSubmit={submitSearch} 
          role="search"
        >
            <i 
              className="fa-solid fa-magnifying-glass" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            ></i>
            <input 
              placeholder="Search Products..." 
              aria-label="Search products" 
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                // Timeout allows submit or click events to finish before closing
                setTimeout(() => setIsSearchOpen(false), 200)
              }}
            />
          </form>

          {/* Clicking here opens the cart */}
          <div className="divOrder" onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer' }}>
            <span id="numberOrder" key={cartCount || 0}>{cartCount || 0}</span>
            <i className="fa-solid fa-bag-shopping"></i>
          </div>

          <Mood />
        </section>
      </header>

      {/* Slide-out cart panel component */}
      <CartPanel />
    </>
  )
}

export default Header