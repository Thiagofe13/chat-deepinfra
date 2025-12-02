'use client'

import { useState } from 'react'
import MessageBubble from '../components/MessageBubble'

export default function Page() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = input
    setHistory([...history, { role: 'user', content: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      })

      const data = await res.json()
      if (data.error) {
        setHistory((prev) => [...prev, { role: 'bot', content: 'Erro: ' + data.error }])
      } else {
        setHistory((prev) => [...prev, { role: 'bot', content: data.text }])
      }
    } catch (err) {
      setHistory((prev) => [...prev, { role: 'bot', content: 'Erro de conexão.' }])
    }

    setLoading(false)
  }

  const resetChat = () => setHistory([])

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border-l border-r border-gray-800">
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl text-red-500 font-bold">🔥 Chat IA</h1>
        <button
          onClick={resetChat}
          className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600 transition"
        >
          🗑️ Limpar
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {history.length === 0 && (
          <MessageBubble role="bot" content="Olá! Sou sua assistente. Pode falar o que quiser! 😄" />
        )}
        {history.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}
      </div>

      <div className="p-4 bg-gray-800 flex gap-2 border-t border-gray-700">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white resize-none h-12"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? '...' : 'ENVIAR'}
        </button>
      </div>
    </div>
  )
}
