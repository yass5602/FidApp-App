// pages/ClientPage.jsx — adapté depuis fidelia-client.jsx + FidApp.html
import { apiGetMyCards, apiScan, apiGetMerchantByQRToken, apiCheckRewardValidated } from '../utils/api'
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import jsQR from 'jsqr'
import LoyaltyCard from "../components/LoyaltyCard";
import { DEMO_MERCHANTS, DEMO_CLIENT_CARDS } from "../constants/merchants";

const SYS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif";
const SYNE = "'Syne', sans-serif";
const DM = "'DM Sans', sans-serif";

// ── RewardModal ───────────────────────────────────────────────────────────────
function RewardModal({ card, code, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: '#fff', borderRadius: '24px 24px 0 0', padding: '8px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ width: 40, height: 4, background: 'rgba(27,35,64,0.08)', borderRadius: 99, margin: '12px auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <div style={{ fontFamily: SYNE, fontWeight: 900, fontSize: 26, color: '#1B2340', marginBottom: 6 }}>Récompense débloquée !</div>
          <div style={{ fontFamily: DM, fontSize: 15, color: '#8A8FA8' }}>{card.merchant.reward}</div>
        </div>
        <div style={{ background: '#F2F4FF', borderRadius: 18, padding: 20, textAlign: 'center', marginBottom: 16, border: '1.5px dashed rgba(255,92,58,0.35)' }}>
          <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: '#8A8FA8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Code de validation</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 34, color: '#FF5C3A', letterSpacing: '0.22em' }}>{code}</div>
          <div style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8', marginTop: 8 }}>Présentez ce code au commerçant</div>
        </div>
        <div style={{ background: 'rgba(255,179,71,0.10)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, border: '1px solid rgba(255,179,71,0.2)' }}>
          <div style={{ fontFamily: DM, fontSize: 12, color: '#CC8800', lineHeight: 1.5 }}>
            ⏳ Cette récompense reste active jusqu'à validation par votre commerçant. Vous pouvez fermer cette fenêtre.
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', background: '#FF5C3A', color: '#fff', border: 'none', borderRadius: 16, padding: 15, fontFamily: DM, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Fermer (garder active)
        </button>
      </div>
    </div>
  )
}

// ── AddCardScreen ─────────────────────────────────────────────────────────────
// Haversine — distance en km entre deux points GPS
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function AddCardScreen({ existingCards, onAdd, onBack }) {
  const { showToast } = useApp()
  const ownedIds   = existingCards.map(c => c.merchant.id)
  const baseList   = DEMO_MERCHANTS.filter(m => !ownedIds.includes(m.id))
  const [scanning, setScanning] = useState(null)
  const [done,     setDone]     = useState(null)

  // Géolocalisation
  const [geoStatus,  setGeoStatus]  = useState('idle')   // 'idle' | 'requesting' | 'granted' | 'denied'
  const [userPos,    setUserPos]    = useState(null)      // { lat, lng }
  const [distances,  setDistances]  = useState({})        // { merchantId: km }
  const [available,  setAvailable]  = useState(baseList)

  const addVideoRef  = React.useRef(null)
const addCanvasRef = React.useRef(null)
const addStreamRef = React.useRef(null)
const addIntervalRef = React.useRef(null)
const [addCameraActive, setAddCameraActive] = React.useState(false)

const startAddCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    addStreamRef.current = stream
    if (addVideoRef.current) {
      addVideoRef.current.srcObject = stream
      addVideoRef.current.play()
      setAddCameraActive(true)
    }
  } catch { }
}

const stopAddCamera = () => {
  if (addStreamRef.current) {
    addStreamRef.current.getTracks().forEach(t => t.stop())
    addStreamRef.current = null
  }
  clearInterval(addIntervalRef.current)
  setAddCameraActive(false)
}

// Scanner en continu
React.useEffect(() => {
  if (!addCameraActive) return
  addIntervalRef.current = setInterval(async () => {
    const video  = addVideoRef.current
    const canvas = addCanvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      stopAddCamera()
        try {
          const data = await apiGetMerchantByQRToken(code.data)
          if (!data?.merchant) {
          showToast('QR code invalide ou expiré', '❌')
          return
        }
          if (data.merchant) {
           onAdd({
            merchant:  { ...data.merchant, id: data.merchant.id },
            programId: data.programId,
            points:    0,
        })
  }
  } catch (e) {
    showToast('Erreur réseau — réessayez', '❌')
  }
}
  }, 250)
  return () => clearInterval(addIntervalRef.current)
}, [addCameraActive])

