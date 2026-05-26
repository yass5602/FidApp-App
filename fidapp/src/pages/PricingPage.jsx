// pages/PricingPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUpdatePlan } from '../utils/api'
import { useApp } from '../context/AppContext'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"
const DM   = "'DM Sans', sans-serif"

function getPlans(currentPlan) {
  return [
    {
      id: 'freemium',
      label: 'Freemium',
      price: '0€',
      period: 'pour toujours',
      color: '#8A8FA8',
      bg: 'rgba(138,143,168,0.08)',
      border: 'rgba(138,143,168,0.2)',
      features: ["1 programme de fidélité", "QR code statique", "Jusqu'à 50 clients", "Sans notifications"],
    },
    {
      id: 'solo',
      label: 'Solo',
      price: '19€',
      period: 'par mois',
      color: '#FF5C3A',
      bg: 'rgba(255,92,58,0.07)',
      border: 'rgba(255,92,58,0.25)',
      highlight: true,
      features: ["3 programmes de fidélité", "QR code dynamique (JWT 60s)", "Clients illimités", "Notifications push incluses"],
    },
    {
      id: 'multi',
      label: 'Multi',
      price: '49€',
      period: 'par mois',
      color: '#6366F1',
      bg: 'rgba(99,102,241,0.07)',
      border: 'rgba(99,102,241,0.25)',
      features: ["Établissements illimités", "QR dynamique + Analytics", "API dédiée", "Support prioritaire"],
    },
  ].map(p => ({
    ...p,
    isCurrent:   p.id === currentPlan,
    cta:         p.id === currentPlan ? 'Votre plan actuel' : `Souscrire — ${p.price}${p.period === 'pour toujours' ? '' : '/mois'}`,
    ctaDisabled: p.id === currentPlan,
  }))
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { user, login, showToast } = useApp()
  const currentPlan = user?.plan || 'freemium'

  const plans = getPlans(currentPlan)
  

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8F0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 16, paddingLeft: 20, paddingRight: 20, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px 6px 0', color: '#FF5C3A', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 19, color: '#1B2340' }}>
            {"Changer d'abonnement"}
          </div>
          <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 2 }}>
            Plan actuel : <span style={{ fontWeight: 700, color: '#1B2340', textTransform: 'capitalize' }}>{currentPlan}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ background: '#fff', borderRadius: 20, padding: '22px 20px', border: `1.5px solid ${plan.isCurrent ? plan.border : plan.border}`, boxShadow: plan.highlight ? '0 8px 32px rgba(255,92,58,0.12)' : '0 2px 12px rgba(27,35,64,0.06)', position: 'relative', overflow: 'hidden' }}>

            {/* Badge "Recommandé" */}
            {plan.highlight && !plan.isCurrent && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: '#FF5C3A', borderRadius: 99, padding: '3px 10px' }}>
                <span style={{ fontFamily: DM, fontSize: 11, fontWeight: 700, color: '#fff' }}>Recommandé</span>
              </div>
            )}

            {/* Badge "Plan actuel" */}
            {plan.isCurrent && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: plan.bg, borderRadius: 99, padding: '3px 10px', border: `1px solid ${plan.border}` }}>
                <span style={{ fontFamily: DM, fontSize: 11, fontWeight: 700, color: plan.color }}>Plan actuel</span>
              </div>
            )}

            {/* Nom + Prix */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 22, color: plan.color }}>{plan.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontFamily: SYNE, fontWeight: 900, fontSize: 36, color: '#1B2340' }}>{plan.price}</span>
                <span style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8' }}>{plan.period}</span>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: plan.bg, border: `1px solid ${plan.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <span style={{ fontFamily: DM, fontSize: 14, color: '#1B2340' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Bouton */}
            <button
              disabled={plan.ctaDisabled}
            // APRÈS
            onClick={async () => {
              if (plan.ctaDisabled) return
              try {
                await apiUpdatePlan(plan.id)
                login(user.name, user.role, { ...user, plan: plan.id })
                showToast(`Plan ${plan.label} activé !`, '✅')
                navigate(-1)
              } catch (e) {
                showToast(e.message || 'Erreur lors du changement de plan', '❌')
              }
            }}
              style={{ width: '100%', background: plan.ctaDisabled ? '#F2F4FF' : plan.color, color: plan.ctaDisabled ? '#8A8FA8' : '#fff', border: 'none', borderRadius: 14, padding: '14px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: plan.ctaDisabled ? 'default' : 'pointer', boxShadow: plan.ctaDisabled ? 'none' : `0 4px 16px ${plan.color}44` }}
            >
              {plan.cta}
            </button>
          </div>
        ))}

        <div style={{ background: 'rgba(27,35,64,0.04)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', lineHeight: 1.6, textAlign: 'center' }}>
            En production, le paiement sera traité via Payoneer.
          </div>
        </div>
      </div>
    </div>
  )
}