import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './api/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Products from './pages/Products.jsx'
import Inventory from './pages/Inventory.jsx'
import Categories from './pages/Categories.jsx'
import Customers from './pages/Customers.jsx'
import Settings from './pages/Settings.jsx'
import Reviews from './pages/Reviews.jsx'
import Promotions from './pages/Promotions.jsx'
import Reports from './pages/Reports.jsx'
import Notifications from './pages/Notifications.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import Analytics, {
  AnalyticsSales,
  AnalyticsCustomers,
  AnalyticsProducts,
  AnalyticsCategories,
} from './pages/Analytics.jsx'
import './styles/layout.css'

function AdminLayout({ children, title, actions }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Topbar title={title} actions={actions} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

function Protected({ children, ...layoutProps }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <AdminLayout {...layoutProps}>{children}</AdminLayout>
}
function AdminOnlyRoute({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected title="Dashboard Overview">
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/orders"
        element={
          <Protected title="Orders">
            <Orders />
          </Protected>
        }
      />
      <Route
        path="/products"
        element={
          <Protected title="Products">
            <Products />
          </Protected>
        }
      />
      <Route
        path="/products/new"
        element={
          <Protected title="Add Product">
            <Products />
          </Protected>
        }
      />
      <Route
        path="/products/categories"
        element={
          <Protected title="Product Categories">
            <Categories />
          </Protected>
        }
      />
      <Route
        path="/products/inventory"
        element={
          <Protected title="Inventory">
            <Inventory />
          </Protected>
        }
      />
      <Route
        path="/customers"
        element={
          <Protected title="Customers">
            <Customers />
          </Protected>
        }
      />
      <Route
        path="/reviews"
        element={
          <Protected title="Reviews">
            <Reviews />
          </Protected>
        }
      />
      <Route
        path="/promotions"
        element={
          <Protected title="Promotions">
            <Promotions />
          </Protected>
        }
      />
      <Route
        path="/analytics"
        element={
          <Protected title="Analytics">
            <Analytics />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/analytics/sales" replace />} />
        <Route path="sales" element={<AnalyticsSales />} />
        <Route path="customers" element={<AnalyticsCustomers />} />
        <Route path="products" element={<AnalyticsProducts />} />
        <Route path="categories" element={<AnalyticsCategories />} />
      </Route>
      <Route
        path="/reports"
        element={
          <Protected title="Reports">
            <Reports />
          </Protected>
        }
      />
      <Route
        path="/notifications"
        element={
          <Protected title="Notifications">
            <Notifications />
          </Protected>
        }
      />
      <Route
        path="/admin-users"
        element={
          <Protected title="Admin Users">
            <AdminOnlyRoute>
              <AdminUsers />
            </AdminOnlyRoute>
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected title="System Settings">
            <Settings />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
