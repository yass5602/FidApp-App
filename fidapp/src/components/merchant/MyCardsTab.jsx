// components/merchant/MyCardsTab.jsx
import React, { useState } from 'react'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"
const DM   = "'DM Sans', sans-serif"

export default function MyCardsTab({ cards, onDelete, onTab }) {
  const [confirmIdx, setConfirmIdx] = useState(null)

  const handleDelete = (i) => {
    onDelete(i)
    setConfirmIdx(null)
  }

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 12, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340' }}>Mes cartes</div>
          <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', marginTop: 2 }}>
            {cards.length} programme{cards.length > 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={() => onTab('create')} style={{ background: '#FF5C3A', border: 'none', borderRadius: 11, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'transform 0.1s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <span style={{ fontFamily: DM, fontSize: 13, fontWeight: 700, color: '#fff' }}>Créer</span>
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 17, color: '#1B2340', marginBottom: 7 }}>Aucune carte créée</div>
            <div style={{ fontFamily: DM, fontSize: 14, color: '#8A8FA8', marginBottom: 20 }}>Créez votre premier programme de fidélité.</div>
            <button onClick={() => onTab('create')} style={{ background: '#FF5C3A', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Créer ma première carte
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cards.map((card, i) => {
              const c1 = card.color1 || '#FF5C3A'
              const c2 = card.color2 || '#FFB347'
              return (
                <div key={i} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,35,64,0.08)', border: '1px solid rgba(27,35,64,0.08)' }}>
                  {/* Card preview */}
                  <div style={{ padding: 14, background: card.bgImage ? 'transparent' : `linear-gradient(135deg, ${c1}, ${c2})`, position: 'relative', minHeight: 72 }}>
                    {card.bgImage && <img src={card.bgImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {card.bgImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: '#fff' }}>{card.name}</div>
                        <div style={{ fontFamily: DM, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{card.maxPoints} tampons · {card.reward || '—'}</div>
                      </div>
                      {card.logoBase64 ? (
                        <img src={card.logoBase64} alt="logo" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SYNE, fontWeight: 800, fontSize: 15, color: '#fff' }}>
                          {card.logo || card.name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ padding: '10px 14px', display: 'flex', gap: 14, borderBottom: '1px solid rgba(27,35,64,0.08)' }}>
                    {[
                      { l: 'Clients',     v: card.stats?.clients  || 0, c: '#FF5C3A' },
                      { l: 'Scans',       v: card.stats?.scans    || 0, c: '#2ECC9A' },
                      { l: 'Récompenses', v: card.stats?.rewards  || 0, c: '#FFB347' },
                    ].map(s => (
                      <div key={s.l} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 17, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                        <div style={{ fontFamily: DM, fontSize: 10, color: '#8A8FA8' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {confirmIdx === i ? (
                    <div style={{ padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', flex: 1 }}>Supprimer définitivement ?</span>
                      <button onClick={() => handleDelete(i)} style={{ background: '#FF4466', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontFamily: DM, fontSize: 12, fontWeight: 700 }}>Oui</button>
                      <button onClick={() => setConfirmIdx(null)} style={{ background: '#F2F4FF', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#1B2340' }}>Annuler</button>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                      <button onClick={() => onTab('qr')} style={{ flex: 1, background: 'rgba(255,92,58,0.10)', border: 'none', borderRadius: 9, padding: 8, cursor: 'pointer', fontFamily: DM, fontSize: 12, fontWeight: 700, color: '#FF5C3A' }}>QR Code</button>
                      <button onClick={() => onTab('notifs')} style={{ flex: 1, background: '#F2F4FF', border: 'none', borderRadius: 9, padding: 8, cursor: 'pointer', fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#1B2340' }}>Notifier</button>
                      <button onClick={() => setConfirmIdx(i)} style={{ background: 'rgba(255,68,102,0.10)', border: 'none', borderRadius: 9, padding: '8px 11px', cursor: 'pointer' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6v4.5M8.5 6v4.5M2.5 3.5l.75 8a1 1 0 00.997.917h5.506a1 1 0 00.997-.916l.75-8" stroke="#FF4466" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
