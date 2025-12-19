import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import API_URL from '../lib/config'
import '../styles/WiFiAnalyzer.css'

export default function PromptConfig() {
    const [prompts, setPrompts] = useState({
        analyze: '',
        chat: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadPrompts()
    }, [])

    const loadPrompts = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const response = await fetch(`${API_URL}/api/wifi/prompts`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setPrompts(data)
            }
        } catch (error) {
            console.error('Error cargando prompts:', error)
        } finally {
            setLoading(false)
        }
    }

    const savePrompts = async () => {
        setSaving(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const response = await fetch(`${API_URL}/api/wifi/prompts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(prompts)
            })

            if (response.ok) {
                alert('Prompts guardados exitosamente')
            } else {
                throw new Error('Error al guardar')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al guardar prompts')
        } finally {
            setSaving(false)
        }
    }

    const resetToDefault = (type) => {
        if (confirm('¿Restaurar prompt por defecto?')) {
            // Aquí puedes poner los prompts por defecto
            const defaults = {
                analyze: `Actúa como ingeniero de redes senior. Analiza estos datos técnicos de un gateway y crea un informe ejecutivo claro para call center.

REGLAS:
- Usa TEXTO PLANO (sin markdown)
- Emojis: ✅ (bueno), ⚠️ (advertencia), ❌ (crítico)
- Lenguaje simple

ESTRUCTURA:
INFORME DE DIAGNÓSTICO - GATEWAY {mac}

ESTADO GENERAL
[Estado con emoji y descripción]

CALIDAD DE SEÑAL
[Análisis de potencia óptica]

DISPOSITIVOS CONECTADOS
[Lista con detalles]

CONFIGURACIÓN WIFI
[2.4G y 5G]

PROBLEMAS Y SOLUCIONES
[Lista priorizada]

DATOS TÉCNICOS:
{technicalData}`,
                chat: `Eres un asistente experto en redes. Responde basándote ÚNICAMENTE en los datos técnicos.

HISTORIAL:
{history}

DATOS TÉCNICOS:
{context}

PREGUNTA: {question}

RESPUESTA (texto plano, sin markdown):`
            }

            setPrompts(prev => ({
                ...prev,
                [type]: defaults[type]
            }))
        }
    }

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>
    }

    return (
        <div className="wifi-analyzer">
            <div className="wifi-header">
                <div>
                    <button
                        onClick={() => window.location.href = '/wifi'}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            fontSize: '14px'
                        }}
                    >
                        ← Volver al Analizador
                    </button>
                    <h1>⚙️ Configuración de Prompts</h1>
                    <p>Personaliza los prompts de análisis y chat</p>
                </div>
            </div>

            <div className="prompt-config">
                <div className="prompt-section">
                    <div className="prompt-header">
                        <h2>📊 Prompt de Análisis</h2>
                        <button onClick={() => resetToDefault('analyze')} className="btn-secondary">
                            Restaurar por defecto
                        </button>
                    </div>
                    <p className="prompt-description">
                        Este prompt se usa para generar el informe ejecutivo del gateway.
                        Variables disponibles: <code>{'{mac}'}</code>, <code>{'{technicalData}'}</code>
                    </p>
                    <textarea
                        value={prompts.analyze}
                        onChange={(e) => setPrompts({ ...prompts, analyze: e.target.value })}
                        rows={20}
                        className="prompt-textarea"
                    />
                </div>

                <div className="prompt-section">
                    <div className="prompt-header">
                        <h2>💬 Prompt de Chat</h2>
                        <button onClick={() => resetToDefault('chat')} className="btn-secondary">
                            Restaurar por defecto
                        </button>
                    </div>
                    <p className="prompt-description">
                        Este prompt se usa para responder preguntas en el chat.
                        Variables disponibles: <code>{'{question}'}</code>, <code>{'{context}'}</code>, <code>{'{history}'}</code>
                    </p>
                    <textarea
                        value={prompts.chat}
                        onChange={(e) => setPrompts({ ...prompts, chat: e.target.value })}
                        rows={15}
                        className="prompt-textarea"
                    />
                </div>

                <div className="prompt-actions">
                    <button
                        onClick={savePrompts}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    )
}
