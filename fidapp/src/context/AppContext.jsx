// context/AppContext.jsx
// ⚠️ Casse exacte : AppContext.jsx — dossier context/ (minuscule)
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiLogout } from '../utils/api'

const AppCtx = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fid_user')) } catch { return null }
  })

  const login = useCallback((name, role, extra = {}) => {
    const u = { name, role, ...extra }
    setUser(u)
    localStorage.setItem('fid_user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null) // { msg, emoji }

  const showToast = useCallback((msg, emoji = '✅', ms = 2500) => {
    setToast({ msg, emoji, id: Date.now() })
    setTimeout(() => setToast(null), ms)
  }, [])

  // ── Confetti ──────────────────────────────────────────────────────────────
  const [confetti, setConfetti] = useState(false)

  const fireConfetti = useCallback(() => {
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2800)
  }, [])

  const value = { user, login, logout, toast, confetti, showToast, fireConfetti }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Hook principal — expose tout */
export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>')
  return ctx
}

/** Raccourci auth uniquement */
export function useAuth() {
  const { user, login, logout } = useApp()
  return { user, login, logout }
}
