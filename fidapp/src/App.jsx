// App.jsx
import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useAuth, useApp } from './context/AppContext'
import SplashPage   from './pages/SplashPage'
import LoginPage    from './pages/LoginPage'
import ClientPage   from './pages/ClientPage'
import MerchantPage from './pages/MerchantPage'
import PricingPage  from './pages/PricingPage'
import Toast        from './components/UI/Toast'
import Confetti     from './components/UI/Confetti'

const DM   = "'DM Sans', sans-serif"
const SYNE = "'Syne', sans-serif" 

// ── ProtectedRoute ────────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'merchant' ? '/merchant' : '/client'} replace />
  }
  return children
}

// ── StatusBar ─────────────────────────────────────────────────────────────────
function StatusBar({ theme, onToggleTheme }) {
  const [time, setTime] = React.useState(() => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })), 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ height: 44, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', flexShrink: 0 }}>
      <span style={{ fontFamily: SYNE, fontWeight: 900, fontSize: 16, color: '#1B2340', letterSpacing: '-0.02em' }}>
        Fid<span style={{ color: '#FF5C3A' }}>App</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#8A8FA8', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        <button onClick={onToggleTheme} title="Bascule thème (démo)" style={{ width: 32, height: 20, borderRadius: 99, border: 'none', cursor: 'pointer', background: theme === 'dark' ? '#FF5C3A' : '#F2F4FF', display: 'flex', alignItems: 'center', padding: 2, transition: 'background 0.2s' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: theme === 'dark' ? 'translateX(12px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
        </button>
      </div>
    </div>
  )
}

// ── AppInner ──────────────────────────────────────────────────────────────────
function AppInner() {
  const { toast, confetti } = useApp()
  const { user } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('fid_theme') || 'light' } catch { return 'light' }
  })

  const isSplash = location.pathname === '/'
  const showStatusBar = !isSplash && !!user

  const toggleTheme = () => setTheme(t => {
    const next = t === 'light' ? 'dark' : 'light'
    try { localStorage.setItem('fid_theme', next) } catch {}
    return next
  })

  return (
    <div className="app">
      {showStatusBar && <StatusBar theme={theme} onToggleTheme={toggleTheme} />}

      {toast    && <Toast msg={toast.msg} emoji={toast.emoji} key={toast.id} />}
      {confetti && <Confetti />}

      <Routes>
        <Route path="/"       element={<SplashPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/client" element={
          <ProtectedRoute requiredRole="client">
            <ClientPage />
          </ProtectedRoute>
        } />
        <Route path="/merchant" element={
          <ProtectedRoute requiredRole="merchant">
            <MerchantPage />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute requiredRole="merchant">
            <PricingPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
