import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext()
const STORAGE_KEY = 'ecobio_wishlist'

const getProductId = (product) => product.id || product._id

function loadInitial() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export function WishlistProvider({ children }) {
    const [wishlistIds, setWishlistIds] = useState(loadInitial)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds))
    }, [wishlistIds])

    const isWishlisted = (product) => wishlistIds.includes(getProductId(product))

    const toggleWishlist = (product) => {
        const productId = getProductId(product)
        if (!productId) return
        setWishlistIds((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        )
    }

    return (
        <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    return useContext(WishlistContext)
}