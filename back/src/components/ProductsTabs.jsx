import { Link } from 'react-router-dom'

function ProductsTabs({ active }) {
  return (
    <div className="tabs-row">
      <Link to="/products" className={`tab${active === 'all' ? ' active' : ''}`}>
        All Products
      </Link>
      <Link to="/products/inventory" className={`tab${active === 'inventory' ? ' active' : ''}`}>
        Inventory
      </Link>
      <Link to="/products/categories" className={`tab${active === 'categories' ? ' active' : ''}`}>
        Categories
      </Link>
    </div>
  )
}

export default ProductsTabs