import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from './CartContext.jsx'
import api from '../api/client.js'
import { ASSET_BASE_URL } from '../utils/apiBase.js'
import '../assets/styles/bestSllers.css'

const resolveImageUrl = (image) => {
    if (!image) return '/placeholder.png'
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
        return image
    }
    if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
    return `${ASSET_BASE_URL}/${image}`
}

function BestSellers() {
    const [liveProducts, setLiveProducts] = useState([])
    const { addToCart } = useCart()

    useEffect(() => {
        let cancelled = false

        const loadProducts = async () => {
            try {
                const tagged = await api.get('/products', { tag: 'Bestseller', sort: 'top_rated' })
                if (Array.isArray(tagged) && tagged.length > 0) {
                    if (!cancelled) setLiveProducts(tagged.slice(0, 8))
                    return
                }

                const sold = await api.get('/products/bestsellers', { limit: 8 })
                if (Array.isArray(sold) && sold.length > 0) {
                    if (!cancelled) setLiveProducts(sold)
                    return
                }

                const catalog = await api.get('/products')
                if (!cancelled && Array.isArray(catalog)) setLiveProducts(catalog.slice(0, 8))
            } catch {
                if (!cancelled) setLiveProducts([])
            }
        }

        loadProducts()
        return () => { cancelled = true }
    }, [])

    return (
        <section className="bestsellers-section">
            <div className="bestsellers-header block={true}">
                <div>
                    <span className="bestsellers-eyebrow">Customer favourites</span>
                    <h2>Bestselling products</h2>
                </div>
                <Link to="/products" className="see-all">
                    See all products <i className="fa-solid fa-arrow-right"></i>
                </Link>
            </div>

            <div className="bestsellers-grid">
                {liveProducts.map((product) => (
                    <div className="product-card block={true}" key={product._id || product.id}>
                        <div className="product-image-wrap">
                            {Number(product.stock) <= 0 ? (
                                <span className="badge-out-of-stock">Out of stock</span>
                            ) : (
                                <span className="badge-bestseller">Bestseller</span>
                            )}
                            {Number(product.stock) > 0 && product.discount && (
                                <span className="badge-discount">{product.discount}</span>
                            )}
                            <Link to={`/products/${product._id || product.id}`}>
                                <img src={resolveImageUrl(product.image)} alt={product.name} />
                            </Link>
                        </div>

                        <div className="product-info">
                            <span className="product-brand">{product.brand}</span>
                            <Link to={`/products/${product._id || product.id}`} className="product-name">
                                {product.name}
                            </Link>

                            <div className="product-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <i
                                        key={i}
                                        className={`fa-solid fa-star ${i < product.rating ? 'filled' : ''}`}
                                    ></i>
                                ))}
                                <span className="review-count">({product.reviews})</span>
                            </div>

                            <div className="product-footer">
                                <div className="product-price">
                                    <span className="price-current">DH{product.price.toFixed(2)}</span>
                                    {product.oldPrice && (
                                        <span className="price-old">DH{product.oldPrice.toFixed(2)}</span>
                                    )}
                                </div>
                                <button className="add-btn" disabled={Number(product.stock) <= 0} onClick={() => addToCart(product)}>
                                    <i className="fa-solid fa-cart-shopping"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default BestSellers