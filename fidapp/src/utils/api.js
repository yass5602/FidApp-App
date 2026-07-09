// utils/api.js
// Couche API centralisée.
// En mode DÉMO : toutes les fonctions renvoient des données mockées.
// En mode PROD  : décommenter les fetch() et supprimer les mocks.
//
// Variable d'environnement à créer dans .env :
//   VITE_API_URL=https://api.fidapp.fr

const BASE = import.meta.env.VITE_API_URL || "";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request(method, path, body) {
  const headers = {
    'ngrok-skip-browser-warning': 'true',   // ← ajouter cette ligne
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  }
  // N'ajouter Content-Type que si on envoie vraiment un body
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
if (!res.ok) {
  const err = await res.json().catch(() => ({ message: res.statusText }))
  // Token expiré ou invalide → déconnexion automatique
  if (res.status === 401) {
    setToken(null)
    localStorage.removeItem('fid_user')
    window.location.href = '/login'
  }
  throw new Error(err.error || err.message || 'Erreur réseau')
}
  return res.json()
}

const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const del = (path) => request("DELETE", path);

function getToken() {
  return localStorage.getItem("fid_token");
}
function setToken(token) {
  if (token) localStorage.setItem("fid_token", token);
  else localStorage.removeItem("fid_token");
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Inscription
 * POST /api/register
 * Body: { email, password, name, role, inviteCode? }
 * Returns: { token, user: { id, name, role } }
 */
// APRÈS
export async function apiRegister({ email, password, name, role, inviteCode }) {
  const data = await post('/register', { email, password, name, role, inviteCode })
  setToken(data.token)
  return data
}

/**
 * Connexion
 * POST /api/login
 * Body: { email, password }
 * Returns: { token, user: { id, name, role } }
 */
// APRÈS
export async function apiLogin({ email, password }) {
  const data = await post('/login', { email, password })
  setToken(data.token)
  return data
}

/**
 * Déconnexion (nettoyage local)
 */
export function apiLogout() {
  setToken(null);
  localStorage.removeItem("fid_user");
}

// ── Programmes de fidélité (commerçant) ──────────────────────────────────────

/**
 * Créer un programme
 * POST /api/programs
 * Body: { name, maxPoints, reward, palette, logo?, bgImage? }
 */
// APRÈS — supprimer les blocs DEMO, garder uniquement l'appel API
export async function apiCreateProgram(data) {
  return post('/programs', data)
}

export async function apiGetMyPrograms() {
  return get('/programs')
}

export async function apiDeleteProgram(id) {
  return del(`/programs/${id}`)
}

// ── Cartes client ─────────────────────────────────────────────────────────────

/**
 * Cartes du client connecté
 * GET /api/cards/me
 */
// APRÈS
export async function apiGetMyCards() {
  return get('/cards/me')
}

// ── Scan QR ───────────────────────────────────────────────────────────────────

/**
 * Valider un scan
 * POST /api/scan/:token
 * Returns: { card, pointsAdded, isComplete, reward? }
 */
// APRÈS
export async function apiScan(token) {
  return post(`/scan/${encodeURIComponent(token)}`);
}

/**
 * Identifier un commerçant depuis un token QR (nouveau client)
 * GET /api/qr/:token/merchant
 */
// APRÈS
export async function apiGetMerchantByQRToken(token) {
  return get(`/qr/merchant?token=${encodeURIComponent(token)}`);
}

// ── Notifications ─────────────────────────────────────────────────────────────

/**
 * Envoyer une notification
 * POST /api/notifications
 * Body: { target: 'all'|'loyal'|'inactive', message }
 */

export async function apiGetNotificationHistory() {
  return get('/notifications/history')
}

// APRÈS
export async function apiSendNotification({ target, message }) {
  return post('/notifications', { target, message })
}

export async function apiGetNotificationTargets() {
  return get('/notifications/targets')
}
// ── Récompenses (commerçant) ──────────────────────────────────────────────────

/**
 * Récompenses en attente de validation
 * GET /api/rewards/pending
 */
// APRÈS
export async function apiGetPendingRewards() {
  return get('/rewards/pending')
}

export async function apiRedeemReward(code) {
  return post('/rewards/redeem', { code: code.toUpperCase() })
}

export async function apiCheckRewardValidated(code) {
  return get(`/rewards/check?code=${encodeURIComponent(code)}`)
}

// ── Stats dashboard ────────────────────────────────────────────────────────────

/**
 * Stats du dashboard commerçant
 * GET /api/merchant/stats?period=day|week|month
 */
// APRÈS
export async function apiGetMerchantStats(period = "week") {
  return get(`/merchant/stats?period=${period}`);
}

// ── QR dynamique (sécurisé) ────────────────────────────────────────────────────

/**
 * Générer un QR JWT valable 60s
 * POST /api/qr/generate
 * Returns: { token, expiresAt }
 */
// APRÈS
export async function apiGenerateQRToken() {
  return post('/qr/generate')
}

// PATCH /api/merchant/plan
export async function apiUpdatePlan(plan) {
  return request('PATCH', '/merchant/plan', { plan })
}

// Localisation -----------
// GET /api/merchants/nearby
export async function apiGetNearbyMerchants({ lat, lng, radius = 10 }) {
  return get(`/merchants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
}

// PATCH /api/merchant/location
export async function apiUpdateLocation(address) {
  return request('PATCH', '/merchant/location', { address })
}

// PATCH /api/user/fcm-token
export async function apiUpdateFcmToken(fcmToken) {
  return request('PATCH', '/user/fcm-token', { fcmToken })
}