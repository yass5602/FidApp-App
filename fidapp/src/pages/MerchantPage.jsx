// pages/MerchantPage.jsx
import { apiCreateProgram, apiGetMyPrograms, apiDeleteProgram, apiUpdatePlan } from '../utils/api'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import DashboardTab from "../components/merchant/DashboardTab";
import QRCodeTab from "../components/merchant/QRCodeTab";
import MyCardsTab from "../components/merchant/MyCardsTab";
import CardCreatorTab from "../components/merchant/CardCreatorTab";
import NotifsTab from "../components/merchant/NotifsTab";
import ProfileTab from "../components/merchant/ProfileTab";
import ValidateTab from '../components/merchant/ValidateTab'
import { DEMO_MERCHANTS } from "../constants/merchants";

const DM = "'DM Sans', sans-serif";
const SYNE = "'Syne', sans-serif";

// Carte démo pré-peuplée pour le commerçant connecté
const INITIAL_MERCHANT_CARDS = [
  {
    ...DEMO_MERCHANTS[1],
    maxPoints: 5,
    reward: "Un café offert",
    stats: { clients: 94, scans: 521, rewards: 63 },
  },
];

// ── TabBar Merchant ───────────────────────────────────────────────────────────
function TabBarMerchant({ active, onChange }) {
  const tabs = [
    {
      id: "dashboard",
      label: "Board",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="2"
            y="10"
            width="5"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <rect
            x="7.5"
            y="5"
            width="5"
            height="13"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <rect
            x="13"
            y="2"
            width="5"
            height="16"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      ),
    },
    {
      id: "qr",
      label: "QR",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="2"
            y="2"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <rect
            x="12"
            y="2"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <rect
            x="2"
            y="12"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M12 12h2m4 0h-2m-2 2v4M16 12v4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "mycards",
      label: "Cartes",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="2"
            y="5"
            width="16"
            height="11"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      id: "notifs",
      label: "Notifs",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M8 15.5a2 2 0 004 0"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      ),
    },
    {
      id: 'validate',
      label: 'Valider',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profil",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle
            cx="10"
            cy="7"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];
  return (
    <div
      style={{
        display: "flex",
        background: "#fff",
        borderTop: "1px solid rgba(27,35,64,0.08)",
        paddingBottom: 20,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "9px 0 2px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: active === tab.id ? "#FF5C3A" : "#8A8FA8",
            transition: "color 0.15s",
          }}
        >
          {tab.icon}
          <span
            style={{
              fontFamily: DM,
              fontSize: 10,
              fontWeight: active === tab.id ? 700 : 500,
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── MerchantPage ──────────────────────────────────────────────────────────────
export default function MerchantPage() {
  const { user, logout, showToast, fireConfetti, login } = useApp()
  const navigate = useNavigate(); // ← ajouté (utilisé par ProfileTab pour navigate('/'))
  const [tab, setTab] = useState("dashboard");
  // APRÈS — plan vient du user connecté (AppContext)
  const [plan, setPlan] = useState(user?.plan || 'freemium')

  React.useEffect(() => {
    if (user?.plan) setPlan(user.plan)
  }, [user?.plan])

  const [cards,   setCards]   = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les programmes depuis l'API au montage
  React.useEffect(() => {
    apiGetMyPrograms()
      //.then(data => setCards(data || []))
      apiGetMyPrograms()
  .then(data => {
    console.log('Programmes reçus :', JSON.stringify(data[0], null, 2))
    setCards(data || [])
  })
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCardCreated = async (card) => {
  try {
    const saved = await apiCreateProgram(card)
      setCards(prev => [...prev, saved])
      setTab('mycards')
      showToast('Carte créée avec succès !', '🎉')
      fireConfetti()
    } catch (e) {
      showToast(e.message || 'Erreur lors de la création', '❌')
    }
  };

  const handleDeleteCard = async (i) => {
  const card = cards[i]
  try {
      if (card._id) await apiDeleteProgram(card._id)
      setCards(prev => prev.filter((_, j) => j !== i))
      showToast('Carte supprimée', '🗑️')
    } catch (e) {
      showToast(e.message || 'Erreur lors de la suppression', '❌')
    }
  };

  // APRÈS
  const handlePlanChange = async (newPlan) => {
    try {
      await apiUpdatePlan(newPlan)
      setPlan(newPlan)
      login(user.name, user.role, { ...user, plan: newPlan })
      showToast(`Plan mis à jour : ${newPlan}`, '✅')
    } catch (e) {
      showToast(e.message || 'Erreur lors du changement de plan', '❌')
    }
  } 
  const PLAN_LIMITS = { freemium: 1, solo: 3, multi: Infinity }
  const cardLimit   = PLAN_LIMITS[plan] ?? 1
  const limitReached = cards.length >= cardLimit
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#FFF8F0",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tab === "dashboard" && (
          <DashboardTab user={user} cards={cards} onTab={setTab} />
        )}
        {tab === 'qr' && <QRCodeTab user={user} plan={plan} />}
        {tab === "mycards" && (
          <MyCardsTab
            cards={cards}
            onDelete={handleDeleteCard}
            onTab={setTab}
          />
        )}
        {tab === 'create'    && <CardCreatorTab onCreated={handleCardCreated} limitReached={limitReached} plan={plan} cardLimit={cardLimit} />}
        {tab === 'notifs' && <NotifsTab plan={plan} />}
        {tab === 'validate' && <ValidateTab />}
        {tab === 'profile'   && <ProfileTab     cards={cards} plan={plan} onPlanChange={handlePlanChange} />}
      </div>
      <TabBarMerchant active={tab} onChange={setTab} />
    </div>
  );
}
