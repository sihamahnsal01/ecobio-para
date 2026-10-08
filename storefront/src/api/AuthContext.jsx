import { createContext, useContext, useEffect, useState } from 'react'
import api from './client.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'eco_bio_customer_token'
const USER_KEY = 'eco_bio_customer'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) {
            setLoading(false)
            return
        }
        api.get('/auth/me')
            .then((profile) => {
                setUser(profile)
                localStorage.setItem(USER_KEY, JSON.stringify(profile))
            })
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [])

    const authenticate = async (data) => {
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
        setUser(data)
        try {
            await api.post('/orders/claim')
        } catch {
            // Account authentication should still succeed if order claiming is temporarily unavailable.
        }
    }

    const login = async (credentials) => authenticate(await api.post('/auth/login', credentials))
    const register = async (details) => authenticate(await api.post('/auth/register', details))
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
    }

    return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext)
}

export { TOKEN_KEY }
