import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../api/AuthContext.jsx'
import { useCart } from '../components/CartContext.jsx'
import { useWishlist, wishlistAuthState } from '../components/WishlistContext.jsx'
import WishlistButton from '../components/WishlistButton.jsx'
import { resolveImageUrl } from '../utils/imageUrl.js'
import '../assets/styles/Community.css'

function Wishlist() {
    const { user, loading: authLoading } = useAuth()
    const { items, loading, refresh } = useWishlist()
    const { addToCart } = useCart()
    const signedIn = Boolean(user)

    // always show fresh, fully populated products when the page opens
    useEffect(() => {
        if (signedIn) refresh()
    }, [signedIn, refresh])

    if (authLoading) {
        return <main className="community-page"><p className="cm-muted">Loading…</p></main>
    }

    if (!signedIn) {
        return (
            <main className="community-page">
                <div className="cm-empty">
                    <i className="fa-regular fa-heart cm-empty-icon"></i>
                    <h1>Your wishlist</h1>
                    <p>Create a free account to save the products you love and find them again on any device.</p>
                    <div className="cm-empty-actions">
                        <Link className="cm-btn" to="/account" state={wishlistAuthState('/wishlist')}>
                            Create an account
                        </Link>
                        <Link
                            className="cm-btn ghost"
                            to="/account"
                            state={{ ...wishlistAuthState('/wishlist'), mode: 'login' }}
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    const firstName = (user.name || '').split(' ')[0]

    return (
        <main className="community-page">
            <header className="cm-header">
                <span className="cm-eyebrow">Saved for later</span>
                <h1>{firstName ? `${firstName}'s wishlist` : 'Your wishlist'}</h1>
                <p className="cm-muted">
                    {items.length === 0
                        ? 'Nothing here yet.'
                        : `${items.length} saved product${items.length > 1 ? 's' : ''}`}
                </p>
            </header>

            {loading && items.length === 0 ? (
                <p className="cm-muted">Loading your wishlist…</p>
            ) : items.length === 0 ? (
                <div className="cm-empty">
                    <i className="fa-regular fa-heart cm-empty-icon"></i>
                    <h2>Tap the heart on any product to save it here</h2>
                    <div className="cm-empty-actions">
                        <Link className="cm-btn" to="/products">Browse products</Link>
                    </div>
                </div>
            ) : (
                <div className="wl-grid">
                    {items.map((product) => {
                        const id = product._id || product.id
                        const inStock = Number(product.stock) > 0
                        return (
                            <article className="wl-card" key={id}>
                                <div className="wl-image">
                                    <Link to={`/products/${id}`}>
                                        <img src={resolveImageUrl(product.image)} alt={product.name} loading="lazy" />
                                    </Link>
                                    <WishlistButton product={product} />
                                    {!inStock && <span className="wl-stock">Out of stock</span>}
                                </div>
                                <div className="wl-body">
                                    {product.brand && <span className="wl-brand">{product.brand}</span>}
                                    <Link to={`/products/${id}`} className="wl-name">{product.name}</Link>
                                    <span className="wl-price">DH {Number(product.price || 0).toFixed(2)}</span>
                                    <button
                                        type="button"
                                        className="cm-btn wl-add"
                                        disabled={!inStock}
                                        onClick={() => addToCart(product)}
                                    >
                                        <i className="fa-solid fa-cart-shopping"></i> {inStock ? 'Add to cart' : 'Unavailable'}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default Wishlist
