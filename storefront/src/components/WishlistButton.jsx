import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWishlist, wishlistAuthState } from './WishlistContext.jsx'
import '../assets/styles/Community.css'

// Heart button for any product card. Visitors without an account are sent to
// the "create account" screen and come back to the same page afterwards.
function WishlistButton({ product, className = '' }) {
    const { isWishlisted, toggleWishlist } = useWishlist()
    const navigate = useNavigate()
    const location = useLocation()
    const [busy, setBusy] = useState(false)
    const active = isWishlisted(product)

    const handleClick = async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (busy) return
        setBusy(true)
        const result = await toggleWishlist(product)
        setBusy(false)
        if (result?.reason === 'auth') {
            navigate('/account', { state: wishlistAuthState(location.pathname + location.search) })
        }
    }

    return (
        <button
            type="button"
            className={`wishlist-heart${active ? ' active' : ''} ${className}`.trim()}
            onClick={handleClick}
            aria-pressed={active}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
            title={active ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <i className={`${active ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
    )
}

export default WishlistButton
