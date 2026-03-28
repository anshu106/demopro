import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '../../config'

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  preparing: 'badge-preparing',
  out_for_delivery: 'badge-out_for_delivery',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
}

export default function DashboardPage() {
  const { owner } = useAuth()
  const [stats, setStats] = useState(null)
  const [notification, setNotification] = useState(null)

  const fetchStats = () => {
    fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${owner.token}` },
    }).then(r => r.json()).then(setStats)
  }

  useEffect(() => {
    fetchStats()
    const socket = io(SOCKET_URL)
    socket.on('new_order', (order) => {
      setNotification(`🛒 New order #${order.id} from ${order.customer_name}!`)
      fetchStats()
      setTimeout(() => setNotification(null), 5000)
    })
    return () => socket.disconnect()
  }, [])

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Products Listed', value: stats.totalProducts, icon: '🏪', color: 'bg-purple-50 text-purple-700' },
  ] : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {notification && (
        <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
          <span className="text-lg">🔔</span>
          <span className="font-medium">{notification}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {owner?.name}! Here's your shop overview.</p>
        </div>
        <Link to="/owner/orders" className="btn-primary">View All Orders</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`card ${card.color} border-0`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">Recent Orders</h2>
          <Link to="/owner/orders" className="text-green-600 text-sm hover:underline">View all →</Link>
        </div>
        {!stats?.recentOrders?.length ? (
          <p className="text-gray-400 text-center py-8">No orders yet. Share your shop link to start receiving orders!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-left">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono font-bold text-gray-700">#{order.id}</td>
                    <td className="py-3 text-gray-700">{order.customer_name}</td>
                    <td className="py-3 font-semibold text-green-700">₹{order.total}</td>
                    <td className="py-3">
                      <span className={STATUS_COLORS[order.status]}>
                        {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link to="/owner/products" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-green-700">Manage Products</p>
            <p className="text-xs text-gray-400">Add, edit or remove products</p>
          </div>
        </Link>
        <Link to="/owner/orders" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-green-700">Manage Orders</p>
            <p className="text-xs text-gray-400">Update order statuses</p>
          </div>
        </Link>
        <Link to="/owner/messages" className="card hover:shadow-md transition-shadow flex items-center gap-3 group">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💬</div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-green-700">Customer Messages</p>
            <p className="text-xs text-gray-400">Chat with customers</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
