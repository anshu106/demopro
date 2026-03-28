import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { API_URL } from '../config'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedCategory
      ? `${API_URL}/api/products?category=${selectedCategory}`
      : `${API_URL}/api/products`
    fetch(url).then(r => r.json()).then(data => { setProducts(data); setLoading(false) })
  }, [selectedCategory])

  const handleAdd = (product) => {
    addToCart(product)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200)
  }

  const categoryColors = {
    Vegetables: 'bg-green-50 border-green-200',
    Dairy: 'bg-blue-50 border-blue-200',
    Grains: 'bg-yellow-50 border-yellow-200',
    Spices: 'bg-red-50 border-red-200',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Products</h1>

      {/* Category filter */}
      <div className="flex gap-3 flex-wrap mb-8">
        <button
          onClick={() => setSearchParams({})}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'
          }`}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSearchParams({ category: cat })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className={`rounded-2xl border-2 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${
                categoryColors[product.category] || 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-6xl text-center py-4 bg-white rounded-xl">{product.emoji}</div>
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.category}</span>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-green-700 font-bold text-xl">₹{product.price}</span>
                <span className="text-xs text-gray-400">{product.stock} in stock</span>
              </div>
              <button
                onClick={() => handleAdd(product)}
                className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                  added[product.id]
                    ? 'bg-green-100 text-green-700 scale-95'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {added[product.id] ? '✓ Added to Cart' : '+ Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
