import { useState } from 'react'
import api from '../api/client.js'
import '../styles/ProductEditor.css'

// 'New', 'Bestseller', and 'Sale' are computed automatically by the
// backend (age, real sales, and stock level) and can't be set here —
// see back/controllers/productController.js. Organic is the only tag
// left for an admin to set, since it's a real product attribute.
const TAG_OPTIONS = ['Organic']

// Point to your backend API server (adjust origin if different from localhost:5000)
const API_BASE_URL = 'http://localhost:5000'

const emptyProduct = {
  name: '',
  brand: '',
  category: '',
  price: '',
  oldPrice: '',
  stock: '',
  image: '',
  tags: [],
  description: '',
  benefits: [],
  format: '',
  packSize: '',
  dosage: '',
  reference: '',
}

function ProductEditor({ product, categories, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(() => {
    if (!product) return { ...emptyProduct, benefitsText: '' }
    return {
      ...emptyProduct,
      ...product,
      price: product.price !== undefined && product.price !== null ? String(product.price) : '',
      oldPrice: product.oldPrice !== undefined && product.oldPrice !== null ? String(product.oldPrice) : '',
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
      benefitsText: Array.isArray(product.benefits) ? product.benefits.join('\n') : '',
    }
  })

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  // Helper to resolve relative image URLs to the full server URL
  const getImageSrc = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      // Expecting response: { url: '/uploads/filename.ext' } or full http URL
      const res = await api.uploadFile(file)
      const imageUrl = res.url || res.image || res.filePath
      if (!imageUrl) throw new Error('File upload succeeded but no URL was returned.')
      set('image', imageUrl)
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        oldPrice: form.oldPrice !== '' ? parseFloat(form.oldPrice) : null,
        stock: parseInt(form.stock, 10) || 0,
        benefits: form.benefitsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }
      delete payload.benefitsText

      if (product?._id) {
        await api.put(`/products/${product._id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="drawer-header">
          <h3>{product ? `Edit Product: ${product.name}` : 'Add New Product'}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-body">
          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label>Product Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Brand</label>
              <input value={form.brand} onChange={(e) => set('brand', e.target.value)} required />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
                <option value="" disabled>
                  Select…
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <p className="section-heading">Product Information</p>
          <div className="field-row">
            <div className="field">
              <label>Format</label>
              <input
                placeholder="e.g. Tablets, Cream, Spray"
                value={form.format}
                onChange={(e) => set('format', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Pack Size</label>
              <input
                placeholder="e.g. 60 tablets"
                value={form.packSize}
                onChange={(e) => set('packSize', e.target.value)}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Dosage</label>
              <input
                placeholder="e.g. 1000 mg"
                value={form.dosage}
                onChange={(e) => set('dosage', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Reference (SKU)</label>
              <input
                placeholder="e.g. VIT-C-1000"
                value={form.reference}
                onChange={(e) => set('reference', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Benefits (one per line)</label>
            <textarea
              rows={3}
              placeholder={'Supports the immune system\nHelps reduce fatigue\nAntioxidant properties'}
              value={form.benefitsText}
              onChange={(e) => set('benefitsText', e.target.value)}
            />
          </div>

          <p className="section-heading">Pricing &amp; Stock</p>
          <div className="field-row">
            <div className="field">
              <label>Price (DH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Old Price (optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              required
            />
          </div>

          <p className="section-heading">Tags</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '-4px', marginBottom: '8px' }}>
            'New', 'Bestseller' and 'Sale' show up automatically (age, real orders, and stock level) — nothing to set here for those.
          </p>
          <div className="tags-row">
            {TAG_OPTIONS.map((tag) => (
              <label className="checkbox-row" key={tag}>
                <input type="checkbox" checked={form.tags.includes(tag)} onChange={() => toggleTag(tag)} />
                {tag}
              </label>
            ))}
          </div>

          <p className="section-heading">Product Image</p>
          <div className="gallery-grid">
            {form.image && (
              <div className="gallery-thumb">
                <img
                  src={getImageSrc(form.image)}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <button type="button" onClick={() => set('image', '')}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
          {uploading && <p className="muted-text">Uploading…</p>}
        </div>

        <div className="drawer-footer">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Add New Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductEditor