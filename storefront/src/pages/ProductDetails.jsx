import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../components/CartContext.jsx'
import { useWishlist, wishlistAuthState } from '../components/WishlistContext.jsx'
import ReviewSection from '../components/ReviewSection.jsx'
import api from '../api/client.js'
import { ASSET_BASE_URL } from '../utils/apiBase.js'
import '../assets/styles/ProductDetails.css'

const resolveImageUrl = (image) => {
  if (!image) return '/placeholder.png'
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image
  }

  if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
  return `${ASSET_BASE_URL}/${image}`
}

const normalizeName = (value = '') =>
  value
    .toLowerCase()
    .replace(/\s*[-–—:()\[\]{}]+\s*/g, ' ')
    .replace(/\b(ml|mg|g|l|oz|pack|capsule|capsules|serum|cream|oil|drops|vitamin|probiotic|spray|formula)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getSizeLabel = (item = {}) => {
  const direct = item.volume || item.size || item.variant || item.package || item.capacity
  if (direct) return String(direct)

  const match = (item.name || '').match(/\b\d+(?:\.\d+)?\s*(?:ml|g|l|mg|oz)\b/i)
  return match ? match[0] : ''
}

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      setLoading(true)
      setError('')

      try {
        const [productData, productsData] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products')
        ])

        if (!isMounted) return
        setProduct(productData)
        setAllProducts(Array.isArray(productsData) ? productsData : [])
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Product not found')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    setQuantity(1)
  }, [id])

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return []

    const currentName = normalizeName(product.name)
    const currentBrand = (product.brand || '').toLowerCase()
    const currentCategory = (product.category || '').toLowerCase()

    const sameNameVariants = allProducts.filter((item) => {
      if (item._id === product._id) return false
      return normalizeName(item.name) === currentName && (item.brand || '').toLowerCase() === currentBrand
    })

    const candidateList = sameNameVariants.length > 0
      ? sameNameVariants
      : allProducts.filter((item) => {
          if (item._id === product._id) return false
          const itemBrand = (item.brand || '').toLowerCase()
          const itemCategory = (item.category || '').toLowerCase()
          const sameCategory = itemCategory && currentCategory && itemCategory === currentCategory
          const sameBrand = itemBrand && currentBrand && itemBrand === currentBrand
          return sameCategory || sameBrand
        })

    return candidateList
      .slice()
      .sort((a, b) => Number(b.reviews || 0) - Number(a.reviews || 0))
      .slice(0, 4)
  }, [product, allProducts])

  const variantProducts = useMemo(() => {
    if (!product || !allProducts.length) return []

    const currentName = normalizeName(product.name)
    const currentBrand = (product.brand || '').toLowerCase()

    return allProducts.filter((item) => {
      if (item._id === product._id) return false
      return (
        (item.brand || '').toLowerCase() === currentBrand &&
        normalizeName(item.name).includes(currentName) ||
        normalizeName(item.name) === currentName
      )
    }).slice(0, 3)
  }, [product, allProducts])

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="detail-state">Loading product details...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="detail-state error-state">
          <h2>Product not found</h2>
          <p>{error || 'This item may have been removed or is unavailable.'}</p>
          <Link to="/products" className="detail-secondary">Back to products</Link>
        </div>
      </div>
    )
  }

  const image = resolveImageUrl(product.image)
  const tags = Array.isArray(product.tags) ? product.tags : []
  const benefits = Array.isArray(product.benefits) ? product.benefits : []
  const rating = Number(product.rating) || 5
  const reviewCount = Number(product.reviews) || 0
  const inStock = Number(product.stock) > 0
  const wishlisted = isWishlisted(product)
  const handleWishlist = async () => {
    const result = await toggleWishlist(product)
    if (result?.reason === 'auth') navigate('/account', { state: wishlistAuthState(location.pathname) })
  }

  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price || 0)
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0

  const productInfo = [
    product.format && { label: 'Format', value: product.format },
    product.packSize && { label: 'Quantity', value: product.packSize },
    product.dosage && { label: 'Dosage', value: product.dosage },
    { label: 'Brand', value: product.brand || 'Eco&Bio' },
    product.reference && { label: 'Reference', value: product.reference },
    { label: 'Availability', value: inStock ? 'In stock' : 'Out of stock' },
  ].filter(Boolean)

  return (
    <div className="product-detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-card">
        <div className="detail-image-wrap">
          {hasDiscount && <span className="detail-discount-badge">-{discountPercent}%</span>}
          <img src={image} alt={product.name} />
        </div>

        <div className="detail-info">
          <span className="detail-brand">{product.brand || 'Eco&Bio'}</span>
          <h1>{product.name}</h1>

          <div className="detail-rating">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={index < rating ? 'filled' : ''}>★</span>
            ))}
            <span className="detail-review-count">({reviewCount}) reviews</span>
          </div>

          <div className="detail-price-row">
            <div className="detail-price-block">
              <span className="current-price">DH {Number(product.price || 0).toFixed(2)}</span>
              {hasDiscount && (
                <span className="old-price">DH {Number(product.oldPrice).toFixed(2)}</span>
              )}
            </div>
            <span className="detail-stock">{inStock ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <p className="detail-description">
            {product.description || 'A carefully selected wellness product designed to support your daily routine and overall wellbeing.'}
          </p>

          {benefits.length > 0 && (
            <div className="detail-benefits">
              <h3>Benefits</h3>
              <ul>
                {benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {productInfo.length > 0 && (
            <div className="detail-product-info">
              <h3>Product information</h3>
              <ul>
                {productInfo.map((row) => (
                  <li key={row.label}>
                    <span className="info-label">{row.label}:</span>
                    <span className="info-value">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="detail-tags">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="detail-tag">{tag}</span>
              ))
            ) : (
              <span className="detail-tag">Wellness</span>
            )}
          </div>

          <div className="detail-quantity-row">
            <span className="detail-quantity-label">Quantity:</span>
            <div className="detail-qty-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(Number(product.stock) || 1, q + 1))}
                disabled={quantity >= Number(product.stock)}
              >
                +
              </button>
            </div>
          </div>

          <div className="detail-actions">
            <button className="detail-btn primary" disabled={!inStock} onClick={() => addToCart(product, quantity)}>
              {inStock ? '🛒 Add to cart' : 'Out of stock'}
            </button>
            <button
              type="button"
              className={`detail-btn wishlist${wishlisted ? ' active' : ''}`}
              onClick={handleWishlist}
            >
              {wishlisted ? '❤️ In wishlist' : '🤍 Add to wishlist'}
            </button>
          </div>
        </div>
      </div>
             <ReviewSection productId={product._id} />
      {(variantProducts.length > 0 || relatedProducts.length > 0) && (
        <div className="related-section">
          {variantProducts.length > 0 && (
            <div className="related-block">
              <h3>Available sizes</h3>
              <div className="related-grid">
                {variantProducts.map((item) => (
                  <Link key={item._id || item.id} to={`/products/${item._id || item.id}`} className="related-card">
                    <img src={resolveImageUrl(item.image)} alt={item.name} />
                    <div className="related-card-body">
                      <span>{item.brand}</span>
                      <strong>{item.name}</strong>
                      <small>{getSizeLabel(item) || item.category}</small>
                      <b>DH {Number(item.price || 0).toFixed(2)}</b>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedProducts.length > 0 && (
            <div className="related-block">
              <h3>You may also like</h3>
              <div className="related-grid">
                {relatedProducts.map((item) => (
                  <Link key={item._id || item.id} to={`/products/${item._id || item.id}`} className="related-card">
                    <img src={resolveImageUrl(item.image)} alt={item.name} />
                    <div className="related-card-body">
                      <span>{item.brand}</span>
                      <strong>{item.name}</strong>
                      <small>{item.category}</small>
                      <b>DH {Number(item.price || 0).toFixed(2)}</b>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductDetails