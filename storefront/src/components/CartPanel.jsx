import { useCart } from './CartContext.jsx'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import "../assets/styles/cartPanel.css"

const FREE_DELIVERY_THRESHOLD = 300
const DELIVERY_FEE = 30

function CartPanel() {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart()
  const { user } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', street: '', city: '', postalCode: '', country: 'Morocco' })
  const [checkoutError, setCheckoutError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    if (!isCartOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCartOpen])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery
  const isCheckoutReady = Object.values(form).every((value) => String(value).trim()) && Boolean(paymentMethod)

  const updateField = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))

  const submitOrder = async (event) => {
    event.preventDefault()
    const orderItems = cartItems.map((item) => ({
      productId: item.id || item._id,
      qty: Number(item.qty),
    }))

    if (orderItems.some((item) => !item.productId || !Number.isInteger(item.qty) || item.qty < 1)) {
      setCheckoutError('Please check the quantities in your cart and try again.')
      return
    }

    setSubmitting(true)
    setCheckoutError('')
    try {
      const order = await api.post('/orders', {
        items: orderItems,
        shippingAddress: form,
        paymentMethod,
      })

      if (paymentMethod === 'online') {
        const payment = await api.post(`/orders/${order._id}/pay`, { email: form.email })
        window.location.assign(payment.url)
        return
      }

      clearCart()
      setCheckoutOpen(false)
      setConfirmation(order)
    } catch (error) {
      setCheckoutError(error.message || 'Unable to place this order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Dark overlay backdrop to close cart on click */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sliding Cart Drawer */}
      <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-panel-header">
          <div className="cart-panel-title">
            <h3>Mon Panier</h3>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          {/* X icon to close cart */}
          <i 
            className="fa-solid fa-xmark cart-close-icon" 
            onClick={() => setIsCartOpen(false)}
            style={{ cursor: 'pointer' }}
          ></i>
        </div>

        {confirmation ? (
          <div className="order-confirmation">
            <i className="fa-solid fa-circle-check"></i>
            <h3>Order received</h3>
            <p>Thank you, {confirmation.shippingAddress.name}. Your order was saved successfully.</p>
            <strong>Order #{confirmation._id.slice(-6).toUpperCase()}</strong>
            <Link to="/orders" className="checkout-btn" onClick={() => setIsCartOpen(false)}>Track your order</Link>
            <button className="checkout-cancel" onClick={() => { setConfirmation(null); setIsCartOpen(false) }}>Close</button>
          </div>
        ) : cartItems.length === 0 ? (
          <p className="cart-empty">Votre panier est vide.</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = '/placeholder.png'
                    }}
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <div className="cart-item-qty-controls">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        −
                      </button>
                      <span>Qté: {item.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item-price">{(item.price * item.qty).toFixed(2)} DH</p>
                  </div>
                  <i
                    className="fa-solid fa-trash cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-line">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="cart-line">
                <span>Livraison</span>
                <span>{delivery === 0 ? 'Gratuite' : `${delivery.toFixed(2)} DH`}</span>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
              {!checkoutOpen ? (
                <button className="checkout-btn" onClick={() => {
                  if (user) setForm((previous) => ({ ...previous, name: user.name || previous.name, email: user.email || previous.email, phone: user.phone || previous.phone }))
                  setCheckoutOpen(true)
                }}>Commander</button>
              ) : (
                <form className="checkout-form" onSubmit={submitOrder}>
                  <h4>Choose how to pay</h4>
                  {checkoutError && <p className="checkout-error">{checkoutError}</p>}
                  <fieldset className="payment-options">
                    <legend>Choose payment method</legend>
                    <label className="payment-option">
                      <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                      <span>Card Payment</span>
                    </label>
                  </fieldset>
                  {paymentMethod === 'online' ? (
                    <div className="payment-method-info card-payment-info">
                      <strong>Secure card payment</strong>
                      <p>After you confirm your delivery details, you will continue to Stripe Checkout.</p>
                      <small>Card number, expiry date, and security code are entered only on Stripe. Eco&amp;Bio never receives or stores them.</small>
                    </div>
                  ) : (
                    <div className="payment-method-info cod-payment-info">
                      <strong>Pay when your order arrives</strong>
                      <p>Please prepare {total.toFixed(2)} DH for the delivery driver.</p>
                      <small>We will contact you on the phone number above to confirm delivery.</small>
                    </div>
                  )}
                  <h4 className="delivery-details-heading">Delivery details</h4>
                  {['name', 'email', 'phone', 'street', 'city', 'postalCode'].map((field) => (
                    <input
                      key={field}
                      name={field}
                      type={field === 'email' ? 'email' : 'text'}
                      autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'street-address'}
                      placeholder={field === 'postalCode' ? 'Postal code' : field[0].toUpperCase() + field.slice(1)}
                      value={form[field]}
                      onChange={updateField}
                      required
                    />
                  ))}
                  <button
                    className="checkout-btn complete-payment-btn"
                    type="submit"
                    disabled={submitting || !isCheckoutReady}
                    aria-label="Confirm and place order"
                  >
                    {submitting ? 'Processing...' : 'CONFIRMER ET PASSER LA COMMANDE'}
                  </button>
                  <button className="checkout-cancel" type="button" onClick={() => setCheckoutOpen(false)}>Back to cart</button>
                </form>
              )}
              {delivery > 0 && (
                <p className="cart-free-delivery-note">
                  Ajoutez {(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} DH de plus pour la livraison gratuite
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default CartPanel