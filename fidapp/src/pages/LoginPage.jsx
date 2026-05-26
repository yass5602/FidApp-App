// pages/LoginPage.jsx — adapté depuis fidelia-auth.jsx
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { INVITE_CODES } from '../constants/merchants'
import { apiRegister, apiLogin } from '../utils/api'

const DM   = "'DM Sans', sans-serif"
const SYS  = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const SYNE = "'Syne', sans-serif"

// ── Règles de validation ──────────────────────────────────────────────────────
// Centralisées ici : une seule source de vérité pour toutes les règles du formulaire.
// À dupliquer côté backend (auth.controller.js) pour une double validation.
const RULES = {
  name: {
    regex: /^[a-zA-ZÀ-ÿ\s]{2,30}$/,
    msg: '2 à 30 lettres uniquement',
  },
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
    msg: 'Format attendu : nom@domaine.fr',
  },
  password: {
    regex: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
    msg: '6 caractères min, 1 lettre + 1 chiffre',
  },
}

// Retourne le message d'erreur ou "" si valide
function validate(field, value) {
  if (!value || !value.trim()) return 'Ce champ est requis'
  if (!RULES[field].regex.test(value)) return RULES[field].msg
  return ''
}

// ── FInput — champ avec validation inline ─────────────────────────────────────
// error     : message d'erreur à afficher sous le champ ('' = pas d'erreur)
// touched   : true dès que le champ a été quitté au moins une fois (évite
//             d'afficher les erreurs avant que l'utilisateur ait interagi)
function FInput({ label, value, onChange, type = 'text', placeholder, error, touched }) {
  const [focused,  setFocused]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  const borderColor = touched && error
    ? '#FF4466'
    : focused
      ? '#FF5C3A'
      : 'rgba(27,35,64,0.08)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#F5F0E8',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 12,
            padding: isPassword ? '13px 44px 13px 16px' : '13px 16px',
            fontSize: 15, color: '#1B2340', fontFamily: DM,
            outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 4,
              color: showPass ? '#FF5C3A' : '#8A8FA8',
              display: 'flex', alignItems: 'center',
            }}
          >
            {showPass ? (
              /* Œil barré — mot de passe visible */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 1l16 16M7.5 7.56A2 2 0 0110.44 10.5M6.3 3.8C7.14 3.3 8.04 3 9 3c4 0 7 4.5 7 6 0 .9-.6 2.1-1.6 3.2M3.6 5.4C2.4 6.5 1 8 1 9c0 1.5 3 6 8 6 1.5 0 2.9-.5 4.1-1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Œil ouvert — mot de passe masqué */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 9c0-1.5 3.6-6 8-6s8 4.5 8 6-3.6 6-8 6-8-4.5-8-6z" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {touched && error && (
        <span style={{ fontFamily: DM, fontSize: 12, color: '#FF4466', marginTop: 2 }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, showToast } = useApp()

  const initMode = location.state?.mode || 'login'
  const [mode,       setMode]       = useState(initMode)
  const [role,       setRole]       = useState('client')
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [pwd,        setPwd]        = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading,    setLoading]    = useState(false)

  // touched : mémorise quels champs ont été quittés au moins une fois
  // → évite d'afficher les erreurs sur les champs jamais touchés
  const [touched, setTouched] = useState({})
  const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }))
  const touchAll = () => setTouched({ name: true, email: true, password: true })

  // Calcul des erreurs en temps réel (pas de state séparé — dérivé des valeurs)
  const errors = {
    name:     mode === 'register' ? validate('name', name)         : '',
    email:    validate('email', email),
    password: validate('password', pwd),
  }
  const hasErrors = Object.values(errors).some(e => e !== '')

  const handleSubmit = async () => {
    // Marquer tous les champs comme touchés pour révéler toutes les erreurs
    touchAll()
    if (hasErrors) return

    // Validation du code d'invitation commerçant (pas de règle regex — vérification exacte)
// La validation du code se fait côté backend uniquement
// Plus de vérification front sur la liste hardcodée

    setLoading(true)
      try {
        let data
        if (mode === 'register') {
          data = await apiRegister({
            email,
            password: pwd,
            name:       name.trim(),
            role,
            inviteCode: inviteCode.trim().toUpperCase(),
          })
        } else {
          data = await apiLogin({ email, password: pwd })
        }
        login(data.user.name, data.user.role, { id: data.user.id, email, plan: data.user.plan })
        showToast(`Bienvenue${mode === 'register' ? ' !' : ' de retour !'}`, '👋')
        navigate(data.user.role === 'merchant' ? '/merchant' : '/client', { replace: true })
      } catch (e) {
        showToast(e.message || 'Erreur de connexion', '❌')
      } finally {
      setLoading(false)
    }
  }

  // Réinitialiser les champs et erreurs au changement de mode
  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setName(''); setEmail(''); setPwd(''); setInviteCode('')
    setTouched({})
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8F0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 14, paddingLeft: 20, paddingRight: 20, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px 6px 0', color: '#FF5C3A', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontFamily: SYS, fontWeight: 700, fontSize: 19, color: '#1B2340', letterSpacing: '-0.01em' }}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 36px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Rôle */}
        <div>
          <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>Je suis</div>
          <div style={{ display: 'flex', background: '#F2F4FF', borderRadius: 14, padding: 4, gap: 4 }}>
            {[['client', 'Client'], ['merchant', 'Commerçant']].map(([val, label]) => (
              <button key={val} onClick={() => { setRole(val); setTouched({}) }} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: DM, fontWeight: 600, fontSize: 14, background: role === val ? '#fff' : 'transparent', color: role === val ? '#FF5C3A' : '#8A8FA8', boxShadow: role === val ? '0 2px 12px rgba(27,35,64,0.08)' : 'none', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <FInput
              label={role === 'client' ? 'Prénom' : 'Nom du commerce'}
              value={name}
              onChange={v => { setName(v); touch('name') }}
              placeholder={role === 'client' ? 'Ex : Alex' : 'Ex : Café Moka'}
              error={errors.name}
              touched={touched.name}
            />
          )}
          <FInput
            label="Email"
            value={email}
            onChange={v => { setEmail(v); touch('email') }}
            type="email"
            placeholder="vous@exemple.fr"
            error={errors.email}
            touched={touched.email}
          />
          <FInput
            label="Mot de passe"
            value={pwd}
            onChange={v => { setPwd(v); touch('password') }}
            type="password"
            placeholder="6 caractères min, 1 lettre + 1 chiffre"
            error={errors.password}
            touched={touched.password}
          />
          {mode === 'register' && role === 'merchant' && (
            <FInput
              label="Code d'invitation"
              value={inviteCode}
              onChange={setInviteCode}
              placeholder="FIDELE-XXXX-0000"
            />
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: '#FF5C3A', color: '#fff', border: 'none',
            borderRadius: 16, padding: 15, fontFamily: DM, fontWeight: 700,
            fontSize: 16, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,92,58,0.32)',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
          }}
        >
          {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: DM, fontSize: 14, color: '#8A8FA8' }}>
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          </span>
          <span onClick={handleModeSwitch} style={{ fontFamily: DM, fontSize: 14, fontWeight: 700, color: '#FF5C3A', cursor: 'pointer' }}>
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </span>
        </div>

        {/* Aide démo */}
        <div style={{ background: 'rgba(255,92,58,0.08)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,92,58,0.12)' }}>
          <div style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: '#FF5C3A', marginBottom: 3 }}>Démo rapide</div>
          <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', lineHeight: 1.5 }}>
            Utilisez un email valide (ex : test@test.fr) et un mot de passe avec 1 lettre + 1 chiffre (ex : bonjour1).<br />
            Pour tester en tant que commerçant, code : <strong style={{ color: '#1B2340' }}>FIDELE-DEMO-9999</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
