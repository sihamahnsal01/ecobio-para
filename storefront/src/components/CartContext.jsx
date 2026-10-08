import { createContext, useContext, useState } from 'react'
import { ASSET_BASE_URL } from '../utils/apiBase.js'

const CartContext = createContext()

const getProductId = (product) => product.id || product._id

const resolveImageUrl = (image) => {
    if (!image) return '/placeholder.png'
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) return image
    if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
    return `${ASSET_BASE_URL}/${image}`
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)

        const addToCart = (product, quantity = 1) => {
        const productId = getProductId(product)
        const qtyToAdd = Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1

        if (!productId) return
        if (Number(product.stock) <= 0) return

        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === productId)
            if (existing) {
                return prev.map((item) =>
                    item.id === productId ? { ...item, qty: item.qty + qtyToAdd } : item
                )
            }
            return [...prev, { ...product, id: productId, image: resolveImageUrl(product.image), qty: qtyToAdd }]
        })
    }

    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id))
    }

    const updateQuantity = (id, quantity) => {
        const nextQuantity = Number(quantity)
        if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return

        setCartItems((prev) => prev.map((item) => (
            item.id === id ? { ...item, qty: nextQuantity } : item
        )))
    }

    const clearCart = () => setCartItems([])

    const cartCount = cartItems.length

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
            cartCount, isCartOpen, setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}