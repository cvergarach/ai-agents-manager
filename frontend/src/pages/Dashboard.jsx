import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { agentsAPI } from '../lib/api'
import AgentCard from '../components/AgentCard'
import AgentForm from '../components/AgentForm'
import Chat from '../components/Chat'
import { Plus, LogOut, Loader } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [chattingAgent, setChattingAgent] = useState(null)

  useEffect(() => {
    // Obtener usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Cargar agentes
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const data = await agentsAPI.getAll()
      setAgents(data)
    } catch (error) {
      console.error('Error al cargar agentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setShowForm(true)
  }

  const handleEditAgent = (agent) => {
    setEditingAgent(agent)
    setShowForm(true)
  }

  const handleSaveAgent = async (agentData) => {
    try {
      if (editingAgent) {
        await agentsAPI.update(editingAgent.id, agentData)
      } else {
        await agentsAPI.create(agentData)
      }
      await loadAgents()
      setShowForm(false)
      setEditingAgent(null)
    } catch (error) {
      console.error('Error al guardar agente:', error)
      alert('Error al guardar el agente: ' + error.message)
    }
  }

  const handleDeleteAgent = async (agent) => {
    if (!confirm(`¿Estás seguro de eliminar "${agent.name}"?`)) return

    try {
      await agentsAPI.delete(agent.id)
      await loadAgents()
    } catch (error) {
      console.error('Error al eliminar agente:', error)
      alert('Error al eliminar el agente')
    }
  }

  const handleChat = (agent) => {
    setChattingAgent(agent)
  }

  // Si está chateando, mostrar el chat
  if (chattingAgent) {
    return <Chat agent={chattingAgent} onBack={() => setChattingAgent(null)} />
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>🤖 Mis Agentes de IA</h1>
          <p>Hola, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleCreateAgent} className="btn btn-primary">
            <Plus size={20} />
            Nuevo Agente
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <Loader className="spinner" size={40} />
            <p>Cargando agentes...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="empty-state">
            <h2>No tienes agentes todavía</h2>
            <p>Crea tu primer agente de IA para comenzar</p>
            <button onClick={handleCreateAgent} className="btn btn-primary btn-large">
              <Plus size={24} />
              Crear Mi Primer Agente
            </button>
          </div>
        ) : (
          <div className="agents-grid">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
                onChat={handleChat}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AgentForm
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={() => {
            setShowForm(false)
            setEditingAgent(null)
          }}
        />
      )}
    </div>
  )
}
