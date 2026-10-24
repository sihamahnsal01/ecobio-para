import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import '../app.css'
import headerLogo from '/headerLogo.png'
import Mood from './theme'
import { useCart } from './CartContext.jsx'
import CartPanel from './CartPanel.jsx'
import storeDetails from '../data/storeDetails.json'
import { useAuth } from '../api/AuthContext.jsx'
import { useWishlist } from './WishlistContext.jsx'

const initialsOf = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { cartCount, setIsCartOpen } = useCart()
  const { user } = useAuth()
  const { wishlistCount } = useWishlist()
  const location = useLocation()
  const searchInput = useRef(null)
  const navigate = useNavigate()

  // Sync state with URL parameter without triggering redundant re-renders
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search') || ''
    setSearch((prev) => (prev !== query ? query : prev))
  }, [location.search])

  // Stop the page behind the slide-out menu from scrolling (phones / tablets).
  useEffect(() => {
    if (!menuOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  // The magnifier submits when there is text; on phones it first opens the search bar.
  const onSearchIcon = () => {
    if (search.trim() && isSearchOpen) {
      submitSearch(new Event('submit'))
      return
    }
    setIsSearchOpen(true)
    setTimeout(() => searchInput.current?.focus(), 30)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
    setIsSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <>
      <header className="site-header">
        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </button>

        <Link to="/" className="logo-link" onClick={closeMenu} aria-label={`${storeDetails.name} – home`}>
          <img className="logo" src={headerLogo} alt={storeDetails.name} />
        </Link>

        <nav className={menuOpen ? "open" : ""} aria-label="Main">
          <ul>
            <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
            <li><NavLink to="/products" onClick={closeMenu}>Products</NavLink></li>
            <li><NavLink to="/services" onClick={closeMenu}>Services</NavLink></li>
            <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
            <li><NavLink to="/AboutUs" onClick={closeMenu}>About Us</NavLink></li>
            <li className="nav-account"><NavLink to="/account" onClick={closeMenu}>{user ? 'My account' : 'Sign in'}</NavLink></li>
            <li className="nav-account"><NavLink to="/account/wishlist" onClick={closeMenu}>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</NavLink></li>
          </ul>
        </nav>

        <section>
        <form 
          className={`divInput${isSearchOpen ? ' expanded' : ''}`} 
          onSubmit={submitSearch} 
          role="search"
        >
            <button type="button" className="search-icon" onClick={onSearchIcon} aria-label="Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            <input 
              ref={searchInput}
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
          <button type="button" className="divOrder" onClick={() => setIsCartOpen(true)} aria-label={`Open cart (${cartCount || 0} items)`}>
            <span id="numberOrder" key={cartCount || 0}>{cartCount || 0}</span>
            <i className="fa-solid fa-bag-shopping"></i>
          </button>

          <Link to="/account/wishlist" className="divWish" aria-label="My wishlist" title="My wishlist">
            <i className="fa-regular fa-heart"></i>
            {wishlistCount > 0 && <span className="hdr-count">{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
          </Link>

          <NavLink
            to="/account"
            className="divAccount"
            aria-label={user ? `My account (${user.name})` : 'Sign in'}
            title={user ? 'My account' : 'Sign in / Create account'}
          >
            {user
              ? <span className="hdr-avatar">{initialsOf(user.name)}</span>
              : <i className="fa-regular fa-user"></i>}
          </NavLink>

          <Mood />
        </section>
      </header>

      {/* tap outside the slide-out menu to close it */}
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />}

      {/* Slide-out cart panel component */}
      <CartPanel />
    </>
  )
}

export default Header