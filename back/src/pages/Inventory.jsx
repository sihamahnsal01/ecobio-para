import { useEffect, useState, useMemo } from 'react'
import api from '../api/client.js'
import ProductsTabs from '../components/ProductsTabs.jsx'
import '../styles/Products.css'

const LOW_STOCK_THRESHOLD = 10

function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/products')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const lowStockCount = useMemo(() => items.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length, [items])
  const visible = lowStockOnly ? items.filter((p) => p.stock <= LOW_STOCK_THRESHOLD) : items

  const updateStock = async (product, newStock) => {
    const stock = Math.max(0, Number(newStock) || 0)
    setItems((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock } : p)))
    setSavingId(product._id)
    try {
      await api.put(`/products/${product._id}`, { stock })
    } catch (err) {
      setError(err.message)
      load() // revert to server state if the save failed
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="products-admin">
      <ProductsTabs active="inventory" />

      <div className="card filters-card inventory-summary">
        <div>
          <strong>{items.length}</strong> products tracked
        </div>
        <div className={lowStockCount > 0 ? 'low-stock-badge' : 'muted-text'}>
          {lowStockCount > 0 ? `⚠ ${lowStockCount} low on stock (≤ ${LOW_STOCK_THRESHOLD})` : 'No low-stock items'}
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Show low stock only
        </label>
      </div>

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Stock levels</h3>
        </div>

        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Qty.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p._id} className={p.stock <= LOW_STOCK_THRESHOLD ? 'low-stock-row' : ''}>
                  <td className="product-name-cell">
                    <div className="product-thumb">
                      {p.image ? <img src={p.image} alt="" /> : <i className="fa-solid fa-image"></i>}
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.price.toFixed(2)} DH</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="stock-input"
                      value={p.stock}
                      onChange={(e) => updateStock(p, e.target.value)}
                    />
                  </td>
                  <td>{savingId === p._id && <span className="muted-text">Saving…</span>}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    {lowStockOnly ? 'No low-stock products right now.' : 'No products found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Inventory