// Nettoyage
React.useEffect(() => { return () => stopAddCamera() }, [])


  // Geocode une adresse texte → { lat, lng } via Nominatim
  const geocodeAddress = async (address) => {
    if (!address) return null
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      const res  = await fetch(url, { headers: { 'Accept-Language': 'fr', 'User-Agent': 'FidApp/1.0' } })
      const data = await res.json()
      if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } catch {}
    return null
  }

  const requestLocation = () => {
    setGeoStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setUserPos({ lat: userLat, lng: userLng })
        setGeoStatus('granted')

        // Geocoder les adresses des commerçants disponibles
        const dist = {}
        await Promise.all(baseList.map(async (m) => {
          if (m.address) {
            const coords = await geocodeAddress(m.address)
            if (coords) dist[m.id] = haversine(userLat, userLng, coords.lat, coords.lng)
          }
        }))
        setDistances(dist)

        // Trier par distance (commerçants sans adresse géocodée à la fin)
        setAvailable([...baseList].sort((a, b) => {
          const da = dist[a.id] ?? Infinity
          const db = dist[b.id] ?? Infinity
          return da - db
        }))
      },
      () => setGeoStatus('denied')
    )
  }

  const simulateScan = (merchant) => {
    setScanning(merchant.id);
    setTimeout(() => {
      setDone(merchant.id);
      setTimeout(() => onAdd({ merchant, points: 0 }), 1200);
    }, 1400);
  };

  return (
    <div style={{ background: "#FFF8F0", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          paddingTop: 52,
          paddingBottom: 14,
          paddingLeft: 20,
          paddingRight: 20,
          background: "#fff",
          borderBottom: "1px solid rgba(27,35,64,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px 6px 0",
            color: "#FF5C3A",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 5L7 10l5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span
          style={{
            fontFamily: SYS,
            fontWeight: 700,
            fontSize: 19,
            color: "#1B2340",
          }}
        >
          Ajouter une carte
        </span>
      </div>

      <div style={{ padding: 20 }}>
        {/* Info */}
        <div
          style={{
            background: "rgba(255,92,58,0.08)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 20,
            border: "1px solid rgba(255,92,58,0.12)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#FF5C3A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="2"
                y="2"
                width="5"
                height="5"
                rx="1"
                stroke="#fff"
                strokeWidth="1.6"
              />
              <rect
                x="11"
                y="2"
                width="5"
                height="5"
                rx="1"
                stroke="#fff"
                strokeWidth="1.6"
              />
              <rect
                x="2"
                y="11"
                width="5"
                height="5"
                rx="1"
                stroke="#fff"
                strokeWidth="1.6"
              />
              <path
                d="M11 11h2m4 0h-2m-2 2v4M15 11v4"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: DM,
                fontWeight: 700,
                fontSize: 14,
                color: "#FF5C3A",
                marginBottom: 2,
              }}
            >
              Scan QR code
            </div>
            <div
              style={{
                fontFamily: DM,
                fontSize: 13,
                color: "#8A8FA8",
                lineHeight: 1.4,
              }}
            >
              Pointez l'appareil vers le QR code du commerçant, ou choisissez
              ci-dessous.
            </div>
          </div>
        </div>

        {/* Zone caméra QR — scan nouveau commerçant */}
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(27,35,64,0.08)', boxShadow: '0 2px 12px rgba(27,35,64,0.08)' }}>
            <div style={{ position: 'relative', height: 200, background: '#0D1121', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <video ref={addVideoRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: addCameraActive ? 'block' : 'none' }} playsInline muted />
              <canvas ref={addCanvasRef} style={{ display: 'none' }} />
              {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y],i) => (
              <div key={i} style={{ position: 'absolute', top: y<0?16:'auto', bottom: y>0?16:'auto', left: x<0?16:'auto', right: x>0?16:'auto', width: 22, height: 22, borderTop: y<0?'2.5px solid #FF5C3A':'none', borderBottom: y>0?'2.5px solid #FF5C3A':'none', borderLeft: x<0?'2.5px solid #FF5C3A':'none', borderRight: x>0?'2.5px solid #FF5C3A':'none', borderRadius: x<0&&y<0?'5px 0 0 0':x>0&&y<0?'0 5px 0 0':x<0&&y>0?'0 0 0 5px':'0 0 5px 0', zIndex: 2 }} />
              ))}
              {!addCameraActive && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DM, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Scanner le QR d'un nouveau commerçant</div>
                  <button onClick={startAddCamera} style={{ background: '#FF5C3A', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontFamily: DM, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    📷 Activer la caméra
                  </button>
                </div>
              )}
              {addCameraActive && (
              <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                <button onClick={stopAddCamera} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontFamily: DM, fontSize: 12, cursor: 'pointer' }}>
                  Arrêter
                </button>
              </div>
              )}
            </div>
          </div>

        {/* Commerçants disponibles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ 
            fontFamily: SYS, 
            fontWeight: 700, 
            fontSize: 16, 
            color: '#1B2340' 
            }}
          > 
            Commerçants proches
          </div>
          {geoStatus === 'idle' && (
          <button onClick={requestLocation} style={{ background: 'rgba(255,92,58,0.10)', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontFamily: DM, fontSize: 12, fontWeight: 700, color: '#FF5C3A', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Me localiser
          </button>
          )}
          {geoStatus === 'requesting' && <span style={{ fontFamily: DM, fontSize: 12, color: '#8A8FA8' }}>Localisation…</span>}
          {geoStatus === 'granted'    && <span style={{ fontFamily: DM, fontSize: 12, color: '#2ECC9A', fontWeight: 600 }}>✓ Triés par distance</span>}
          {geoStatus === 'denied'     && <span style={{ fontFamily: DM, fontSize: 12, color: '#FF4466' }}>Accès refusé</span>}
        </div>
        {available.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div
              style={{
                fontFamily: DM,
                fontWeight: 700,
                fontSize: 16,
                color: "#1B2340",
              }}
            >
              Vous avez toutes les cartes !
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {available.map((merchant) => {
              const isScanning =
                scanning === merchant.id && done !== merchant.id;
              const isDone = done === merchant.id;
              return (
                <div
                  key={merchant.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid rgba(27,35,64,0.08)",
                    boxShadow: "0 2px 12px rgba(27,35,64,0.08)",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${merchant.color1}, ${merchant.color2})`,
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
                          fontSize: 20,
                          color: "#fff",
                        }}
                      >
                        {merchant.logo}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: DM,
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#1B2340",
                        }}
                      >
                        {merchant.name}
                      </div>
                      <div style={{ 
                        fontFamily: DM, 
                        fontSize: 12, 
                        color: '#8A8FA8', 
                        marginTop: 2 
                        }}
                      >
                        {merchant.category} · {merchant.maxPoints} tampons → {merchant.reward}
                        {distances[merchant.id] != null && (
                        <span style={{ 
                          marginLeft: 6, 
                          color: '#FF5C3A', 
                          fontWeight: 600 
                          }}
                        >
                          · {distances[merchant.id] < 1
                          ? `${Math.round(distances[merchant.id] * 1000)}m`
                          : `${distances[merchant.id].toFixed(1)}km`}
                        </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        !isScanning && !isDone && simulateScan(merchant)
                      }
                      style={{
                        flexShrink: 0,
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "none",
                        cursor: isDone ? "default" : "pointer",
                        fontFamily: DM,
                        fontSize: 13,
                        fontWeight: 700,
                        background: isDone
                          ? "rgba(46,204,154,0.12)"
                          : "rgba(255,92,58,0.10)",
                        color: isDone ? "#2ECC9A" : "#FF5C3A",
                        transition: "all 0.2s",
                      }}
                    >
                      {isDone ? "✓ Ajouté" : isScanning ? "…" : "Scanner"}
                    </button>
                  </div>
                  {isScanning && (
                    <div
                      style={{ height: 3, background: "rgba(27,35,64,0.08)" }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: "100%",
                          background: "#FF5C3A",
                          borderRadius: 99,
                          animation: "scanProgress 1.4s linear forwards",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes scanProgress { from { width:0 } to { width:100% } }`}</style>
    </div>
  );
}

// ── CardsTab ──────────────────────────────────────────────────────────────────
function CardsTab({ user, cards, onScanCard, onAddCard, pendingRewards, onOpenReward }) {
  const totalStamps = cards.reduce((s, c) => s + c.points, 0);
  const rewards = cards.filter((c) => c.points >= c.merchant.maxPoints).length;

  return (
    <div style={{ background: "#FFF8F0", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 14,
          paddingLeft: 22,
          paddingRight: 22,
          background: "#fff",
          borderBottom: "1px solid rgba(27,35,64,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: DM,
                fontSize: 13,
                color: "#8A8FA8",
                fontWeight: 500,
              }}
            >
              Bonjour
            </div>
            <div
              style={{
                fontFamily: SYS,
                fontWeight: 700,
                fontSize: 22,
                color: "#1B2340",
                letterSpacing: "-0.02em",
                marginTop: 1,
              }}
            >
              {user?.name || "Alex"}
            </div>
          </div>
          {rewards > 0 && (
            <div
              style={{
                background: "rgba(255,179,71,0.15)",
                borderRadius: 99,
                padding: "5px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: DM,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#CC8800",
                }}
              >
                🎁 {rewards} récompense{rewards > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[
            { label: "Cartes", val: cards.length },
            { label: "Tampons", val: totalStamps },
            { label: "Récompenses", val: rewards },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: "#F2F4FF",
                borderRadius: 11,
                padding: "9px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: DM,
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#1B2340",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontFamily: DM,
                  fontSize: 10,
                  color: "#8A8FA8",
                  marginTop: 1,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards list */}
      <div style={{ padding: "18px 18px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: SYS,
              fontWeight: 700,
              fontSize: 17,
              color: "#1B2340",
            }}
          >
            Mes cartes
          </span>
          <button
            onClick={onAddCard}
            style={{
              background: "rgba(255,92,58,0.10)",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2v10M2 7h10"
                stroke="#FF5C3A"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: DM,
                fontSize: 13,
                fontWeight: 700,
                color: "#FF5C3A",
              }}
            >
              Ajouter
            </span>
          </button>
        </div>

        {cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "#F2F4FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="7"
                  width="24"
                  height="17"
                  rx="4"
                  stroke="#8A8FA8"
                  strokeWidth="1.8"
                />
                <path d="M2 12h24" stroke="#8A8FA8" strokeWidth="1.8" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: SYS,
                fontWeight: 700,
                fontSize: 17,
                color: "#1B2340",
                marginBottom: 6,
              }}
            >
              Aucune carte
            </div>
            <div
              style={{
                fontFamily: DM,
                fontSize: 14,
                color: "#8A8FA8",
                marginBottom: 20,
              }}
            >
              Scannez le QR code d'un commerçant pour commencer.
            </div>
            <button
              onClick={onAddCard}
              style={{
                background: "#FF5C3A",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 24px",
                fontFamily: DM,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Scanner un commerçant
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cards.map((card, i) => (
              <div
                key={i}
                onClick={() => onScanCard(i)}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.12s",
                  borderRadius: 20,
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onTouchStart={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onTouchEnd={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
              <LoyaltyCard card={card} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 7 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4" height="4" rx="0.8" stroke="#8A8FA8" strokeWidth="1.3"/><rect x="8" y="1" width="4" height="4" rx="0.8" stroke="#8A8FA8" strokeWidth="1.3"/><rect x="1" y="8" width="4" height="4" rx="0.8" stroke="#8A8FA8" strokeWidth="1.3"/><path d="M8 8h1.5m3 0h-1.5m-1.5 1.5v3M10.5 8v3" stroke="#8A8FA8" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <span style={{ fontFamily: DM, fontSize: 11, fontWeight: 500, color: '#8A8FA8' }}>Appuyer pour scanner</span>
                </div>
                {pendingRewards[i] && (
                <button onClick={e => { e.stopPropagation(); onOpenReward(i) }}
                  style={{ marginTop: 8, width: '100%', background: 'rgba(255,179,71,0.12)', border: '1.5px solid rgba(255,179,71,0.3)', borderRadius: 12, padding: '9px', fontFamily: DM, fontWeight: 700, fontSize: 13, color: '#CC8800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  🎁 Récompense en attente — Présenter au commerçant
                </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}

// ── ScanTab ───────────────────────────────────────────────────────────────────
function ScanTab({ cards, selectedCard, onScan, onAddCard, scanState }) {
  const activeCard = cards[selectedCard]
  const videoRef   = React.useRef(null)
  const canvasRef  = React.useRef(null)
  const streamRef  = React.useRef(null)
  const intervalRef = React.useRef(null)

  const [cameraError, setCameraError] = React.useState(null)
  const [cameraActive, setCameraActive] = React.useState(false)

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }  // caméra arrière sur mobile
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }
    } catch (e) {
      setCameraError("Caméra inaccessible — vérifiez les permissions")
    }
  }

  // Stopper la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCameraActive(false)
  }

  // Scanner en continu via jsQR
  React.useEffect(() => {
    if (!cameraActive) return

    intervalRef.current = setInterval(() => {
      const video  = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return

      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code?.data) {
        stopCamera()
        onScan(code.data)   // ← passe le token JWT décodé
      }
    }, 150)

    return () => clearInterval(intervalRef.current)
  }, [cameraActive])

  // Nettoyer la caméra quand on quitte l'onglet
  React.useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ paddingTop: 16, paddingBottom: 12, paddingLeft: 22, paddingRight: 22, background: '#fff', borderBottom: '1px solid rgba(27,35,64,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: '#1B2340' }}>Scanner</div>
          <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', marginTop: 3 }}>
            {activeCard ? activeCard.merchant.name : 'Présentez le QR code du commerçant'}
          </div>
        </div>
        {activeCard && (
          <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${activeCard.merchant.color1}, ${activeCard.merchant.color2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 15, color: '#fff' }}>{activeCard.merchant.logo}</span>
          </div>
        )}
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 24px rgba(27,35,64,0.10)', border: '1px solid rgba(27,35,64,0.08)' }}>

          {/* Zone caméra */}
          <div style={{ position: 'relative', background: '#0D1121', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

            {/* Flux vidéo */}
            <video ref={videoRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Coins du cadre */}
            {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y],i) => (
              <div key={i} style={{ position: 'absolute', top: y < 0 ? 24 : 'auto', bottom: y > 0 ? 24 : 'auto', left: x < 0 ? 24 : 'auto', right: x > 0 ? 24 : 'auto', width: 26, height: 26, borderTop: y < 0 ? '2.5px solid #FF5C3A' : 'none', borderBottom: y > 0 ? '2.5px solid #FF5C3A' : 'none', borderLeft: x < 0 ? '2.5px solid #FF5C3A' : 'none', borderRight: x > 0 ? '2.5px solid #FF5C3A' : 'none', borderRadius: x<0&&y<0?'5px 0 0 0':x>0&&y<0?'0 5px 0 0':x<0&&y>0?'0 0 0 5px':'0 0 5px 0', zIndex: 2 }} />
            ))}

            {/* États */}
            {scanState === 'success' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,204,154,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(46,204,154,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#2ECC9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 16, color: '#2ECC9A' }}>Tampon ajouté !</div>
              </div>
            )}

            {cameraError && (
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontFamily: DM, fontSize: 13, color: '#8A8FA8', lineHeight: 1.5 }}>{cameraError}</div>
              </div>
            )}

            {!cameraActive && !cameraError && scanState !== 'success' && (
              <div style={{ textAlign: 'center', padding: '0 28px' }}>
                <div style={{ fontFamily: DM, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Appuyez sur "Scanner" pour activer la caméra</div>
              </div>
            )}

            {cameraActive && scanState === 'idle' && (
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: 99, padding: '5px 14px', zIndex: 2 }}>
                <span style={{ fontFamily: DM, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Pointez vers le QR code</span>
              </div>
            )}
          </div>

          {activeCard && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(27,35,64,0.08)' }}>
              <LoyaltyCard card={activeCard} compact={true} />
            </div>
          )}

          <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!cameraActive ? (
              <button onClick={startCamera} disabled={scanState === 'scanning'} style={{ width: '100%', background: '#FF5C3A', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,92,58,0.32)' }}>
                📷 Activer la caméra
              </button>
            ) : (
              <button onClick={stopCamera} style={{ width: '100%', background: '#F2F4FF', color: '#8A8FA8', border: 'none', borderRadius: 14, padding: '14px 24px', fontFamily: DM, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                Arrêter la caméra
              </button>
            )}
          </div>
        </div>

        <button onClick={onAddCard} style={{ marginTop: 14, width: '100%', padding: 14, background: 'transparent', border: '1.5px dashed rgba(255,92,58,0.4)', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="#FF5C3A" strokeWidth="2" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: DM, fontSize: 14, fontWeight: 600, color: '#FF5C3A' }}>Scanner un nouveau commerçant</span>
        </button>
      </div>
    </div>
  )
}

// ── ProfileTab ────────────────────────────────────────────────────────────────
function ProfileTab({ user, cards, onLogout, pendingRewards, onOpenReward }) {
  const navigate = useNavigate();
  const totalStamps = cards.reduce((s, c) => s + c.points, 0);
  const rewards = cards.filter((c) => c.points >= c.merchant.maxPoints).length;
  const initial = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <div style={{ background: "#FFF8F0", minHeight: "100%" }}>
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 18,
          paddingLeft: 22,
          paddingRight: 22,
          background: "#fff",
          borderBottom: "1px solid rgba(27,35,64,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 22,
            background: "linear-gradient(135deg, #FF5C3A, #FFB347)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
            boxShadow: "0 4px 20px rgba(255,92,58,0.3)",
          }}
        >
          <span
            style={{
              fontFamily: SYNE,
              fontWeight: 900,
              fontSize: 30,
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
          {user?.name || "Alex"}
        </div>
        <div
          style={{
            fontFamily: DM,
            fontSize: 13,
            color: "#8A8FA8",
            marginTop: 3,
          }}
        >
          Client · FidApp
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Cartes actives", value: cards.length, color: "#FF5C3A" },
            {
              label: "Tampons collectés",
              value: totalStamps,
              color: "#2ECC9A",
            },
            { label: "Récompenses", value: rewards, color: "#FFB347" },
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
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mes commerçants */}
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontFamily: SYS,
              fontWeight: 700,
              fontSize: 16,
              color: "#1B2340",
              marginBottom: 10,
            }}
          >
            Mes commerçants
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cards.map((card, i) => (
              <div key={i}
                onClick={() => pendingRewards[i] && onOpenReward(i)}
                  style={{ background: '#fff',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: `1px solid
                    ${pendingRewards[i] ? 'rgba(255,179,71,0.4)' : 'rgba(27,35,64,0.08)'}`, cursor: pendingRewards[i] ? 'pointer' : 'default', position: 'relative' }}>
                    {pendingRewards[i] && (
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#FFB347', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10 }}>🎁</span>
                    </div>
                  )}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background: `linear-gradient(135deg, ${card.merchant.color1}, ${card.merchant.color2})`,
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
                      fontSize: 17,
                      color: "#fff",
                    }}
                  >
                    {card.merchant.logo}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: DM,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1B2340",
                    }}
                  >
                    {card.merchant.name}
                  </div>
                  <div
                    style={{ fontFamily: DM, fontSize: 12, color: "#8A8FA8" }}
                  >
                    {card.points}/{card.merchant.maxPoints} tampons
                  </div>
                </div>
                {/* Anneau de progression */}
                <div style={{ position: "relative", width: 34, height: 34 }}>
                  <svg width="34" height="34" viewBox="0 0 34 34">
                    <circle
                      cx="17"
                      cy="17"
                      r="14"
                      fill="none"
                      stroke="rgba(27,35,64,0.08)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="17"
                      cy="17"
                      r="14"
                      fill="none"
                      stroke="#FF5C3A"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        14 *
                        (1 - card.points / card.merchant.maxPoints)
                      }`}
                      strokeLinecap="round"
                      transform="rotate(-90 17 17)"
                      style={{ transition: "stroke-dashoffset 0.4s ease" }}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DM,
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#FF5C3A",
                      }}
                    >
                      {Math.round(
                        (card.points / card.merchant.maxPoints) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            background: "transparent",
            color: "#FF5C3A",
            border: "1.5px solid #FF5C3A",
            borderRadius: 14,
            padding: "13px 24px",
            fontFamily: DM,
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ── TabBar Client ─────────────────────────────────────────────────────────────
function TabBarClient({ active, onChange }) {
  const tabs = [
    {
      id: "cards",
      label: "Cartes",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="2"
            y="5"
            width="18"
            height="13"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M2 9h18" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      id: "scan",
      label: "Scanner",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="3"
            y="3"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <rect
            x="13"
            y="3"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <rect
            x="3"
            y="13"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M13 13h2m4 0h-2m-2 2v4M17 13v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profil",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="11"
            cy="8"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
            stroke="currentColor"
            strokeWidth="1.8"
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
            gap: 3,
            padding: "10px 0 2px",
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

// ── ClientPage ────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { user, logout, showToast, fireConfetti } = useApp();

  const [tab, setTab] = useState("cards");
  const [cards,        setCards]       = useState([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [selectedCard, setSelectedCard] = useState(0)
  const [scanState,    setScanState]   = useState('idle')
  const [showAdd,      setShowAdd]     = useState(false)
  const [rewardModal,  setRewardModal] = useState(null)
  const [pendingRewards, setPendingRewards] = useState(() => {
  try { return JSON.parse(localStorage.getItem('fid_pending_rewards')) || {} } catch { return {} }
})

  // Charger les cartes depuis l'API au montage
  // APRÈS
    React.useEffect(() => {
      apiGetMyCards()
      .then(data => setCards(data || []))
      .catch(() => setCards([]))
      .finally(() => setLoadingCards(false))
    }, [])

  // APRÈS — vérifie si le commerçant a validé chaque récompense en attente
  React.useEffect(() => {
    if (Object.keys(pendingRewards).length === 0) return

    const interval = setInterval(async () => {
      try {
        const entries = Object.entries(pendingRewards)
        for (const [idx, reward] of entries) {
          if (!reward?.code) continue
          const result = await apiCheckRewardValidated(reward.code)
          if (result.validated) {
            // Commerçant a validé → supprimer la récompense en attente
            setPendingRewards(prev => {
              const next = { ...prev }
              delete next[idx]
              return next
            })
            // Fermer la modal si elle affiche cette récompense
            setRewardModal(prev => prev === Number(idx) ? null : prev)
            showToast('Récompense validée par le commerçant ! 🎉', '✅')
            // Recharger les cartes
            apiGetMyCards().then(data => { if (data.length) setCards(data) }).catch(() => {})
          }
        }
      } catch {}
    }, 8_000)

    return () => clearInterval(interval)
  }, [Object.keys(pendingRewards).length])

  React.useEffect(() => {
    try { localStorage.setItem('fid_pending_rewards', JSON.stringify(pendingRewards)) } catch {}
    }, [pendingRewards])

  const handleScan = async (qrToken) => {
  if (scanState !== 'idle') return
  setScanState('scanning')

  try {
    // TODO prod : récupérer le vrai token depuis le scanner caméra (jsQR)
    // Pour l'instant on utilise le token QR actif du commerçant (simulation)
    // En prod : handleScan(token) recevra le token en paramètre depuis jsQR
    const activeCard = cards[selectedCard]
    // Récupère le token QR actif généré par le commerçant
    // En prod : ce token viendra du scanner caméra (jsQR)

const result = await apiScan(qrToken)

    setScanState('success')

    if (result.isComplete) {
      // Carte complète — reset côté serveur, on recharge
      const code = result.rewardCode || Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('')
      setPendingRewards(prev => ({
        ...prev,
        [selectedCard]: { card: { ...activeCard, points: activeCard.merchant.maxPoints }, code }
      }))
      setTimeout(() => { fireConfetti(); setRewardModal(selectedCard) }, 400)
    } else {
      if (result.isNewCard) {
        showToast(`Carte ajoutée + 1 tampon !`, '🃏')
      } else {
        showToast(`Tampon ajouté ! (${result.currentPoints}/${result.maxPoints})`, '🎯')
      }
    }

    // Recharger les cartes depuis l'API pour refléter l'état réel en base
    const updated = await apiGetMyCards()
    if (updated.length) setCards(updated)

  } catch (e) {
    showToast(e.message || 'Erreur lors du scan', '❌')
  } finally {
    // Toujours recharger les cartes pour refléter l'état réel
    // même si le scan a partiellement réussi
    apiGetMyCards()
      .then(data => { if (data.length) setCards(data) })
      .catch(() => {})
    setTimeout(() => setScanState('idle'), 1800)
  }
  };

  const handleAddCard = (newCard) => {
    setCards((prev) => [...prev, newCard]);
    setShowAdd(false);
    setTab("cards");
    showToast(`${newCard.merchant.name} ajouté !`, "🃏");
  };

  const handleLogout = () => {
    logout();
    showToast("À bientôt !", "👋");
  };

  if (showAdd)
    return (
      <AddCardScreen
        existingCards={cards}
        onAdd={handleAddCard}
        onBack={() => setShowAdd(false)}
      />
    );

  return (
    <>
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
          {tab === 'cards'   && 
            <CardsTab 
              user={user} 
              cards={cards} 
              onScanCard={i => { setSelectedCard(i); 
              setTab('scan') }} 
              onAddCard={() => setShowAdd(true)} 
              pendingRewards={pendingRewards} 
              onOpenReward={i => setRewardModal(i)} />
              }

          {tab === 'scan' && 
          <ScanTab cards={cards} 
          selectedCard={selectedCard} 
          onScan={handleScan} 
          onAddCard={() => setShowAdd(true)} 
          scanState={scanState} 
          />}

          {tab === 'profile' && 
            <ProfileTab user={user} 
            cards={cards} 
            onLogout={handleLogout} 
            pendingRewards={pendingRewards} 
            onOpenReward={i => setRewardModal(i)} 
          />}
        </div>
        <TabBarClient active={tab} onChange={setTab} />
      </div>

      {rewardModal !== null && pendingRewards[rewardModal] && (
        <RewardModal
          card={pendingRewards[rewardModal].card}
          code={pendingRewards[rewardModal].code}
          onClose={() => setRewardModal(null)}
        />
      )}
    </>
  );
}