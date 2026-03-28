import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { API_URL } from '../../config'

const EMOJIS = ['🍅','🥔','🧅','🥬','🥕','🥛','🧀','🫙','🧈','🌾','🫘','🌿','🌶️','🫚','🧄','🍋','🥑','🫑','🧁','🍞']

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || { name: '', description: '', price: '', category: '', emoji: '🛒', stock: 100 })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Product Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fresh Tomatoes" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Price (₹) *</label>
              <input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Stock</label>
              <input className="input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Category *</label>
            <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Vegetables, Dairy, Spices" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">Emoji Icon</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${form.emoji === e ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {e}
                </button>
              ))}
            </div>
            <input className="input" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="Or type any emoji" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary">
            {product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OwnerProductsPage() {
  const { owner } = useAuth()
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | product object
  const [deleting, setDeleting] = useState(null)

  const authHeaders = { Authorization: `Bearer ${owner.token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts)
  }, [])

  const handleSave = async (form) => {
    const isEdit = modal !== 'add' && modal?.id
    const url = isEdit ? `${API_URL}/api/products/${modal.id}` : `${API_URL}/api/products`
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) })
    const saved = await res.json()
    if (isEdit) {
      setProducts(prev => prev.map(p => p.id === saved.id ? saved : p))
    } else {
      setProducts(prev => [saved, ...prev])
    }
    setModal(null)
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers: authHeaders })
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const grouped = products.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products listed</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Product
        </button>
      </div>

      {Object.keys(grouped).sort().map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wider mb-3">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {grouped[cat].map(product => (
              <div key={product.id} className="card hover:shadow-md transition-shadow">
                <div className="text-5xl text-center py-3 bg-gray-50 rounded-lg mb-3">{product.emoji}</div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-green-700 font-bold">₹{product.price}</span>
                  <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setModal(product)} className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded-lg transition-colors font-medium">
                    Edit
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this product?')) handleDelete(product.id) }}
                    disabled={deleting === product.id}
                    className="flex-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    {deleting === product.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
