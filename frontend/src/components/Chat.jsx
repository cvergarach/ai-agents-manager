import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Loader } from 'lucide-react'
import { chatAPI } from '../lib/api'

export default function Chat({ agent, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await chatAPI.sendMessage(agent.id, userMessage, conversationId)
      
      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.message 
      }])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>{agent.name}</h2>
          <p className="chat-model">{agent.model}</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <h3>¡Hola! Soy {agent.name}</h3>
            <p>{agent.description || 'Pregúntame lo que quieras'}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message message-${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-content">
              <Loader className="spinner" size={16} />
              Pensando...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
