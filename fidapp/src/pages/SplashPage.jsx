// pages/SplashPage.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'

const DM   = "'DM Sans', sans-serif"
const SYNE = "'Syne', sans-serif"
//123456789s
export default function SplashPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate(user.role === 'merchant' ? '/merchant' : '/client', { replace: true })
  }, [user])

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #FF5C3A 0%, #FFB347 55%, #FF5C3A 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Décor */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 120, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

      {/* Badge bêta */}
      <div style={{ paddingTop: 56, paddingRight: 24, paddingLeft: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontFamily: DM, fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>BÊTA GRATUITE</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px 32px', textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', backdropFilter: 'blur(12px)', marginBottom: 28, border: '1.5px solid rgba(255,255,255,0.35)', animation: 'pop 0.5s 0.1s both' }}>
          <span style={{ fontFamily: SYNE, fontWeight: 900, fontSize: 42, color: '#fff', lineHeight: 1 }}>F</span>
        </div>

        <h1 style={{ fontFamily: SYNE, fontWeight: 900, fontSize: 42, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05, animation: 'fadeUp 0.5s 0.2s both' }}>
          Fid<span style={{ color: 'rgba(255,255,255,0.65)' }}>App</span>
        </h1>
        <p style={{ fontFamily: DM, fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: '14px 0 0', lineHeight: 1.6, maxWidth: 260, animation: 'fadeUp 0.5s 0.3s both' }}>
          La fidélité dématérialisée pour les commerces de proximité.
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.5s 0.4s both' }}>
          {['Gratuit', 'Sans carte physique', 'Commerce local'].map(label => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '6px 14px', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <span style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#fff' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300, animation: 'fadeUp 0.5s 0.5s both' }}>
          {[
            { emoji: '🛍️', text: 'Collectez des tampons chez vos commerçants préférés' },
            { emoji: '🎁', text: 'Débloquez des récompenses exclusives' },
            { emoji: '📲', text: 'Tout dans votre téléphone — zéro carte papier' },
          ].map(f => (
            <div key={f.emoji} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '11px 14px', backdropFilter: 'blur(6px)' }}>
              <span style={{ fontSize: 20 }}>{f.emoji}</span>
              <span style={{ fontFamily: DM, fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.4, textAlign: 'left' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '0 22px 48px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.5s 0.6s both' }}>
        <button
          onClick={() => navigate('/login', { state: { mode: 'register' } })}
          style={{ background: '#fff', color: '#FF5C3A', border: 'none', borderRadius: 16, padding: 15, fontFamily: DM, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,0,0,0.14)', transition: 'transform 0.1s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Commencer — c'est gratuit
        </button>
        <button
          onClick={() => navigate('/login', { state: { mode: 'login' } })}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 16, padding: 13, fontFamily: DM, fontWeight: 600, fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'transform 0.1s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          J'ai déjà un compte
        </button>
      </div>
    </div>
  )
}
