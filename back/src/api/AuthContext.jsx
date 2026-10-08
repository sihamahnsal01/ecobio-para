import { createContext, useContext, useEffect, useState } from 'react'
import api from './client.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pp_admin_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('pp_admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('pp_admin_token', data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('pp_admin_token')
    setUser(null)
  }

  // Saves the logged-in user's own profile (name/email/phone) and updates
  // the cached user in context, so the sidebar/topbar reflect it immediately.
  const updateProfile = async (updates) => {
    const data = await api.put('/auth/me', updates)
    setUser((prev) => ({ ...prev, ...data }))
    return data
  }

  const can = () => {
     // Managers get full operational access; only user-management
    // (Admin Users page) stays admin-exclusive — gated separately via user.role.
    return user?.role === 'admin' || user?.role === 'manager'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}