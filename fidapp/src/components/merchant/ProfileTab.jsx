// components/merchant/ProfileTab.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const SYS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif";
const SYNE = "'Syne', sans-serif";
const DM = "'DM Sans', sans-serif";

const PLANS = {
  freemium: {
    label: "Freemium",
    color: "#8A8FA8",
    bg: "rgba(138,143,168,0.10)",
    desc: "Fonctions de base",
  },
  solo: {
    label: "Solo — 19€/mois",
    color: "#FF5C3A",
    bg: "rgba(255,92,58,0.10)",
    desc: "QR dynamique + Notifications",
  },
  multi: {
    label: "Multi — 49€/mois",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.10)",
    desc: "Multi-établissements + Analytics",
  },
};

export default function ProfileTab({ cards, plan: planKey, onPlanChange }) {
  const { user, logout, showToast } = useApp()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const plan = PLANS[planKey || 'solo'] /*Changer les abonnements*/
  const initial = (user?.name || "C").charAt(0).toUpperCase();
  const totalScans = cards.reduce((s, c) => s + (c.stats?.scans || 0), 0);
  const totalClients = cards.reduce((s, c) => s + (c.stats?.clients || 0), 0);
  const totalRewards = cards.reduce((s, c) => s + (c.stats?.rewards || 0), 0);

  const handleLogout = () => {
    logout();
    showToast("À bientôt !", "👋");
    navigate("/", { replace: true });
  };

  return (
    <div style={{ background: "#FFF8F0", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 20,
          paddingLeft: 22,
          paddingRight: 22,
          background: "#fff",
          borderBottom: "1px solid rgba(27,35,64,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "linear-gradient(135deg, #1B2340, #2ECC9A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            boxShadow: "0 4px 20px rgba(27,35,64,0.25)",
          }}
        >
          <span
            style={{
              fontFamily: SYNE,
              fontWeight: 900,
              fontSize: 32,
              color: "#fff",
            }}
          >
            {initial}
          </span>
        </div>
        <div
          style={{
            fontFamily: SYS,
            fontWeight: 700,
            fontSize: 20,
            color: "#1B2340",
          }}
        >
          {user?.name || "Mon Commerce"}
        </div>
        <div
          style={{
            fontFamily: DM,
            fontSize: 13,
            color: "#8A8FA8",
            marginTop: 4,
          }}
        >
          Commerçant · FidApp
        </div>

        {/* Badge plan */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: plan.bg,
            borderRadius: 99,
            padding: "5px 14px",
            marginTop: 10,
            border: `1px solid ${plan.color}22`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: plan.color,
            }}
          />
          <span
            style={{
              fontFamily: DM,
              fontSize: 12,
              fontWeight: 700,
              color: plan.color,
            }}
          >
            {plan.label}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Stats globales */}
        <div>
          <div
            style={{
              fontFamily: SYS,
              fontWeight: 700,
              fontSize: 15,
              color: "#1B2340",
              marginBottom: 10,
            }}
          >
            Statistiques globales
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Clients", value: totalClients, color: "#FF5C3A" },
              { label: "Scans", value: totalScans, color: "#2ECC9A" },
              { label: "Récomp.", value: totalRewards, color: "#FFB347" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "13px 8px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(27,35,64,0.08)",
                  border: "1px solid rgba(27,35,64,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: DM,
                    fontWeight: 700,
                    fontSize: 22,
                    color: s.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: DM,
                    fontSize: 10,
                    color: "#8A8FA8",
                    marginTop: 3,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes programmes */}
        {cards.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: SYS,
                fontWeight: 700,
                fontSize: 15,
                color: "#1B2340",
                marginBottom: 10,
              }}
            >
              Mes programmes ({cards.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid rgba(27,35,64,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${
                        card.color1 || "#FF5C3A"
                      }, ${card.color2 || "#FFB347"})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SYNE,
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#fff",
                      }}
                    >
                      {card.logo || card.name?.charAt(0) || "C"}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: DM,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1B2340",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {card.name}
                    </div>
                    <div
                      style={{
                        fontFamily: DM,
                        fontSize: 12,
                        color: "#8A8FA8",
                        marginTop: 1,
                      }}
                    >
                      {card.maxPoints} tampons · {card.reward || "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: DM,
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#FF5C3A",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {card.stats?.clients || 0}
                    </div>
                    <div
                      style={{ fontFamily: DM, fontSize: 10, color: "#8A8FA8" }}
                    >
                      clients
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations compte */}
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
          {[
            { label: 'Plan actuel', value: plan.label, valueColor: plan.color },
            { label: 'Fonctionnalités', value: plan.desc, valueColor: '#8A8FA8' },
            //{ label: 'Mode', value: import.meta.env.DEV ? 'Développement' : 'Production', valueColor: '#8A8FA8' },
            { label: 'Email', value: user?.email || '—', valueColor: '#8A8FA8' },
          ].map((row, i, arr) => (
          <div key={row.label} style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid rgba(27,35,64,0.06)' : 'none' }}>
            <span style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: row.valueColor }}>{row.value}</span>
          </div>
          ))}
        </div>

       

        {/* Sélecteur de plan — démo uniquement */}
{/* Sélecteur de plan — visible uniquement en développement */}
{import.meta.env.DEV && (
  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
    <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
      Simuler un plan (démo)
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { id: 'freemium', label: 'Freemium', color: '#8A8FA8', bg: 'rgba(138,143,168,0.10)' },
        { id: 'solo',     label: 'Solo',     color: '#FF5C3A', bg: 'rgba(255,92,58,0.10)'   },
        { id: 'multi',    label: 'Multi',    color: '#6366F1', bg: 'rgba(99,102,241,0.10)'  },
      ].map(p => (
        <button
          key={p.id}
          onClick={() => onPlanChange(p.id)}
          style={{
            flex: 1, padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontFamily: DM, fontWeight: 700, fontSize: 13,
            background: planKey === p.id ? p.bg : '#F2F4FF',
            color: planKey === p.id ? p.color : '#8A8FA8',
            outline: planKey === p.id ? `2px solid ${p.color}` : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
    <div style={{ fontFamily: DM, fontSize: 11, color: '#8A8FA8', marginTop: 8, lineHeight: 1.5 }}>
      En production, le plan sera défini par le backend après paiement.
    </div>
  </div>
)}

        {/* Bouton changer abonnement */}
        <button
          onClick={() => navigate('/pricing')}
          style={{ width: '100%', background: '#1B2340', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 24px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(27,35,64,0.2)' }}
          >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Changer d'abonnement
        </button>

        {/* Déconnexion */}
        <div style={{ marginTop: 4 }}>
          {confirmLogout ? (
            <div
              style={{
                background: "rgba(255,68,102,0.07)",
                borderRadius: 16,
                padding: "16px",
                border: "1px solid rgba(255,68,102,0.15)",
              }}
            >
              <div
                style={{
                  fontFamily: DM,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1B2340",
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                Se déconnecter du compte ?
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmLogout(false)}
                  style={{
                    flex: 1,
                    background: "#F2F4FF",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontFamily: DM,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#1B2340",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    background: "#FF4466",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontFamily: DM,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(255,68,102,0.28)",
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmLogout(true)}
              style={{
                width: "100%",
                background: "transparent",
                color: "#FF4466",
                border: "1.5px solid rgba(255,68,102,0.35)",
                borderRadius: 14,
                padding: "13px 24px",
                fontFamily: DM,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,68,102,0.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path
                  d="M6.5 14.5H3a1 1 0 01-1-1v-10a1 1 0 011-1h3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M11.5 11.5l3-3-3-3M14.5 8.5h-7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Se déconnecter
            </button>
          )}
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
