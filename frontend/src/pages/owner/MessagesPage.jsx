import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '../../config'

let socket = null
function getSocket() {
  if (!socket) socket = io(SOCKET_URL)
  return socket
}

export default function MessagesPage() {
  const { owner } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${owner.token}` },
    }).then(r => r.json()).then(data => {
      setOrders(data)
      if (data.length > 0) setSelectedOrderId(data[0].id)
    })

    const s = getSocket()
    s.on('owner_new_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev
        if (msg.order_id === selectedOrderId || Number(msg.order_id) === Number(selectedOrderId)) {
          return [...prev, msg]
        }
        return prev
      })
      // Update orders list to show unread indicator
      setOrders(prev => prev.map(o =>
        Number(o.id) === Number(msg.order_id) ? { ...o, _hasNewMsg: true } : o
      ))
    })
    return () => s.off('owner_new_message')
  }, [])

  useEffect(() => {
    if (!selectedOrderId) return
    fetch(`${API_URL}/api/messages/${selectedOrderId}`)
      .then(r => r.json()).then(setMessages)
    const s = getSocket()
    s.emit('join_order', selectedOrderId)
  }, [selectedOrderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim() || !selectedOrderId) return
    getSocket().emit('send_message', { orderId: selectedOrderId, content: text.trim(), senderType: 'owner' })
    setText('')
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Messages</h1>

      <div className="card p-0 overflow-hidden flex" style={{ height: '600px' }}>
        {/* Order List */}
        <div className="w-72 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-600">Conversations</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No orders yet</p>
            ) : (
              orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => { setSelectedOrderId(order.id); setOrders(prev => prev.map(o => o.id === order.id ? { ...o, _hasNewMsg: false } : o)) }}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-green-50 transition-colors ${selectedOrderId === order.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">#{order.id} — {order.customer_name}</span>
                    {order._hasNewMsg && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📞 {order.customer_phone}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {!selectedOrderId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <p className="font-semibold text-gray-800">
                  {selectedOrder?.customer_name} — Order #{selectedOrderId}
                </p>
                <p className="text-xs text-gray-400">{selectedOrder?.customer_address}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'owner' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.sender_type === 'owner'
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}>
                      <p className={`text-xs font-medium mb-1 ${msg.sender_type === 'owner' ? 'text-green-200' : 'text-gray-400'}`}>
                        {msg.sender_type === 'owner' ? '👤 You' : '🛒 Customer'}
                      </p>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_type === 'owner' ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Type your message..."
                  className="input flex-1"
                />
                <button onClick={send} className="btn-primary whitespace-nowrap">
                  Send 📤
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
