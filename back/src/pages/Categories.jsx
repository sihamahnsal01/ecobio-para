import { useEffect, useState } from 'react'
import api from '../api/client.js'
import ProductsTabs from '../components/ProductsTabs.jsx'
import '../styles/Products.css'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    api
      .get('/categories')
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setError('')
    try {
      await api.post('/categories', { name: newName.trim() })
      setNewName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRename = async (category) => {
    const name = prompt('Rename category', category.name)
    if (!name || !name.trim() || name.trim() === category.name) return
    setBusyId(category._id)
    setError('')
    try {
      await api.put(`/categories/${category._id}`, { name: name.trim() })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return
    setBusyId(category._id)
    setError('')
    try {
      await api.del(`/categories/${category._id}`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="products-admin">
      <ProductsTabs active="categories" />

      <form className="card filters-card add-category-form" onSubmit={handleAdd}>
        <div className="field" style={{ flex: 1 }}>
          <label>New category name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Sun Care" />
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa-solid fa-plus"></i> Add Category
        </button>
      </form>

      {error && <p className="error-text" style={{ margin: '0 0 12px' }}>{error}</p>}

      <div className="card products-table-card">
        <div className="card-header products-table-header">
          <h3>Categories</h3>
          <span className="muted-text">{categories.length} total</span>
        </div>

        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.productCount}</td>
                  <td className="category-actions">
                    <button className="btn btn-secondary btn-sm" disabled={busyId === c._id} onClick={() => handleRename(c)}>
                      <i className="fa-solid fa-pen"></i> Rename
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === c._id} onClick={() => handleDelete(c)}>
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted-text" style={{ textAlign: 'center', padding: '24px' }}>
                    No categories yet — add one above.
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

export default Categories