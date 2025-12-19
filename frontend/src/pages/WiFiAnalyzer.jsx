import { useState } from 'react'
import { supabase } from '../lib/supabase'
import API_URL from '../lib/config'
import '../styles/WiFiAnalyzer.css'

export default function WiFiAnalyzer() {
    const [mode, setMode] = useState('single')
    const [mac, setMac] = useState('78EB46AB75CA')
    const [macs, setMacs] = useState([])
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState([])
    const [result, setResult] = useState(null)
    const [bulkResults, setBulkResults] = useState([])
    const [chatHistory, setChatHistory] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [activeTab, setActiveTab] = useState('report')

    const analyzeSingle = async () => {
        if (!mac || mac.length !== 12) {
            alert('MAC address debe tener 12 caracteres')
            return
        }

        setLoading(true)
        setResult({
            mac: mac.toUpperCase(),
            technicalData: '',
            analysis: '',
            timestamp: new Date().toISOString()
        })
        setProgress([])
        setActiveTab('technical') // Mostrar datos técnicos desde el inicio

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session.access_token

            // Usar EventSource para SSE
            const url = `${API_URL}/api/wifi/analyze-stream?mac=${mac.toUpperCase()}&token=${token}`
            const eventSource = new EventSource(url)

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.type === 'progress') {
                    setProgress(prev => [...prev.slice(-4), data.content])
                }

                if (data.type === 'technicalData') {
                    setResult(prev => ({ ...prev, technicalData: data.content }))
                }

                if (data.type === 'analysis') {
                    setResult(prev => ({ ...prev, analysis: data.content }))
                    setActiveTab('report')
                }

                if (data.type === 'error') {
                    alert(`Error: ${data.content}`)
                    eventSource.close()
                    setLoading(false)
                }

                if (data.type === 'done') {
                    eventSource.close()
                    setLoading(false)
                }
            }

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error)
                eventSource.close()
                setLoading(false)
            }

        } catch (error) {
            console.error('Error:', error)
            alert(`Error de conexión: ${error.message}`)
            setLoading(false)
        }
    }

    const downloadFile = (content, filename) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    const analyzeBulk = async () => {
        if (macs.length === 0) {
            alert('Debes cargar al menos una MAC')
            return
        }

        setLoading(true)
        setBulkResults([])

        try {
            const { data: { session } } = await supabase.auth.getSession()

            const response = await fetch(`${API_URL}/api/wifi/analyze-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ macs: macs.map(m => m.toUpperCase().replace(/[:-]/g, '')) })
            })

            if (!response.ok) {
                throw new Error('Error en análisis masivo')
            }

            const data = await response.json()
            setBulkResults(data.results)
            setActiveTab('bulk')
        } catch (error) {
            console.error('Error:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const sendChatMessage = async () => {
        if (!chatInput.trim() || !result) return

        const question = chatInput
        setChatInput('')
        setChatHistory(prev => [...prev, { role: 'user', content: question }])

        try {
            const { data: { session } } = await supabase.auth.getSession()

            const response = await fetch(`${API_URL}/api/wifi/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    question,
                    context: result.technicalData,
                    history: chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')
                })
            })

            const data = await response.json()
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }])
        } catch (error) {
            console.error('Error:', error)
            setChatHistory(prev => [...prev, { role: 'error', content: 'Error al procesar pregunta' }])
        }
    }

    const loadMacsFromFile = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target.result
            const lines = text.split('\n')
                .map(line => line.trim().replace(/[:-]/g, '').toUpperCase())
                .filter(line => line.length === 12 && /^[0-9A-F]+$/.test(line))
            setMacs(lines)
        }
        reader.readAsText(file)
    }

    return (
        <div className="wifi-analyzer">
            <div className="wifi-header">
                <div>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            marginRight: '10px',
                            fontSize: '14px'
                        }}
                    >
                        ← Volver al Dashboard
                    </button>
                    <button
                        onClick={() => window.location.href = '/wifi/config'}
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
                        ⚙️ Configurar Prompts
                    </button>
                    <h1>🌐 Analizador WiFi Gateway</h1>
                    <p>Diagnóstico técnico de gateways residenciales</p>
                </div>
            </div>

            <div className="wifi-controls">
                <div className="mode-selector">
                    <button
                        className={mode === 'single' ? 'active' : ''}
                        onClick={() => setMode('single')}
                    >
                        Individual
                    </button>
                    <button
                        className={mode === 'bulk' ? 'active' : ''}
                        onClick={() => setMode('bulk')}
                    >
                        Masivo
                    </button>
                </div>

                {mode === 'single' ? (
                    <div className="single-mode">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="MAC Address (ej: 78EB46AB75CA)"
                                value={mac}
                                onChange={(e) => setMac(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && analyzeSingle()}
                                maxLength={17}
                                autoFocus
                            />
                            <button onClick={analyzeSingle} disabled={loading}>
                                {loading ? '⏳ Analizando...' : '🔍 Analizar'}
                            </button>
                        </div>
                        {loading && progress.length > 0 && (
                            <div className="progress-log">
                                {progress.map((msg, i) => (
                                    <div key={i} className="progress-msg">{msg}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bulk-mode">
                        <input
                            type="file"
                            accept=".txt"
                            onChange={loadMacsFromFile}
                            id="file-input"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-input" className="file-button">
                            📁 Cargar Archivo
                        </label>
                        <span className="mac-count">MACs cargadas: {macs.length}</span>
                        <button onClick={analyzeBulk} disabled={loading || macs.length === 0}>
                            {loading ? '⏳ Procesando...' : '🚀 Analizar Todos'}
                        </button>
                    </div>
                )}
            </div>

            {loading && (
                <div className="loading-bar">
                    <div className="progress"></div>
                </div>
            )}

            {result && mode === 'single' && (
                <div className="results">
                    <div className="tabs">
                        <button
                            className={activeTab === 'report' ? 'active' : ''}
                            onClick={() => setActiveTab('report')}
                        >
                            📊 Informe
                        </button>
                        <button
                            className={activeTab === 'technical' ? 'active' : ''}
                            onClick={() => setActiveTab('technical')}
                        >
                            🔧 Datos Técnicos
                        </button>
                        <button
                            className={activeTab === 'chat' ? 'active' : ''}
                            onClick={() => setActiveTab('chat')}
                        >
                            💬 Chat
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'report' && (
                            <div className="report-view">
                                <div className="view-header">
                                    <h3>📊 Informe Ejecutivo</h3>
                                    <button
                                        onClick={() => downloadFile(result.analysis, `informe_${result.mac}.txt`)}
                                        className="download-btn"
                                        disabled={!result.analysis}
                                    >
                                        💾 Guardar Informe
                                    </button>
                                </div>
                                <div className="analysis-report">
                                    {result.analysis || (loading ? 'Esperando informe de IA...' : 'Sin informe disponible')}
                                </div>
                            </div>
                        )}

                        {activeTab === 'technical' && (
                            <div className="technical-view">
                                <div className="view-header">
                                    <h3>🔧 Datos Técnicos en Bruto</h3>
                                    <button
                                        onClick={() => downloadFile(result.technicalData, `datos_${result.mac}.txt`)}
                                        className="download-btn"
                                        disabled={!result.technicalData}
                                    >
                                        💾 Guardar Datos
                                    </button>
                                </div>
                                <pre className="technical-data">
                                    {result.technicalData || (loading ? 'Recopilando datos...' : 'Sin datos disponibles')}
                                </pre>
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <div className="chat">
                                <div className="chat-messages">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`message ${msg.role}`}>
                                            <strong>{msg.role === 'user' ? 'Tú' : 'Asistente'}:</strong>
                                            <p>{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="chat-input">
                                    <input
                                        type="text"
                                        placeholder="Pregunta sobre los datos..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                    />
                                    <button onClick={sendChatMessage}>Enviar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {bulkResults.length > 0 && mode === 'bulk' && (
                <div className="bulk-results">
                    <h2>Resultados del Análisis Masivo</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>MAC</th>
                                <th>Estado</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bulkResults.map((r, idx) => (
                                <tr key={idx} className={r.status}>
                                    <td>{idx + 1}</td>
                                    <td>{r.mac}</td>
                                    <td>{r.status === 'success' ? '✅ Éxito' : '❌ Error'}</td>
                                    <td>{new Date(r.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
