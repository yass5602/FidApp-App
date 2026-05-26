// components/merchant/NotifsTab.jsx
import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { apiSendNotification, apiGetNotificationHistory, apiGetNotificationTargets  } from '../../utils/api'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"
const DM   = "'DM Sans', sans-serif"

const TEMPLATES = [
  { text: 'Nouveau menu de printemps dès ce matin !' },
  { text: 'Offre spéciale ce week-end — venez en profiter !' },
  { text: "Ça fait longtemps, on vous offre un café !" },
  { text: 'Merci pour votre fidélité, une surprise vous attend !' },
]

function TargetIcon({ id, color }) {
  if (id === 'all') return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1.6"/><path d="M1 17c0-3.314 2.686-6 6-6h0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><circle cx="13" cy="7" r="3" stroke={color} strokeWidth="1.6"/><path d="M13 11c3.314 0 6 2.686 6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></svg>
  if (id === 'loyal') return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5l2.16 4.37 4.84.7-3.5 3.41.83 4.82L10 13.27l-4.33 2.53.83-4.82L3 7.57l4.84-.7L10 2.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/></svg>
  if (id === 'inactive') return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6"/><path d="M10 6v4.5l3 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return null
}

export default function NotifsTab({ plan }) {
  const { showToast } = useApp()
  const isFreemium = plan === 'freemium'
  const [activeTab, setActiveTab] = useState('send')
  const [target,    setTarget]    = useState('all')
  const [message,   setMessage]   = useState('')
  const [sent,      setSent]      = useState(false)
  const [sending,   setSending]   = useState(false)
  const [history,   setHistory]   = useState([])
  const [targets, setTargets] = useState([
  { id: 'all',      label: 'Tous',     count: 0 },
  { id: 'loyal',    label: 'Fidèles',  count: 0 },
  { id: 'inactive', label: 'Inactifs', count: 0 },
])

// APRÈS
useEffect(() => {
  apiGetNotificationHistory()
    .then(setHistory)
    .catch(() => setHistory([]))
}, [sent])

useEffect(() => {
  apiGetNotificationTargets()
    .then(data => setTargets([
      { id: 'all',      label: 'Tous',     count: data.all      },
      { id: 'loyal',    label: 'Fidèles',  count: data.loyal    },
      { id: 'inactive', label: 'Inactifs', count: data.inactive },
    ]))
    .catch(() => {})
}, [])

  const totalSent = history.reduce((s, n) => s + (n.count || 0), 0)
  const tgInfo = targets.find(tg => tg.id === target)

  const handleSend = async () => {
    if (!message.trim() || sending) return
    setSending(true)
    try {
      // TODO prod : await apiSendNotification({ target, message })
      // APRÈS
  const result = await apiSendNotification({ target, message })
      setSent(true)
      showToast(`Notification envoyée à ${result.count} clients !`, '📲')
      setTimeout(() => { setSent(false); setMessage('') }, 2800)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 0, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)' }}>
        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340', marginBottom: 12 }}>Notifications</div>
        {/* Inner tabs */}
        <div style={{ display: 'flex', marginLeft: -22, marginRight: -22, paddingLeft: 22 }}>
          {[['send', 'Envoyer'], ['stats', 'Statistiques']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)} style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: DM, fontWeight: 600, fontSize: 14, color: activeTab === val ? '#FF5C3A' : '#8A8FA8', borderBottom: activeTab === val ? '2px solid #FF5C3A' : '2px solid transparent', transition: 'all 0.15s', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Onglet Envoyer ── */}
      {activeTab === 'send' && (
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audience */}
          <div>
            <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Destinataires</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {targets.map(tg => (
                <button key={tg.id} onClick={() => setTarget(tg.id)} style={{ flex: 1, padding: '11px 6px', borderRadius: 13, border: `1.5px solid ${target === tg.id ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`, background: target === tg.id ? 'rgba(255,92,58,0.10)' : '#fff', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <TargetIcon id={tg.id} color={target === tg.id ? '#FF5C3A' : '#8A8FA8'} />
                  <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 16, color: target === tg.id ? '#FF5C3A' : '#1B2340', fontVariantNumeric: 'tabular-nums' }}>{tg.count}</div>
                  <div style={{ fontFamily: DM, fontSize: 11, color: target === tg.id ? '#FF5C3A' : '#8A8FA8', fontWeight: 600 }}>{tg.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Modèles rapides</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => setMessage(tpl.text)} style={{ background: '#fff', border: `1px solid ${message === tpl.text ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`, borderRadius: 12, padding: '11px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center', transition: 'all 0.15s' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: message === tpl.text ? '#FF5C3A' : '#8A8FA8', flexShrink: 0 }} />
                  <span style={{ fontFamily: DM, fontSize: 13, color: '#1B2340', lineHeight: 1.4 }}>{tpl.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message personnalisé</div>
              <div style={{ fontFamily: DM, fontSize: 11, color: message.length > 140 ? '#FF4466' : '#8A8FA8', fontVariantNumeric: 'tabular-nums' }}>{message.length}/160</div>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Rédigez votre message…"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', background: '#F5F0E8', border: '1.5px solid rgba(27,35,64,0.08)', borderRadius: 13, padding: '12px 14px', fontSize: 14, color: '#1B2340', fontFamily: DM, resize: 'none', outline: 'none', lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = '#FF5C3A'}
              onBlur={e => e.target.style.borderColor = 'rgba(27,35,64,0.08)'}
            />
          </div>

          {/* Aperçu */}
          {message && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(27,35,64,0.08)' }}>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Aperçu</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1B2340, #2ECC9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 14, color: '#fff' }}>F</span>
                </div>
                <div>
                  <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 13, color: '#1B2340' }}>FidApp</div>
                  <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 2, lineHeight: 1.4 }}>{message}</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {sent ? (
            <div style={{ background: 'rgba(46,204,154,0.12)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid rgba(46,204,154,0.25)' }}>
              <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 16, color: '#2ECC9A' }}>Notification envoyée !</div>
              <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', marginTop: 4 }}>à {tgInfo?.count} clients</div>
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={isFreemium ? undefined : handleSend}
              disabled={isFreemium || !message.trim() || sending}
              style={{ background: isFreemium ? '#F2F4FF' : '#FF5C3A', color: isFreemium ? '#8A8FA8' : '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: isFreemium ? 'not-allowed' : 'pointer', opacity: (!isFreemium && (!message.trim() || sending)) ? 0.55 : 1, boxShadow: isFreemium ? 'none' : '0 4px 16px rgba(255,92,58,0.32)', transition: 'opacity 0.15s' }}
              >
              {sending ? 'Envoi en cours…' : `Envoyer à ${tgInfo?.count} client${tgInfo?.count > 1 ? 's' : ''}`}
            </button>
            {isFreemium && (
            <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', textAlign: 'center', lineHeight: 1.5 }}>
              Votre abonnement actuel ne vous permet pas d'accéder à cette fonctionnalité.
            </div>
            )}
          </div>
          )}
        </div>
        )}

      {/* ── Onglet Statistiques ── */}
      {activeTab === 'stats' && (
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Total envoyés</div>
              <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 26, color: '#FF5C3A', fontVariantNumeric: 'tabular-nums' }}>{totalSent}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Notifications</div>
              <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 26, color: '#2ECC9A', fontVariantNumeric: 'tabular-nums' }}>{history.length}</div>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: '#1B2340', marginBottom: 10 }}>Historique</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>
                  Aucune notification envoyée pour le moment.
                </div>
                ) : (
                history.map((n, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,92,58,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a4 4 0 00-4 4v2L1.5 9h11L11 7V5a4 4 0 00-4-4z" stroke="#FF5C3A" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5.5 10.5a1.5 1.5 0 003 0" stroke="#FF5C3A" strokeWidth="1.4"/></svg>
                    </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#1B2340', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontFamily: DM, fontSize: 11, color: '#8A8FA8', marginTop: 3 }}>
                      {n.target === 'all' ? 'Tous' : n.target === 'loyal' ? 'Fidèles' : 'Inactifs'} · {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', fontVariantNumeric: 'tabular-nums' }}>
                  {n.count} destinataire{n.count > 1 ? 's' : ''}
                </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
