import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../components/CartContext.jsx'
import api from '../api/client.js'
import { ASSET_BASE_URL } from '../utils/apiBase.js'
import '../assets/styles/Products.css'

const PRODUCT_TYPES = ['Bestseller', 'New', 'Sale', 'Organic']

const resolveImageUrl = (image) => {
  if (!image) return '/placeholder.png'
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image
  }
  if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
  return `${ASSET_BASE_URL}/${image}`
}

function Products() {
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [maxPrice, setMaxPrice] = useState(500)
  const [activeType, setActiveType] = useState(null)
  const [sort, setSort] = useState('Featured')
  const searchQuery = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'

  // Fetch products from backend API
  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await api.get('/products')
        if (cancelled) return

        const fetchedProducts = Array.isArray(data) ? data : data.products || []
        setProducts(fetchedProducts)

        if (fetchedProducts.length > 0) {
          const highestPrice = Math.max(...fetchedProducts.map((p) => p.price || 0))
          setMaxPrice(Math.ceil(highestPrice) || 500)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load products')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      cancelled = true
    }
  }, [])

  // Dynamically extract unique categories from products fetched from the database
  const categories = useMemo(() => {
    const extractedCategories = new Set()
    products.forEach((p) => {
      if (p.category) {
        extractedCategories.add(p.category)
      }
    })
    return ['All', ...Array.from(extractedCategories)]
  }, [products])

  // Count products per category dynamically
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length }
    categories.slice(1).forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length
    })
    return counts
  }, [products, categories])

  // Price calculation helpers
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 500
    return Math.ceil(Math.max(...products.map((p) => p.price || 0)))
  }, [products])

  const priceCaps = useMemo(() => {
    const step = maxProductPrice / 4
    return [
      Math.round(step * 1),
      Math.round(step * 2),
      Math.round(step * 3),
      maxProductPrice
    ]
  }, [maxProductPrice])

  // Filter and sort products
  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    let list = products.filter((p) => (p.price || 0) <= maxPrice)

    if (normalizedQuery) {
      list = list.filter((p) => {
        const searchableText = [p.name, p.brand, p.category, ...(Array.isArray(p.tags) ? p.tags : [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchableText.includes(normalizedQuery)
      })
    }

    if (category !== 'All') {
      list = list.filter((p) => p.category === category)
    }

    if (activeType) {
      list = list.filter((p) => Array.isArray(p.tags) && p.tags.includes(activeType))
    }

    if (sort === 'Price: Low to High') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sort === 'Price: High to Low') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sort === 'Top Rated') {
      list = [...list].sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    }

    return list
  }, [products, category, maxPrice, activeType, sort, searchQuery])

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  return (
    <div className="products-page">
      <div className="products-banner">
        <div>
          <p className="products-eyebrow">OUR CATALOG</p>
          <h1>Health &amp; Wellness Products</h1>
          <p className="products-sub">
            {products.length}+ certified products from trusted brands
          </p>
          <p className="products-image-hint">Tap a product image to view its details.</p>
        </div>
        <div className="products-stock">
          <span className="stock-dot"></span>
          In stock &amp; ready to ship
        </div>
      </div>

      <div className="products-body">
        <aside className="products-filters">
          <div className="filter-block">
            <p className="filter-heading">CATEGORY</p>
            <ul className="filter-list">
              {categories.map((c) => (
                <li key={c}>
                  <button
                    className={category === c ? 'active' : ''}
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams)
                      if (c === 'All') nextParams.delete('category')
                      else nextParams.set('category', c)
                      setSearchParams(nextParams)
                    }}
                  >
                    <span>{c}</span>
                    <span className="filter-count">{categoryCounts[c] || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-block">
            <p className="filter-heading">PRICE RANGE</p>
            <div className="price-range-labels">
              <span>DH 0</span>
              <span>DH {maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxProductPrice}
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-caps">
              {priceCaps.map((cap) => (
                <button
                  key={cap}
                  className={maxPrice === cap ? 'active' : ''}
                  onClick={() => setMaxPrice(cap)}
                >
                  ≤ DH {cap}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <p className="filter-heading">PRODUCT TYPE</p>
            <div className="type-pills">
              {PRODUCT_TYPES.map((t) => (
                <button
                  key={t}
                  className={activeType === t ? 'active' : ''}
                  onClick={() => setActiveType(activeType === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-toolbar">
            <p>
              <strong>{filtered.length}</strong> products
              {searchQuery && <span className="search-summary"> for “{searchQuery}”</span>}
            </p>
            {searchQuery && (
              <button type="button" className="clear-search" onClick={clearSearch}>
                Clear search
              </button>
            )}
            <label className="sort-select">
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="muted-text" style={{ padding: '20px 0' }}>Loading catalog...</p>
          ) : error ? (
            <p className="error-text" style={{ padding: '20px 0' }}>{error}</p>
          ) : (
            <div className="products-grid">
              {filtered.map((p) => {
                const tags = Array.isArray(p.tags) ? p.tags : []
                const id = p._id || p.id

                return (
                  <div className="product-card" key={id}>
                    <div className="product-image">
                      {Number(p.stock) <= 0 ? (
                        <span className="badge badge-out-of-stock">OUT OF STOCK</span>
                      ) : tags.includes('Bestseller') && (
                        <span className="badge badge-bestseller">BESTSELLER</span>
                      )}
                      {Number(p.stock) > 0 && p.oldPrice && p.oldPrice > p.price && (
                        <span className="badge badge-discount">
                          -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                        </span>
                      )}
                      <Link to={`/products/${id}`} className="product-image-link" aria-label={`View details for ${p.name}`}>
                        <img src={resolveImageUrl(p.image)} alt={p.name} />
                      </Link>
                    </div>
                    <div className="product-info">
                      <p className="product-brand">{p.brand || 'Eco&Bio'}</p>
                      <p className="product-name">{p.name}</p>
                      {p.category && <p className="muted-text" style={{ fontSize: '0.8rem', margin: '2px 0' }}>{p.category}</p>}
                      <div className="product-rating">
                        {'★'.repeat(p.rating || 5)}
                        <span className="reviews-count">({p.reviews || 0})</span>
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          <span className="price-current">
                            DH {(p.price || 0).toFixed(2)}
                          </span>
                          {p.oldPrice && p.oldPrice > p.price && (
                            <span className="price-old">
                              DH {p.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="product-actions">
                          <button className="add-btn" disabled={Number(p.stock) <= 0} onClick={() => addToCart(p)}>
                            <i className="fa-solid fa-cart-shopping"></i> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="no-results">No products match these filters.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default Products