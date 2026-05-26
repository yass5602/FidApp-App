// components/merchant/CardCreatorTab.jsx
import React, { useState } from 'react'
import LoyaltyCard from '../LoyaltyCard'

const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"
const DM   = "'DM Sans', sans-serif"

const CATEGORIES = ['Café', 'Boulangerie', 'Restaurant', 'Librairie', 'Épicerie', 'Beauté', 'Sport', 'Autre']
const PALETTES = [
  ['#FF5C3A', '#FFB347'], ['#1B2340', '#2ECC9A'], ['#6366F1', '#2ECC9A'],
  ['#E91E8C', '#FF9800'], ['#00BCD4', '#3F51B5'], ['#2ECC9A', '#FFB347'],
]

function FInput({ label, value, onChange, type = 'text', placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ background: '#F5F0E8', border: `1.5px solid ${focused ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`, borderRadius: 12, padding: '13px 16px', fontSize: 15, color: '#1B2340', fontFamily: DM, outline: 'none', transition: 'border-color 0.15s' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export default function CardCreatorTab({ onCreated, limitReached, plan, cardLimit }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
  name: '', category: 'Café', maxPoints: 8, reward: '',
  color1: '#FF5C3A', color2: '#FFB347', logoBase64: null, bgImage: null,
  address: '',  // adresse du commerce — utilisée pour la géolocalisation client
  })
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => up('logoBase64', ev.target.result)
    reader.readAsDataURL(file)
  }
  const handleBgUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => up('bgImage', ev.target.result)
    reader.readAsDataURL(file)
  }

  const previewCard = {
    merchant: {
      name: form.name || 'Ma Carte', logo: (form.name || 'C').charAt(0).toUpperCase(),
      color1: form.color1, color2: form.color2, maxPoints: form.maxPoints,
      reward: form.reward, logoBase64: form.logoBase64, bgImage: form.bgImage,
    },
    points: 3,
  }

  const steps = ['Infos', 'Programme', 'Design']

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header + Stepper */}
      <div style={{ paddingTop: 16, paddingBottom: 14, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)' }}>
        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340', marginBottom: 14 }}>Créer une carte</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: i + 1 <= step ? '#FF5C3A' : '#F2F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                  {i + 1 < step
                    ? <svg width="12" height="9" viewBox="0 0 12 9"><path d="M1 4.5L4.5 8L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                    : <span style={{ fontFamily: DM, fontSize: 11, fontWeight: 700, color: i + 1 <= step ? '#fff' : '#8A8FA8' }}>{i + 1}</span>}
                </div>
                <span style={{ fontFamily: DM, fontSize: 10, fontWeight: 600, color: i + 1 <= step ? '#FF5C3A' : '#8A8FA8' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#FF5C3A' : 'rgba(27,35,64,0.08)', marginBottom: 14, transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* ── Étape 1 : Infos ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Logo upload */}
            <div>
              <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Logo du commerce</div>
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: form.logoBase64 ? 'transparent' : '#F2F4FF', border: `2px dashed ${form.logoBase64 ? 'transparent' : '#FF5C3A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {form.logoBase64
                      ? <img src={form.logoBase64} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#FF5C3A" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </div>
                  <div>
                    <div style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: '#FF5C3A' }}>{form.logoBase64 ? 'Changer le logo' : 'Ajouter un logo'}</div>
                    <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 2 }}>PNG, JPG · recommandé 1:1</div>
                  </div>
                </div>
              </label>
            </div>

            <FInput label="Nom du programme" value={form.name} onChange={v => up('name', v)} placeholder="Ex : Ma Carte Café" />

            <div>
              <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Catégorie</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => up('category', c)} style={{ padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${form.category === c ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`, background: form.category === c ? 'rgba(255,92,58,0.10)' : '#fff', cursor: 'pointer', fontFamily: DM, fontSize: 13, fontWeight: 600, color: form.category === c ? '#FF5C3A' : '#8A8FA8', transition: 'all 0.15s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <FInput label="Récompense finale" value={form.reward} onChange={v => up('reward', v)} placeholder="Ex : Un café offert" />
            <FInput label="Adresse du commerce" value={form.address} onChange={v => up('address', v)} placeholder="Ex : 12 rue de la Paix, Metz" /> 
          </div>
        )}

        {/* ── Étape 2 : Programme ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 2px 12px rgba(27,35,64,0.08)', border: '1px solid rgba(27,35,64,0.08)', textAlign: 'center' }}>
              <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Tampons nécessaires</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 16 }}>
                <button onClick={() => up('maxPoints', Math.max(1, form.maxPoints - 1))} style={{ width: 44, height: 44, borderRadius: '50%', background: '#F2F4FF', border: 'none', cursor: 'pointer', fontFamily: SYS, fontWeight: 700, fontSize: 22, color: '#1B2340' }}>−</button>
                <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 52, color: '#FF5C3A', minWidth: 72, textAlign: 'center', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{form.maxPoints}</span>
                <button onClick={() => up('maxPoints', Math.min(20, form.maxPoints + 1))} style={{ width: 44, height: 44, borderRadius: '50%', background: '#F2F4FF', border: 'none', cursor: 'pointer', fontFamily: SYS, fontWeight: 700, fontSize: 22, color: '#1B2340' }}>+</button>
              </div>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: form.maxPoints }).map((_, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#FF5C3A' : '#F2F4FF', border: `1.5px solid ${i === 0 ? '#FF5C3A' : 'rgba(27,35,64,0.08)'}`, transition: 'all 0.2s' }} />
                ))}
              </div>
            </div>
            {form.reward ? (
              <div style={{ background: 'rgba(255,92,58,0.10)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,92,58,0.15)' }}>
                <div style={{ fontFamily: DM, fontSize: 12, color: '#FF5C3A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Récompense au bout de {form.maxPoints} tampons</div>
                <div style={{ fontFamily: DM, fontSize: 15, fontWeight: 600, color: '#1B2340', marginTop: 5 }}>{form.reward}</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,179,71,0.12)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,179,71,0.25)' }}>
                <div style={{ fontFamily: DM, fontSize: 13, color: '#CC8800' }}>Aucune récompense définie — retournez à l'étape 1.</div>
              </div>
            )}
          </div>
        )}

        {/* ── Étape 3 : Design ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Preview live */}
            <LoyaltyCard card={previewCard} />

            {/* Background image */}
            <div>
              <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Image de fond (optionnel)</div>
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
                <div style={{ background: form.bgImage ? 'transparent' : '#F2F4FF', borderRadius: 14, height: 80, border: `2px dashed ${form.bgImage ? 'transparent' : 'rgba(27,35,64,0.08)'}`, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {form.bgImage
                    ? (<><img src={form.bgImage} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.45)', borderRadius: 99, padding: '6px 16px' }}><span style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#fff' }}>Changer l'image</span></div></>)
                    : (<><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 14l4-4 3 3 3-4 4 5" stroke="#8A8FA8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.5" fill="#8A8FA8"/></svg><span style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#8A8FA8' }}>Ajouter une photo de fond</span></>)}
                </div>
              </label>
              {form.bgImage && (
                <button onClick={() => up('bgImage', null)} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: DM, fontSize: 12, color: '#FF4466' }}>Supprimer l'image</button>
              )}
            </div>

            {/* Palettes */}
            {!form.bgImage && (
              <div>
                <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>Palette de couleurs</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {PALETTES.map(([c1, c2], i) => (
                    <button key={i} onClick={() => { up('color1', c1); up('color2', c2) }} style={{ width: 50, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${c1}, ${c2})`, border: `2.5px solid ${form.color1 === c1 ? '#1B2340' : 'transparent'}`, cursor: 'pointer', transition: 'transform 0.15s', transform: form.color1 === c1 ? 'scale(1.08)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Custom colors */}
            {!form.bgImage && (
              <div style={{ display: 'flex', gap: 12 }}>
                {[['color1', 'Couleur 1'], ['color2', 'Couleur 2']].map(([k, label]) => (
                  <div key={k} style={{ flex: 1 }}>
                    <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F0E8', borderRadius: 11, padding: '9px 12px', border: '1.5px solid rgba(27,35,64,0.08)', position: 'relative' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: form[k], border: '1.5px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                      <input type="color" value={form[k]} onChange={e => up(k, e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                      <label style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', fontVariantNumeric: 'tabular-nums' }}>{form[k]}</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blocage si limite atteinte */}
        {limitReached ? (
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,68,102,0.07)', borderRadius: 16, padding: '18px', border: '1px solid rgba(255,68,102,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
              <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: '#1B2340', marginBottom: 6 }}>
                Limite atteinte
              </div>
              <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', lineHeight: 1.6 }}>
                {plan === 'freemium'
                ? 'Le plan Freemium est limité à 1 programme. Passez au plan Solo pour en créer jusqu\'à 3.'
                : `Le plan Solo est limité à ${cardLimit} programmes. Passez au plan Multi pour un nombre illimité.`}
              </div>
            </div>
          </div>
          ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, background: 'rgba(27,35,64,0.08)', color: '#1B2340', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Retour
            </button>
            )}
            <button
              onClick={() => step < 3
              ? setStep(s => s + 1)
              : onCreated({ ...form, logo: (form.name || 'C').charAt(0).toUpperCase(), stats: { clients: 0, scans: 0, rewards: 0 }, lat: null, lng: null })
              }
              style={{ flex: 2, background: '#FF5C3A', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,92,58,0.32)' }}>
              {step < 3 ? 'Continuer' : 'Créer la carte'}
            </button>
          </div>
          )}
        
        
        </div>
      </div>
    )
}
