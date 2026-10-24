import { createContext, useCallback, useContext, useEffect, useState } from 'react'
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

    // Saves the latest profile (after login or a profile edit) everywhere it is used.
    const updateUser = useCallback((profile) => {
        setUser((previous) => {
            const next = { ...(previous || {}), ...profile }
            delete next.token
            localStorage.setItem(USER_KEY, JSON.stringify(next))
            return next
        })
    }, [])

    const refreshUser = useCallback(async () => {
        const profile = await api.get('/auth/me')
        updateUser(profile)
        return profile
    }, [updateUser])

    const authenticate = async (data) => {
        localStorage.setItem(TOKEN_KEY, data.token)
        updateUser(data)
        try {
            await api.post('/orders/claim')
        } catch {
            // Account authentication should still succeed if order claiming is temporarily unavailable.
        }
        try {
            await refreshUser() // login only returns the basics; load phone, addresses, etc.
        } catch {
            // keep the basic profile from the login response
        }
    }

    const login = async (credentials) => authenticate(await api.post('/auth/login', credentials))
    const register = async (details) => authenticate(await api.post('/auth/register', details))
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
    }

    return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext)
}

export { TOKEN_KEY }
