import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import ProductEditor from '../components/ProductEditor.jsx'
import ProductsTabs from '../components/ProductsTabs.jsx'
import '../styles/Products.css'

function Products() {
  const { can } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(new Set())
  const [editing, setEditing] = useState(null) // product being edited, or 'new'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173/products'

  useEffect(() => {
    api.get('/categories').then((data) => setCategories(data.map((c) => c.name))).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/products/admin', { search, category: category !== 'All' ? category : undefined })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, category])

  useEffect(() => {
    load()
  }, [load])

  // /products/new opens straight into the "add product" editor
  useEffect(() => {
    if (location.pathname === '/products/new') setEditing('new')
  }, [location.pathname])

  const closeEditor = () => {
    setEditing(null)
    if (location.pathname === '/products/new') navigate('/products')
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSaved = () => {
    closeEditor()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.del(`/products/${id}`)
    load()
  }

  const togglePublication = async (product) => {
    try {
      const updated = await api.patch(`/products/${product._id}/publish`, { isPublished: !product.isPublished })
      setItems((previous) => previous.map((item) => item._id === updated._id ? updated : item))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="products-admin">
      <div className="products-toolbar-row">
        <ProductsTabs active="all" />
        <div className="products-toolbar-actions">
          <a className="btn btn-secondary" href={storefrontUrl} target="_blank" rel="noreferrer">
            <i className="fa-solid fa-store"></i> View Storefront
          </a>
          {can('manageProducts') && (
            <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
              <i className="fa-solid fa-plus"></i> Add New Product
            </button>
          )}
        </div>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <div className="field" style={{ flex: 2 }}>
            <label>Product name</label>
            <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Products</h3>
          <span className="muted-text">{items.length} total</span>
        </div>

        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Qty.</th>
                <th>Store Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} />
                  </td>
                  <td className="product-name-cell">
                    <div className="product-thumb">
                      {p.image ? <img src={p.image} alt="" /> : <i className="fa-solid fa-image"></i>}
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.price.toFixed(2)} DH</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`publish-status ${p.isPublished ? 'live' : 'draft'}`}>
                      {p.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="product-row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => togglePublication(p)}>
                        <i className={`fa-solid ${p.isPublished ? 'fa-eye-slash' : 'fa-arrow-up-from-bracket'}`}></i>
                        {p.isPublished ? 'Unpublish' : 'Push to Store'}
                      </button>
                      <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    No products match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={closeEditor}
          onSaved={handleSaved}
          onDelete={editing !== 'new' ? () => handleDelete(editing._id) : undefined}
        />
      )}
    </div>
  )
}

export default Products