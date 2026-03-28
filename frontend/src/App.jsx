import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/Navbar'
import OwnerRoute from './components/OwnerRoute'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/owner/DashboardPage'
import OwnerProductsPage from './pages/owner/ProductsPage'
import OwnerOrdersPage from './pages/owner/OrdersPage'
import MessagesPage from './pages/owner/MessagesPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/owner" element={<OwnerRoute><DashboardPage /></OwnerRoute>} />
            <Route path="/owner/products" element={<OwnerRoute><OwnerProductsPage /></OwnerRoute>} />
            <Route path="/owner/orders" element={<OwnerRoute><OwnerOrdersPage /></OwnerRoute>} />
            <Route path="/owner/messages" element={<OwnerRoute><MessagesPage /></OwnerRoute>} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
