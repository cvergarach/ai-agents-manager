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
    <div className="dl-landing-page">
      {/* Navbar */}
      <nav className="dl-navbar">
        <div /> {/* Spacer for grid alignment */}
        <div className="dl-logo">
          <img src="/assets/datalive-logo.png" alt="Logo" className="dl-logo-img" />
          <span className="dl-logo-text">DATALIVE</span>
        </div>
        <div className="dl-nav-right">
          <button className="dl-google-btn" onClick={handleGoogleLogin} style={{ padding: '8px 18px', fontSize: '13px' }}>
            Ingresar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="dl-hero">
        <div className="dl-tag">Inteligencia Artificial Aplicada</div>
        <h1 className="dl-brand-title">DATALIVE</h1>
        <p className="dl-hero-tagline">
          Datos e Inteligencia Artificial que <span className="highlight">trabajan para tu negocio</span>
        </p>
        <p className="dl-hero-desc">
          Transformamos datos en decisiones reales mediante IA avanzada, automatización y analítica predictiva de alto impacto.
        </p>

        <div className="dl-login-wrapper">
          <button onClick={handleGoogleLogin} disabled={loading} className="dl-google-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </button>
        </div>
        {error && <div style={{ color: '#f87171', marginTop: '-20px', marginBottom: '40px' }}>{error}</div>}
      </header>

      {/* Solutions Grid */}
      <section id="soluciones" className="dl-section" style={{ borderTop: '1px solid var(--dl-border)' }}>
        <h2 className="dl-section-title">Nuestras Soluciones</h2>
        <div className="dl-grid">
          <div className="dl-card">
            <div className="dl-icon-container"><Zap size={24} /></div>
            <h4>Automatización Inteligente</h4>
            <p>Optimizamos procesos operativos críticos mediante algoritmos que reducen costos y eliminan errores humanos.</p>
          </div>
          <div className="dl-card">
            <div className="dl-icon-container"><Brain size={24} /></div>
            <h4>Agentes de IA</h4>
            <p>Agentes inteligentes diseñados para integrarse en tu operación y mejorar la atención técnica y comercial.</p>
          </div>
          <div className="dl-card">
            <div className="dl-icon-container"><BarChart3 size={24} /></div>
            <h4>Analítica Predictiva</h4>
            <p>Convertimos el flujo de datos en tiempo real en dashboards de control y modelos de predicción de negocio.</p>
          </div>
          <div className="dl-card">
            <div className="dl-icon-container"><Database size={24} /></div>
            <h4>Integración de Datos</h4>
            <p>Sincronizamos tus fuentes de información actuales para crear una estructura de datos robusta y accionable.</p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="filosofia" className="dl-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <h2 className="dl-section-title">Filosofía Datalive</h2>
        <div className="dl-grid">
          <div className="dl-card">
            <CheckCircle2 color="var(--dl-primary)" style={{ marginBottom: '16px' }} />
            <h4>Útil desde el día uno</h4>
            <p>Creemos en la tecnología que genera valor medible de forma inmediata, no en experimentos eternos.</p>
          </div>
          <div className="dl-card">
            <CheckCircle2 color="var(--dl-primary)" style={{ marginBottom: '16px' }} />
            <h4>Simple y Adoptable</h4>
            <p>La potencia técnica no sirve de nada si es difícil de usar. Priorizamos la usabilidad corporativa.</p>
          </div>
          <div className="dl-card">
            <CheckCircle2 color="var(--dl-primary)" style={{ marginBottom: '16px' }} />
            <h4>Escalable de verdad</h4>
            <p>Construimos sobre arquitecturas modernas que permiten crecer sin fricciones ni retrabajo técnico.</p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="metodo" className="dl-section">
        <h2 className="dl-section-title">Cómo trabajamos</h2>
        <div className="dl-grid dl-grid-method">
          <div className="dl-step-item">
            <div className="dl-step-number">01</div>
            <div>
              <h4>Entendimiento</h4>
              <p>Diagnosticamos el problema de negocio real antes de proponer cualquier solución técnica.</p>
            </div>
          </div>
          <div className="dl-step-item">
            <div className="dl-step-number">02</div>
            <div>
              <h4>MVP Impacto</h4>
              <p>Diseñamos e implementamos una solución mínima viable para validar el retorno rápido.</p>
            </div>
          </div>
          <div className="dl-step-item">
            <div className="dl-step-number">03</div>
            <div>
              <h4>Escalado</h4>
              <p>Expandimos y automatizamos sobre resultados probados, asegurando la adopción total.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="dl-quote-area">
        <p className="dl-quote-text">
          “Cuando quieres algo, todo el universo conspira para que lo consigas.”
        </p>
        <p className="dl-quote-sub">— Paulo Coelho</p>
        <p style={{ marginTop: '32px', color: 'var(--dl-text-alt)', fontSize: '16px' }}>
          En Datalive, construimos esa conspiración mediante claridad y acción técnica.
        </p>
      </section>

      <footer className="dl-footer">
        <div className="dl-section">
          &copy; {new Date().getFullYear()} Datalive. IA y Datos aplicados al impacto empresarial.
        </div>
      </footer>
    </div>
  )
}
