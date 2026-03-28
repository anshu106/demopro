import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChatWidget from '../components/ChatWidget'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '../config'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('id') || '')
  const [inputId, setInputId] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async (id) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}`)
      if (!res.ok) throw new Error('Order not found')
      setOrder(await res.json())
    } catch {
      setError('Order not found. Please check your Order ID.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrder(orderId)
  }, [orderId])

  useEffect(() => {
    if (!orderId) return
    const socket = io(SOCKET_URL)
    socket.on('order_status_update', ({ orderId: id, status }) => {
      if (Number(id) === Number(orderId)) {
        setOrder(prev => prev ? { ...prev, status } : prev)
      }
    })
    return () => socket.disconnect()
  }, [orderId])

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order?.status)
  const isCancelled = order?.status === 'cancelled'

  const handleSearch = () => {
    if (!inputId.trim()) return
    setOrderId(inputId.trim())
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Track Your Order</h1>

      <div className="card mb-6">
        <label className="text-sm font-medium text-gray-600 block mb-2">Enter Order ID</label>
        <div className="flex gap-3">
          <input
            className="input"
            placeholder="e.g. 5"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
            Track Order
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Looking up your order...</div>}
      {error && <div className="card text-center text-red-500 py-6">{error}</div>}

      {order && (
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Order #{order.id}</h2>
                <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`badge-${order.status}`}>
                {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>👤 <strong>{order.customer_name}</strong></p>
              <p>📞 {order.customer_phone}</p>
              <p>📍 {order.customer_address}</p>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Items Ordered:</p>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-700">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          {!isCancelled ? (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-6">Order Progress</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 -z-0" />
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStepIndex
                    const active = i === currentStepIndex
                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${
                          done ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                        } ${active ? 'ring-4 ring-green-200' : ''}`}>
                          {step.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${done ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                          {active && <p className="text-xs text-green-500 font-medium animate-pulse">Current status</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-6">
              <div className="text-4xl mb-2">❌</div>
              <p className="font-bold text-red-600 text-lg">Order Cancelled</p>
              <p className="text-gray-400 text-sm mt-1">This order has been cancelled. Please contact the shop for more info.</p>
            </div>
          )}
        </div>
      )}

      {/* Chat widget shows when order is found */}
      {order && !isCancelled && <ChatWidget orderId={order.id} senderType="customer" />}
    </div>
  )
}
