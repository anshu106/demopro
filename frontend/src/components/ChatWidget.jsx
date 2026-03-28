import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '../config'

let socket = null

function getSocket() {
  if (!socket) socket = io(SOCKET_URL)
  return socket
}

export default function ChatWidget({ orderId, senderType = 'customer' }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/api/messages/${orderId}`)
      .then(r => r.json())
      .then(setMessages)

    const s = getSocket()
    s.emit('join_order', orderId)
    s.on('new_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })
    return () => s.off('new_message')
  }, [orderId])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = () => {
    if (!text.trim()) return
    getSocket().emit('send_message', { orderId, content: text.trim(), senderType })
    setText('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <div>
                <p className="font-semibold text-sm">Chat with {senderType === 'customer' ? 'Shop Owner' : 'Customer'}</p>
                <p className="text-green-200 text-xs">Order #{orderId}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-green-200 hover:text-white text-lg leading-none">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">No messages yet. Say hello! 👋</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === senderType ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  msg.sender_type === senderType
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_type === senderType ? 'text-green-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={send} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
