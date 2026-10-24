import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../components/CartContext.jsx'
import { useWishlist } from '../../components/WishlistContext.jsx'
import WishlistButton from '../../components/WishlistButton.jsx'
import { resolveImageUrl } from '../../utils/imageUrl.js'
import { formatPrice } from './accountUtils.js'

function WishlistTab() {
    const { items, loading, refresh } = useWishlist()
    const { addToCart } = useCart()

    // always show fresh, fully populated products when the tab opens
    useEffect(() => { refresh() }, [refresh])

    return (
        <>
            <div className="acc-head">
                <div>
                    <span className="acc-eyebrow">Saved for later</span>
                    <h1>Wishlist</h1>
                    <p className="acc-muted">
                        {items.length === 0 ? 'Nothing saved yet.' : `${items.length} saved product${items.length > 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>

            {loading && items.length === 0 ? (
                <p className="acc-muted">Loading your wishlist…</p>
            ) : items.length === 0 ? (
                <div className="acc-empty">
                    <i className="fa-regular fa-heart"></i>
                    <h2>Tap the heart on any product to save it here</h2>
                    <Link className="acc-btn" to="/products">Browse products</Link>
                </div>
            ) : (
                <div className="wl-grid acc-wl-grid">
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
                                    <span className="wl-price">{formatPrice(product.price)}</span>
                                    <button
                                        type="button"
                                        className="acc-btn small wl-add"
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
        </>
    )
}

export default WishlistTab
