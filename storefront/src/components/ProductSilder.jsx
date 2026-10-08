import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { ASSET_BASE_URL } from '../utils/apiBase.js'
import '../assets/styles/productSlider.css'

const AUTO_SLIDE_INTERVAL = 5000

const resolveImageUrl = (image) => {
    if (!image) return '/placeholder.png'
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) return image
    if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
    return `${ASSET_BASE_URL}/${image}`
}

function ProductSlider() {
    const [products, setProducts] = useState([])
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        let cancelled = false

        const loadBestSellers = async () => {
            try {
                const tagged = await api.get('/products', { tag: 'Bestseller', sort: 'top_rated' })
                if (Array.isArray(tagged) && tagged.length > 0) {
                    if (!cancelled) setProducts(tagged.slice(0, 6))
                    return
                }

                const sold = await api.get('/products/bestsellers', { limit: 6 })
                if (Array.isArray(sold) && sold.length > 0) {
                    if (!cancelled) setProducts(sold)
                    return
                }

                const catalog = await api.get('/products')
                if (!cancelled) setProducts(Array.isArray(catalog) ? catalog.slice(0, 6) : [])
            } catch {
                try {
                    const data = await api.get('/products')
                    if (!cancelled) setProducts(Array.isArray(data) ? data.slice(0, 6) : [])
                } catch {
                    if (!cancelled) setProducts([])
                }
            }
        }

        loadBestSellers()
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        if (products.length < 2) return undefined
        const timer = setInterval(() => {
            setCurrent((previous) => (previous + 1) % products.length)
        }, AUTO_SLIDE_INTERVAL)

        return () => clearInterval(timer)
    }, [products.length])

    if (products.length === 0) return null

    return (
        <div className="slider-frame">
            <div className="slider-card">
                <div
                    className="slider-track"
                    style={{
                        width: `${products.length * 100}%`,
                        transform: `translateX(-${current * (100 / products.length)}%)`
                    }}
                >
                    {products.map((product) => (
                        <Link
                            className="slider-slide"
                            style={{ width: `${100 / products.length}%` }}
                            key={product._id || product.id}
                            to={`/products/${product._id || product.id}`}
                            aria-label={`View details for ${product.name}`}
                        >
                            <img
                                src={resolveImageUrl(product.image)}
                                alt={product.name}
                                className="slider-bg"
                            />
                            <div className="slider-overlay">
                                <span className={`slider-badge ${Number(product.stock) <= 0 ? 'out-of-stock-label' : ''}`}>
                                    {Number(product.stock) <= 0 ? 'Out of stock' : 'Best seller'}
                                </span>
                                <h3>{product.name}</h3>
                                <p className="slider-price">DH {Number(product.price || 0).toFixed(2)}</p>
                                <ul>
                                    <li>{product.brand || 'Eco&Bio'}</li>
                                    <li>{product.category || 'Wellness'}</li>
                                    {product.qtySold > 0 && <li>{product.qtySold} sold</li>}
                                </ul>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="slider-dots">
                {products.map((product, i) => (
                    <button
                        type="button"
                        key={product._id || product.id}
                        className={`dot ${i === current ? 'active' : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Show ${product.name}`}
                    ></button>
                ))}
            </div>
        </div>
    )
}

export default ProductSlider