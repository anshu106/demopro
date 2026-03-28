import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { count } = useCart()
  const { owner, logout } = useAuth()
  const location = useLocation()
  const isOwnerSection = location.pathname.startsWith('/owner')

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🛒</span>
          <span>LocalMart</span>
        </Link>

        {!isOwnerSection ? (
          <div className="flex items-center gap-6">
            <Link to="/products" className="hover:text-green-200 transition-colors text-sm font-medium">Products</Link>
            <Link to="/track-order" className="hover:text-green-200 transition-colors text-sm font-medium">Track Order</Link>
            <Link to="/cart" className="relative flex items-center gap-1 bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
              <span>🛒</span>
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>
            <Link to="/login" className="text-green-200 hover:text-white text-xs border border-green-500 px-2 py-1 rounded transition-colors">
              Owner Login
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/owner" className="hover:text-green-200 text-sm font-medium">Dashboard</Link>
            <Link to="/owner/products" className="hover:text-green-200 text-sm font-medium">Products</Link>
            <Link to="/owner/orders" className="hover:text-green-200 text-sm font-medium">Orders</Link>
            <Link to="/owner/messages" className="hover:text-green-200 text-sm font-medium">Messages</Link>
            <div className="flex items-center gap-3 ml-4 border-l border-green-600 pl-4">
              <span className="text-green-200 text-sm">👤 {owner?.name}</span>
              <button
                onClick={() => { logout(); window.location.href = '/' }}
                className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
