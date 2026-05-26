// components/LoyaltyCard.jsx — adapté depuis fidelia-ui.jsx
import React from 'react'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"
const DM   = "'DM Sans', sans-serif"

/**
 * Carte de fidélité avec grille de tampons et barre de progression.
 * card = { merchant: { name, color1, color2, maxPoints, reward, logo, logoBase64?, bgImage? }, points }
 * compact = true → version réduite pour l'écran scan
 */
export default function LoyaltyCard({ card, compact = false }) {
  const { merchant, points } = card
  const { name, color1, color2, maxPoints, reward, logo, bgImage, logoBase64 } = merchant
  const pct      = Math.round((points / maxPoints) * 100)
  const complete = points >= maxPoints
  const cols     = maxPoints <= 5 ? maxPoints : maxPoints <= 10 ? 5 : 6
  const rows     = Math.ceil(maxPoints / cols)

  const bgStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)` }

  return (
    <div style={{
      borderRadius: 20,
      padding: compact ? '14px 18px' : '18px 22px',
      ...bgStyle,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      minHeight: compact ? 110 : 170,
    }}>
      {bgImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', pointerEvents: 'none' }} />}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: compact ? 8 : 12 }}>
          <div>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: compact ? 14 : 16, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.01em' }}>
              {name}
            </div>
            <div style={{ fontFamily: DM, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {points}/{maxPoints} tampons
            </div>
          </div>
          {logoBase64 ? (
            <img src={logoBase64} alt="logo" style={{ width: compact ? 32 : 38, height: compact ? 32 : 38, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{ width: compact ? 32 : 38, height: compact ? 32 : 38, borderRadius: 10, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SYNE, fontWeight: 800, fontSize: compact ? 15 : 17, color: '#fff', backdropFilter: 'blur(8px)' }}>
              {logo}
            </div>
          )}
        </div>

        {/* Stamps grid (masqué en compact) */}
        {!compact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} style={{ display: 'flex', gap: 7 }}>
                {Array.from({ length: cols }).map((_, c) => {
                  const idx    = r * cols + c
                  if (idx >= maxPoints) return null
                  const filled = idx < points
                  return (
                    <div key={c} style={{
                      width: 33, height: 33, borderRadius: '50%',
                      background:  filled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.16)',
                      border:      filled ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {filled && (
                        <svg width="13" height="10" viewBox="0 0 13 10">
                          <path d="M1.5 5L5 8.5L11.5 1.5" stroke={color1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.85)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          {!compact && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ fontFamily: DM, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Récompense</div>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 99 }}>
                {complete ? 'À réclamer !' : (reward?.split(' ').slice(0, 3).join(' ') + '…')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
