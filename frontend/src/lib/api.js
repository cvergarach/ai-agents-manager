import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper para obtener el token de autenticación
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Helper para hacer peticiones autenticadas
async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No hay sesión activa')
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error en la petición')
  }

  return response.json()
}

// ============================================
// API DE AGENTES
// ============================================

export const agentsAPI = {
  // Obtener todos los agentes
  async getAll() {
    return fetchWithAuth('/api/agents')
  },

  // Obtener un agente por ID
  async getById(id) {
    return fetchWithAuth(`/api/agents/${id}`)
  },

  // Crear un agente
  async create(agentData) {
    return fetchWithAuth('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    })
  },

  // Actualizar un agente
  async update(id, agentData) {
    return fetchWithAuth(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    })
  },

  // Eliminar un agente
  async delete(id) {
    return fetchWithAuth(`/api/agents/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// API DE CHAT
// ============================================

export const chatAPI = {
  // Enviar mensaje a un agente
  async sendMessage(agentId, message, conversationId = null) {
    return fetchWithAuth('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        message,
        conversation_id: conversationId,
      }),
    })
  },

  // Obtener conversaciones
  async getConversations() {
    return fetchWithAuth('/api/conversations')
  },

  // Obtener mensajes de una conversación
  async getMessages(conversationId) {
    return fetchWithAuth(`/api/conversations/${conversationId}/messages`)
  },
}
