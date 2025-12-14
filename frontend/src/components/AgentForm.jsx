import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function AgentForm({ agent, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    max_tokens: 1000,
    is_active: true
  })

  useEffect(() => {
    if (agent) {
      setFormData(agent)
    }
  }, [agent])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{agent ? 'Editar Agente' : 'Crear Nuevo Agente'}</h2>
          <button onClick={onCancel} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="agent-form">
          <div className="form-group">
            <label htmlFor="name">Nombre del Agente *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Asistente de Marketing"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Breve descripción de lo que hace este agente"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Modelo de IA *</label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            >
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</option>
              <option value="gpt-4">GPT-4 (OpenAI)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Google)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="system_prompt">Prompt del Sistema *</label>
            <textarea
              id="system_prompt"
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Define el comportamiento y personalidad del agente. Ej: Eres un experto en marketing digital que ayuda a crear estrategias de contenido..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="temperature">
                Temperatura: {formData.temperature}
                <span className="helper-text">Creatividad (0-2)</span>
              </label>
              <input
                type="range"
                id="temperature"
                name="temperature"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_tokens">
                Max Tokens
                <span className="helper-text">Longitud de respuesta</span>
              </label>
              <input
                type="number"
                id="max_tokens"
                name="max_tokens"
                min="100"
                max="4000"
                step="100"
                value={formData.max_tokens}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Agente activo
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {agent ? 'Guardar Cambios' : 'Crear Agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
