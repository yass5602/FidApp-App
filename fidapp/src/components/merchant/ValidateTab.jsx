// components/merchant/ValidateTab.jsx
import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { apiGetPendingRewards, apiRedeemReward } from '../../utils/api'
import { useNavigate } from 'react-router-dom'

const SYS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const DM  = "'DM Sans', sans-serif"

export default function ValidateTab() {
  const { showToast } = useApp()
  const navigate = useNavigate()
  const [code,     setCode]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [pending,  setPending]  = useState([])
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    apiGetPendingRewards()
      .then(setPending)
      .catch(() => setPending([]))
  }, [success])

  const handleRedeem = async () => {
    if (code.trim().length !== 6) {
      showToast('Le code doit contenir 6 caractères', '⚠️')
      return
    }
    setLoading(true)
    try {
      await apiRedeemReward(code.trim())
      showToast('Récompense validée !', '✅')
      setCode('')
      setSuccess(v => !v)  // recharge la liste
    } catch (e) {
      showToast(e.message || 'Code invalide', '❌')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
    {/* Header */}
    <div style={{ paddingTop: 16, paddingBottom: 12, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px 6px 0', color: '#FF5C3A', display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div>
        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340' }}>Valider une récompense</div>
        <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', marginTop: 3 }}>
          Saisissez le code présenté par votre client
        </div>
      </div>
    </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Saisie du code */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
          <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Code de validation
          </div>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="A3F9K2"
            maxLength={6}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#F5F0E8',
              border: `1.5px solid ${code.length === 6 ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`,
              borderRadius: 14, padding: '16px',
              fontSize: 28, fontFamily: 'monospace',
              fontWeight: 700, color: '#1B2340',
              letterSpacing: '0.3em', textAlign: 'center',
              outline: 'none', transition: 'border-color 0.15s',
            }}
          />
          <button
            onClick={handleRedeem}
            disabled={loading || code.trim().length !== 6}
            style={{
              marginTop: 12, width: '100%',
              background: code.trim().length === 6 ? '#FF5C3A' : '#F2F4FF',
              color: code.trim().length === 6 ? '#fff' : '#8A8FA8',
              border: 'none', borderRadius: 14, padding: '14px',
              fontFamily: DM, fontWeight: 700, fontSize: 15,
              cursor: code.trim().length === 6 ? 'pointer' : 'default',
              boxShadow: code.trim().length === 6 ? '0 4px 16px rgba(255,92,58,0.32)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Validation…' : 'Valider la récompense'}
          </button>
        </div>

        {/* Récompenses en attente */}
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: '#1B2340', marginBottom: 10 }}>
            En attente ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, textAlign: 'center', border: '1px solid rgba(27,35,64,0.08)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>
                Aucune récompense en attente
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((r, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1.5px solid rgba(255,179,71,0.3)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,179,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>🎁</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 14, color: '#1B2340' }}>
                      {r.clientName}
                    </div>
                    <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 2 }}>
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: '#FF5C3A', letterSpacing: '0.15em' }}>
                    {r.rewardCode}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}