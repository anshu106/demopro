import { Link } from 'react-router-dom'

const categories = [
  { name: 'Vegetables', emoji: '🥦', color: 'bg-green-100 text-green-700' },
  { name: 'Dairy', emoji: '🥛', color: 'bg-blue-100 text-blue-700' },
  { name: 'Grains', emoji: '🌾', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Spices', emoji: '🌶️', color: 'bg-red-100 text-red-700' },
]

const features = [
  { icon: '📦', title: 'Order Online', desc: 'Browse fresh products and place orders from home' },
  { icon: '🚚', title: 'Quick Delivery', desc: 'Get fresh produce delivered right to your doorstep' },
  { icon: '💬', title: 'Direct Chat', desc: 'Talk directly with the shop owner for custom orders' },
  { icon: '📍', title: 'Track Orders', desc: 'Real-time order status updates every step of the way' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-5xl font-bold mb-4">Welcome to LocalMart</h1>
          <p className="text-green-200 text-xl mb-8 max-w-2xl mx-auto">
            Fresh produce and quality products from your trusted local shop. Order online, get it delivered fast.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/products" className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors text-lg">
              Shop Now →
            </Link>
            <Link to="/track-order" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-green-800 transition-colors text-lg">
              Track Order
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className={`${cat.color} rounded-2xl p-8 text-center hover:scale-105 transition-transform cursor-pointer shadow-sm`}
            >
              <div className="text-5xl mb-3">{cat.emoji}</div>
              <p className="font-bold text-lg">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {f.icon}
                </div>
                <div className="text-green-600 font-bold text-sm mb-1">Step {i + 1}</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-orange-500 text-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">Are you a business owner?</h2>
        <p className="text-orange-100 mb-6 text-lg">Manage your shop, products, and customer orders all in one place.</p>
        <Link to="/login" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-block">
          Owner Dashboard →
        </Link>
      </section>

      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        <p>© 2024 LocalMart — Connecting local businesses with customers</p>
      </footer>
    </div>
  )
}
