// components/merchant/DashboardTab.jsx
import React, { useState, useEffect } from 'react'
import { apiGetMerchantStats } from '../../utils/api'

const SYS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const DM  = "'DM Sans', sans-serif"

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 12px rgba(27,35,64,0.08)', border: '1px solid rgba(27,35,64,0.08)' }}>
      <div style={{ fontFamily: DM, fontSize: 11, color: '#8A8FA8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: accent || '#1B2340', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontFamily: DM, fontSize: 12, color: '#2ECC9A', marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardTab({ user, cards, onTab }) {
  const [period, setPeriod] = useState('week')
  const [stats,  setStats]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiGetMerchantStats(period)
      .then(data => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [period])

  // Activité récente construite depuis les vraies cartes
  const activity = cards.slice(0, 5).map((card, i) => ({
    name:   card.name || `Programme ${i + 1}`,
    action: `${card.stats?.scans || 0} scans · ${card.stats?.clients || 0} clients`,
    dot:    '#FF5C3A',
  }))

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 12, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>Tableau de bord</div>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340', letterSpacing: '-0.01em', marginTop: 1 }}>
              {user?.name || 'Mon Commerce'}
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#F2F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3" stroke="#8A8FA8" strokeWidth="1.6"/>
              <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#8A8FA8" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Filtre période */}
        <div style={{ display: 'flex', background: '#F2F4FF', borderRadius: 11, padding: 3, gap: 3, marginTop: 12 }}>
          {[['today', "Aujourd'hui"], ['week', 'Cette semaine'], ['month', 'Ce mois']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: DM, fontWeight: 600, fontSize: 12, background: period === val ? '#fff' : 'transparent', color: period === val ? '#FF5C3A' : '#8A8FA8', boxShadow: period === val ? '0 2px 12px rgba(27,35,64,0.08)' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* KPIs */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', height: 80, opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <KPICard label="Clients"     value={stats?.clients}    sub={`+${stats?.newClients ?? 0} nouveaux`} accent="#FF5C3A" />
            <KPICard label="Scans"       value={stats?.scans}      accent="#2ECC9A" />
            <KPICard label="Récompenses" value={stats?.rewards}    accent="#FFB347" />
            <KPICard label="Nouveaux"    value={stats?.newClients} accent="#FF5C3A" />
          </div>
        )}

        {/* Actions rapides */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'QR Code', tab: 'qr',     color: '#FF5C3A', bg: 'rgba(255,92,58,0.10)',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M11 11h2m4 0h-2m-2 2v4M15 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
            { label: 'Notifier', tab: 'notifs', color: '#FFB347', bg: 'rgba(255,179,71,0.12)', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1a5 5 0 00-5 5v2.5L2.5 11h13L14 8.5V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M7 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6"/></svg> },
            { label: 'Créer',   tab: 'create', color: '#2ECC9A', bg: 'rgba(46,204,154,0.12)', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
          ].map(a => (
            <button key={a.tab} onClick={() => onTab(a.tab)} style={{ flex: 1, background: '#fff', border: '1px solid rgba(27,35,64,0.08)', borderRadius: 14, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, boxShadow: '0 2px 12px rgba(27,35,64,0.08)', transition: 'transform 0.1s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>{a.icon}</div>
              <span style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#1B2340' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Activité — programmes actifs */}
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: '#1B2340', marginBottom: 10 }}>
            {cards.length > 0 ? 'Mes programmes' : 'Activité récente'}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(27,35,64,0.08)' }}>
            {cards.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>
                Aucun programme actif — créez votre première carte.
              </div>
            ) : (
              cards.map((card, i) => (
                <div key={i} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: i < cards.length - 1 ? '1px solid rgba(27,35,64,0.06)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5C3A', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: '#1B2340' }}>{card.name}</div>
                    <div style={{ fontFamily: DM, fontSize: 11, color: '#8A8FA8' }}>
                      {card.stats?.clients || 0} clients · {card.stats?.scans || 0} scans · {card.maxPoints} tampons
                    </div>
                  </div>
                  <div style={{ fontFamily: DM, fontSize: 11, color: '#8A8FA8', flexShrink: 0 }}>
                    {card.reward?.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}