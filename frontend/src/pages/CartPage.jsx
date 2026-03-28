import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { API_URL } from '../config'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart()
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_address: '' })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const navigate = useNavigate()

  const handleOrder = async () => {
    if (!form.customer_name || !form.customer_phone || !form.customer_address) {
      alert('Please fill in all delivery details')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({
            product_id: i.id,
            product_name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      })
      const order = await res.json()
      clearCart()
      setOrderId(order.id)
    } catch {
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed!</h2>
        <p className="text-gray-500 mb-6">Your order has been received. The shop owner will confirm shortly.</p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <p className="text-green-600 text-sm mb-1">Your Order ID</p>
          <p className="text-4xl font-bold text-green-700">#{orderId}</p>
          <p className="text-green-600 text-sm mt-2">Save this to track your order and chat with us</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/track-order?id=${orderId}`)}
            className="btn-primary"
          >
            Track Order
          </button>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some fresh products to get started!</p>
        <Link to="/products" className="btn-primary inline-block">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
      <div className="grid md:grid-cols-5 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-3 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4">
              <div className="text-4xl">{item.emoji}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-green-600 font-medium">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                >−</button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                >+</button>
              </div>
              <p className="font-bold text-gray-800 w-16 text-right">₹{item.price * item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-600 ml-2"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Order Form */}
        <div className="md:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Delivery Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Full Name</label>
                <input
                  className="input"
                  placeholder="Your name"
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Phone Number</label>
                <input
                  className="input"
                  placeholder="10-digit mobile number"
                  value={form.customer_phone}
                  onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Delivery Address</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="House no., Street, Area, City"
                  value={form.customer_address}
                  onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={loading}
              className="btn-primary w-full mt-4 text-base py-3"
            >
              {loading ? 'Placing Order...' : '🎯 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
