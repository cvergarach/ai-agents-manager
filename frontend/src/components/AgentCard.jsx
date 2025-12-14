import { Bot, Trash2, Edit, MessageCircle } from 'lucide-react'

const MODEL_INFO = {
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    color: '#D97757',
    icon: '🧠'
  },
  'gpt-4': {
    name: 'GPT-4',
    color: '#10a37f',
    icon: '🤖'
  },
  'gemini-2.5-flash': {
    name: 'gemini-2.5-flash',
    color: '#4285f4',
    icon: '✨'
  }
}

export default function AgentCard({ agent, onEdit, onDelete, onChat }) {
  const modelInfo = MODEL_INFO[agent.model] || MODEL_INFO['claude-3-5-sonnet-20241022']

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className="agent-icon" style={{ backgroundColor: modelInfo.color }}>
          {modelInfo.icon}
        </div>
        <div className="agent-info">
          <h3>{agent.name}</h3>
          <span className="agent-model">{modelInfo.name}</span>
        </div>
        {agent.is_active && <span className="agent-badge">Activo</span>}
      </div>

      <p className="agent-description">
        {agent.description || 'Sin descripción'}
      </p>

      <div className="agent-stats">
        <div className="stat">
          <span>Temperatura</span>
          <strong>{agent.temperature}</strong>
        </div>
        <div className="stat">
          <span>Max Tokens</span>
          <strong>{agent.max_tokens}</strong>
        </div>
      </div>

      <div className="agent-actions">
        <button 
          onClick={() => onChat(agent)}
          className="btn btn-primary"
        >
          <MessageCircle size={16} />
          Chatear
        </button>
        <button 
          onClick={() => onEdit(agent)}
          className="btn btn-secondary"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={() => onDelete(agent)}
          className="btn btn-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
