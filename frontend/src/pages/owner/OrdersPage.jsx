import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { API_URL } from '../../config'

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  preparing: 'badge-preparing',
  out_for_delivery: 'badge-out_for_delivery',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
}

export default function OwnerOrdersPage() {
  const { owner } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${owner.token}` },
    }).then(r => r.json()).then(data => { setOrders(data); setLoading(false) })
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${owner.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setUpdating(null)
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm">↻ Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s.value ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">No {filter !== 'all' ? filter : ''} orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="card">
              {/* Order Header */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-gray-700">#{order.id}</span>
                    <span className={STATUS_COLORS[order.status]}>
                      {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold text-gray-800 mt-1">{order.customer_name}</p>
                  <p className="text-gray-400 text-sm">📞 {order.customer_phone} · 📍 {order.customer_address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700 text-lg">₹{order.total}</p>
                  <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                </div>
              </div>

              {/* Expandable items */}
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="text-xs text-green-600 hover:text-green-700 mt-3 font-medium"
              >
                {expanded === order.id ? '▲ Hide items' : '▼ Show items'}
              </button>

              {expanded === order.id && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Update */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Update Status:</span>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.filter(s => s.value !== order.status).map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(order.id, s.value)}
                      disabled={updating === order.id}
                      className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 font-medium"
                    >
                      {updating === order.id ? '...' : s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
