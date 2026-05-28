// components/merchant/QRCodeTab.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../context/AppContext'
import { apiGenerateQRToken } from '../../utils/api'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const DM   = "'DM Sans', sans-serif"
const SYNE = "'Syne', sans-serif"

export default function QRCodeTab({ user, plan }) {
  const { showToast } = useApp()

  const [pulse,     setPulse]     = useState(false)
  const [seconds,   setSeconds]   = useState(60)
  const [qrToken,   setQrToken]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const isFreemium = plan === 'freemium'

  const renewToken = useCallback(async () => {
    try {
      const data = await apiGenerateQRToken()
      setQrToken(data.token)
      setSeconds(60)
      // Partage le token pour la simulation de scan (dev uniquement)
      } catch {
        showToast('Erreur de génération du QR', '❌')
      } finally {
      setLoading(false)
    }
  }, [])

  // Génération initiale + renouvellement auto toutes les 55s
// Freemium ET Solo/Multi appellent tous les deux l'API
// Freemium → isStatic:true, pas de renouvellement
// Solo/Multi → isStatic:false, renouvellement toutes les 55s
useEffect(() => {
  renewToken()
  if (!isFreemium) {
    const interval = setInterval(renewToken, 55_000)
    return () => clearInterval(interval)
  }
}, [isFreemium, renewToken])

  // Countdown visuel + pulse badge
  useEffect(() => {
    if (isFreemium) return
    const p = setInterval(() => setPulse(v => !v), 1800)
    const s = setInterval(() => setSeconds(v => v <= 1 ? 60 : v - 1), 1000)
    return () => { clearInterval(p); clearInterval(s) }
  }, [isFreemium])

  const handleLockedAction = () => {
    setActionMsg("Votre abonnement actuel ne vous permet pas d'accéder à cette fonctionnalité.")
    setTimeout(() => setActionMsg(''), 3000)
  }

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 12, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)' }}>
        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340' }}>Mon QR Code</div>
        <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', marginTop: 3 }}>
          {isFreemium ? 'QR statique — passez au plan Solo pour le dynamique' : 'Vos clients scannent ce code pour cumuler des points.'}
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* QR card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 20px', boxShadow: '0 4px 24px rgba(27,35,64,0.10)', border: '1px solid rgba(27,35,64,0.08)', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}>

          {/* Badge actif */}
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(46,204,154,0.12)', borderRadius: 99, padding: '4px 11px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ECC9A', boxShadow: `0 0 0 ${pulse ? 5 : 2}px rgba(46,204,154,0.33)`, transition: 'box-shadow 0.5s' }} />
            <span style={{ fontFamily: DM, fontSize: 11, fontWeight: 700, color: '#2ECC9A' }}>Actif</span>
          </div>

          {/* QR */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 2px 14px rgba(0,0,0,0.08)', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading
            ? <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>Génération…</div>
            : qrToken
            ? <QRCodeSVG value={qrToken} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            : <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>Erreur de génération</div>
          }
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 17, color: '#1B2340' }}>{user?.name || 'Mon Commerce'}</div>
            <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 3 }}>
              {isFreemium ? 'QR statique' : 'Token JWT · renouvellement auto'}
            </div>
          </div>

          {/* Countdown Solo/Multi */}
          {!isFreemium ? (
            <div style={{ width: '100%', background: '#F2F4FF', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6" stroke="#8A8FA8" strokeWidth="1.5"/>
                <path d="M7.5 4.5v3.5l2 1.5" stroke="#8A8FA8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: 'rgba(27,35,64,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${(seconds / 60) * 100}%`, height: '100%', background: seconds > 15 ? '#2ECC9A' : '#FF4466', borderRadius: 99, transition: 'width 1s linear, background 0.3s' }} />
                </div>
              </div>
              <span style={{ fontFamily: DM, fontSize: 13, fontWeight: 700, color: seconds > 15 ? '#2ECC9A' : '#FF4466', fontVariantNumeric: 'tabular-nums', minWidth: 28 }}>{seconds}s</span>
            </div>
          ) : (
            <div style={{ width: '100%', background: 'rgba(138,143,168,0.08)', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(138,143,168,0.15)' }}>
              <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', textAlign: 'center' }}>
                🔒 QR dynamique disponible à partir du plan Solo
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={isFreemium ? handleLockedAction : () => {
                if (navigator.share) {
                  navigator.share({ title: 'FidApp', text: "Rejoignez-moi sur FidApp !", url: 'https://fid-app.vercel.app' })
                } else {
                  navigator.clipboard?.writeText('https://fid-app.vercel.app')
                  setActionMsg('Lien copié !')
                  setTimeout(() => setActionMsg(''), 2500)
                }
              }}
              style={{ flex: 1, background: isFreemium ? '#F2F4FF' : '#fff', border: `1.5px solid ${isFreemium ? 'rgba(27,35,64,0.06)' : 'rgba(27,35,64,0.08)'}`, borderRadius: 14, padding: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1v9.5M5 6l3.5 4 3.5-4M2 12.5v1.5a2 2 0 002 2h9a2 2 0 002-2v-1.5" stroke={isFreemium ? '#8A8FA8' : '#1B2340'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontFamily: DM, fontSize: 14, fontWeight: 600, color: isFreemium ? '#8A8FA8' : '#1B2340' }}>Partager</span>
            </button>
            <button
              onClick={isFreemium ? handleLockedAction : () => { renewToken(); showToast('QR renouvelé !', '🔄') }}
              style={{ flex: 1, background: isFreemium ? '#F2F4FF' : 'rgba(255,92,58,0.10)', border: `1.5px solid ${isFreemium ? 'rgba(27,35,64,0.06)' : 'rgba(255,92,58,0.2)'}`, borderRadius: 14, padding: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M14 3l-4 4m0-4h4v4" stroke={isFreemium ? '#8A8FA8' : '#FF5C3A'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 8a6 6 0 006 6" stroke={isFreemium ? '#8A8FA8' : '#FF5C3A'} strokeWidth="1.7" strokeLinecap="round"/></svg>
              <span style={{ fontFamily: DM, fontSize: 14, fontWeight: 600, color: isFreemium ? '#8A8FA8' : '#FF5C3A' }}>Renouveler</span>
            </button>
          </div>
          {actionMsg && (
            <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', textAlign: 'center', lineHeight: 1.5 }}>
              {actionMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}