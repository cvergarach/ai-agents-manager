import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Brain, BarChart3, Database, Zap, CheckCircle2 } from 'lucide-react'
import '../styles/Auth.css'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Navbar */}
      <nav className="nav-container">
        <div className="logo">DATALIVE</div>
        <button className="google-login-btn" onClick={handleGoogleLogin} style={{ padding: '8px 20px', fontSize: '14px' }}>
          Ingresar
        </button>
      </nav>

      {/* Hero Section */}
      <header className="hero-content">
        <div className="hero-tag">Inteligencia Artificial Aplicada</div>
        <h1>Datos e Inteligencia Artificial que <span className="highlight">trabajan para tu negocio</span></h1>
        <p className="hero-desc">
          Transformamos datos en decisiones reales mediante IA avanzada, automatización y analítica predictiva.
          Soluciones con impacto directo en tus resultados.
        </p>

        <div className="login-area">
          <button onClick={handleGoogleLogin} disabled={loading} className="google-login-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </button>
        </div>
        {error && <div className="error-message" style={{ color: '#ef4444', fontSize: '14px' }}>{error}</div>}
      </header>

      {/* Services Grid */}
      <section className="section-wrap" style={{ borderTop: '1px solid var(--dl-border)' }}>
        <h2 className="section-title">🚀 Nuestras Soluciones</h2>
        <div className="features-grid">
          <div className="card">
            <Zap className="card-icon" size={24} />
            <h4>Automatización Inteligente</h4>
            <p>Optimizamos procesos operativos reduciendo costos y errores manuales.</p>
          </div>
          <div className="card">
            <Brain className="card-icon" size={24} />
            <h4>Agentes de IA</h4>
            <p>Sistemas conversacionales avanzados para atención y soporte técnico.</p>
          </div>
          <div className="card">
            <BarChart3 className="card-icon" size={24} />
            <h4>Analítica Predictiva</h4>
            <p>Dashboards en tiempo real para anticipar tendencias y comportamientos.</p>
          </div>
          <div className="card">
            <Database className="card-icon" size={24} />
            <h4>Integración de Datos</h4>
            <p>Conectamos silos de información (ERP, CRM) en una sola fuente de verdad.</p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-wrap">
        <h2 className="section-title">🧠 Filosofía Datalive</h2>
        <div className="features-grid">
          <div className="card">
            <CheckCircle2 className="card-icon" size={20} />
            <h4>Útil desde el día 1</h4>
            <p>Implementación rápida orientada a resultados tangibles.</p>
          </div>
          <div className="card">
            <CheckCircle2 className="card-icon" size={20} />
            <h4>Simple y Adoptable</h4>
            <p>Tecnología compleja con interfaces fáciles de usar.</p>
          </div>
          <div className="card">
            <CheckCircle2 className="card-icon" size={20} />
            <h4>Escalable</h4>
            <p>Construimos sobre bases sólidas que crecen con tu negocio.</p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-wrap" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <h2 className="section-title">🔧 Cómo trabajamos</h2>
        <div className="split-grid">
          <div className="step">
            <div className="step-num">01</div>
            <div>
              <h4>Entendimiento</h4>
              <p>Detectamos el problema de negocio antes de la tecnología.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div>
              <h4>MVP</h4>
              <p>Diseñamos la solución mínima de alto impacto.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div>
              <h4>Medición</h4>
              <p>Validamos resultados con datos reales y KPIs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-box">
        <p className="quote-text">
          “Cuando quieres algo, todo el universo conspira para que lo consigas.”
        </p>
        <p className="quote-author">— Paulo Coelho</p>
        <p style={{ marginTop: '32px', color: 'var(--dl-text-alt)', fontSize: '15px' }}>
          La claridad y la acción son esa conspiración.
        </p>
      </section>

      <footer className="dl-footer">
        &copy; {new Date().getFullYear()} Datalive. IA y Datos al servicio del negocio.
      </footer>
    </div>
  )
}
