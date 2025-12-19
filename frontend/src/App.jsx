import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import WiFiAnalyzer from './pages/WiFiAnalyzer'
import PromptConfig from './pages/PromptConfig'
import './styles/App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Simple routing
    const path = window.location.pathname
    if (path === '/wifi') {
      setCurrentPage('wifi')
    } else if (path === '/wifi/config') {
      setCurrentPage('config')
    } else {
      setCurrentPage('dashboard')
    }

    // Listen to popstate for back/forward navigation
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/wifi') {
        setCurrentPage('wifi')
      } else if (path === '/wifi/config') {
        setCurrentPage('config')
      } else {
        setCurrentPage('dashboard')
      }
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  // Render based on current page
  if (currentPage === 'wifi') {
    return <WiFiAnalyzer />
  }

  if (currentPage === 'config') {
    return <PromptConfig />
  }

  return <Dashboard />
}
