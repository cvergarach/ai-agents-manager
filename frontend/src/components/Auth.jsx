import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Rocket, Brain, BarChart3, Database, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
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
        <button className="google-login-btn" onClick={handleGoogleLogin} style={{ width: 'auto', padding: '10px 20px' }}>
          Ingresar
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tag">Inteligencia Artificial Aplicada</div>
        <h1>Datos e Inteligencia Artificial que <span className="highlight">trabajan para tu negocio</span></h1>
        <p className="hero-description">
          En Datalive ayudamos a empresas a transformar datos en decisiones reales.
          No vendemos promesas: construimos soluciones que funcionan y generan impacto.
        </p>

        <div className="login-block">
          <button onClick={handleGoogleLogin} disabled={loading} className="google-login-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </button>
          {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}
        </div>
      </section>

      {/* Qué hacemos Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="section-header">
            <div className="hero-tag">🚀 ¿Qué hacemos?</div>
            <h2>Soluciones que se integran y escalan</h2>
            <p className="hero-description" style={{ textAlign: 'left', margin: '0' }}>
              Diseñamos e implementamos soluciones de IA y datos que atacan problemas concretos del negocio.
            </p>
          </div>

          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-icon"><Zap size={24} /></div>
              <div className="benefit-content">
                <h4>Automatización Inteligente</h4>
                <p>Procesos optimizados mediante algoritmos de IA.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><Brain size={24} /></div>
              <div className="benefit-content">
                <h4>Asistentes y Agentes</h4>
                <p>Agentes de IA para operaciones y atención al cliente.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><BarChart3 size={24} /></div>
              <div className="benefit-content">
                <h4>Análisis en Tiempo Real</h4>
                <p>Monitorización técnica y dashboards ejecutivos.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><Database size={24} /></div>
              <div className="benefit-content">
                <h4>Integración de Datos</h4>
                <p>Conexión fluida con ERP, CRM y bases de datos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofía Section */}
      <section className="hero-section" style={{ background: 'transparent' }}>
        <div className="hero-tag">🧠 Nuestra filosofía</div>
        <h2>La tecnología debe ser útil</h2>

        <div className="features-grid">
          <div className="feature-card">
            <CheckCircle2 color="#00F2FF" style={{ marginBottom: '20px' }} />
            <h3>Simple de usar</h3>
            <p>Interfaces intuitivas que eliminan la fricción tecnológica.</p>
          </div>
          <div className="feature-card">
            <CheckCircle2 color="#00F2FF" style={{ marginBottom: '20px' }} />
            <h3>Útil desde el día uno</h3>
            <p>Resultados tangibles y medibles de forma inmediata.</p>
          </div>
          <div className="feature-card">
            <CheckCircle2 color="#00F2FF" style={{ marginBottom: '20px' }} />
            <h3>Escalable</h3>
            <p>Sistemas diseñados para crecer sin necesidad de rehacer todo.</p>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="benefits-section" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="section-container">
          <div className="section-header">
            <div className="hero-tag">🔧 Cómo trabajamos</div>
            <h2>Metodología orientada a resultados</h2>
          </div>
          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>Entendemos tu problema</h4>
                <p>No partimos desde la tecnología, sino desde la necesidad.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Diseñamos un MVP</h4>
                <p>Solución mínima viable para validar rápido.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>Implementamos y Medimos</h4>
                <p>Ejecución rápida con monitorización de impacto.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>Escalamos</h4>
                <p>Expandimos la solución solo si genera valor real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-container">
          <p className="quote-text">
            “Cuando quieres algo, todo el universo conspira para que lo consigas.”
          </p>
          <p className="quote-author">— Paulo Coelho</p>
          <p style={{ marginTop: '40px', color: '#94a3b8' }}>
            En Datalive creemos que la claridad y la acción son esa conspiración.
          </p>
        </div>
      </section>

      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
        &copy; {new Date().getFullYear()} Datalive. Todos los derechos reservados.
      </footer>
    </div>
  )
}
