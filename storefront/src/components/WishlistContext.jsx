import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'

const WishlistContext = createContext(null)
const LEGACY_KEY = 'ecobio_wishlist' // old anonymous, browser-only wishlist

const getProductId = (product) => product?._id || product?.id

// Router state used when a visitor without an account taps a heart.
export const wishlistAuthState = (from) => ({
    from,
    mode: 'register',
    notice: 'Create a free account (or sign in) to save products to your wishlist.',
})

// The wishlist now lives in the database, under the signed-in customer's account.
//   GET    /wishlist              -> [product, ...]
//   POST   /wishlist/:productId   -> add (idempotent)
//   DELETE /wishlist/:productId   -> remove
export function WishlistProvider({ children }) {
    const { user, loading: authLoading } = useAuth()
    const signedIn = Boolean(user)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(async () => {
        if (!signedIn) {
            setItems([])
            return
        }
        setLoading(true)
        try {
            const data = await api.get('/wishlist')
            setItems(Array.isArray(data) ? data : [])
        } catch {
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [signedIn])

    useEffect(() => {
        try { localStorage.removeItem(LEGACY_KEY) } catch { /* ignore */ }
    }, [])

    useEffect(() => {
        if (authLoading) return
        refresh()
    }, [authLoading, refresh])

    const ids = useMemo(() => new Set(items.map(getProductId)), [items])

    const isWishlisted = useCallback((product) => ids.has(getProductId(product)), [ids])

    // Resolves to { ok:true, added } or { ok:false, reason:'auth' | 'invalid' | 'error' }
    const toggleWishlist = useCallback(async (product) => {
        const id = getProductId(product)
        if (!id) return { ok: false, reason: 'invalid' }
        if (!signedIn) return { ok: false, reason: 'auth' }

        const had = ids.has(id)
        // optimistic update, rolled back if the server refuses
        setItems((prev) => (had ? prev.filter((p) => getProductId(p) !== id) : [product, ...prev]))
        try {
            if (had) await api.del(`/wishlist/${id}`)
            else await api.post(`/wishlist/${id}`, {})
            return { ok: true, added: !had }
        } catch (err) {
            setItems((prev) => (had ? [product, ...prev] : prev.filter((p) => getProductId(p) !== id)))
            return { ok: false, reason: 'error', message: err.message }
        }
    }, [signedIn, ids])

    const value = useMemo(() => ({
        items,
        wishlistIds: [...ids],
        wishlistCount: items.length,
        loading,
        refresh,
        isWishlisted,
        toggleWishlist,
    }), [items, ids, loading, refresh, isWishlisted, toggleWishlist])

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
    return useContext(WishlistContext)
}
