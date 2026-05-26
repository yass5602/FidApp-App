# FidApp — Frontend React

Application mobile de cartes de fidélité dématérialisées pour les commerces de proximité.

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ prêt pour Vercel
```

## Comptes de démonstration

| Rôle        | Email          | Mot de passe | Code invitation    |
|-------------|----------------|--------------|--------------------|
| Client      | n'importe quel | ≥ 6 cars.    | —                  |
| Commerçant  | n'importe quel | ≥ 6 cars.    | `FIDELE-DEMO-9999` |

Autres codes commerçants : `FIDELE-CAFE-0001`, `FIDELE-BIO-0002`, `FIDELE-BOUL-0003`

---

## Arborescence

```
src/
├── App.jsx                     Routing + ProtectedRoute + StatusBar
├── main.jsx                    Point d'entrée React
├── index.css                   Design system complet (CSS variables)
│
├── context/
│   └── AppContext.jsx          useApp() · useAuth() · AppProvider
│
├── pages/
│   ├── SplashPage.jsx          Accueil / pitch
│   ├── LoginPage.jsx           Auth client + commerçant
│   ├── ClientPage.jsx          Cartes · Scan · Profil
│   └── MerchantPage.jsx        Dashboard · QR · Cartes · Créer · Notifs
│
├── components/
│   ├── LoyaltyCard.jsx         Carte fidélité avec tampons
│   ├── QRSvg.jsx               QR code SVG statique (démo)
│   │
│   ├── merchant/
│   │   ├── DashboardTab.jsx    KPIs + activité
│   │   ├── QRCodeTab.jsx       QR animé + countdown JWT
│   │   ├── MyCardsTab.jsx      Collection + suppression
│   │   ├── CardCreatorTab.jsx  Formulaire 3 étapes
│   │   └── NotifsTab.jsx       Envoi + historique
│   │
│   └── UI/                     ⚠️ Majuscule obligatoire
│       ├── Icons.jsx           35 icônes SVG outline
│       ├── Toast.jsx           Notification temporaire
│       ├── Modal.jsx           Bottom sheet
│       ├── TabBar.jsx          Navigation onglets
│       ├── Button.jsx          Bouton unifié
│       └── Confetti.jsx        Animation confettis
│
├── constants/
│   ├── colors.js               Palette + CARD_PALETTES
│   └── merchants.js            DEMO_MERCHANTS · DEMO_CLIENT_CARDS · DEMO_NOTIF_HISTORY
│
└── utils/
    └── api.js                  Couche API centralisée (mode démo + stubs prod)
```

---

## Règles importantes

- `useApp()` et `useAuth()` : toujours depuis `context/AppContext.jsx`
- `showToast()` et `fireConfetti()` : toujours via `useApp()`, jamais en props
- Le dossier `UI` est en **majuscule** — tous les imports doivent écrire `UI` pas `ui`
- `AppContext.jsx` — A et C majuscules
- Ne jamais définir un composant à l'intérieur d'un autre (perte de focus inputs)

---

## Migration vers le backend (Node.js + Fastify + MongoDB Atlas)

### 1. Variable d'environnement

```bash
# .env.local
VITE_API_URL=https://api.fidapp.fr
```

Dès que `VITE_API_URL` est défini, `utils/api.js` bascule en mode réel et appelle l'API.

### 2. Points de migration par fichier

#### `pages/LoginPage.jsx` — `handleSubmit()`
```js
// Remplacer le setTimeout par :
if (mode === 'register') {
  const data = await apiRegister({ email, password: pwd, name, role, inviteCode })
  login(data.user.name, data.user.role)
} else {
  const data = await apiLogin({ email, password: pwd })
  login(data.user.name, data.user.role)
}
```

#### `pages/ClientPage.jsx` — `handleScan()`
```js
// Remplacer le setTimeout par :
const result = await apiScan(qrToken) // qrToken = résultat react-qr-reader
// result = { pointsAdded, isComplete, reward? }
```

#### `pages/ClientPage.jsx` — Chargement des cartes
```js
// Remplacer useState(DEMO_CLIENT_CARDS) par :
const [cards, setCards] = useState([])
useEffect(() => {
  apiGetMyCards().then(setCards)
}, [])
```

#### `components/merchant/CardCreatorTab.jsx` — `onCreated()`
```js
// Dans MerchantPage.handleCardCreated() :
const saved = await apiCreateProgram(card)
setCards(prev => [...prev, saved])
```

#### `components/merchant/NotifsTab.jsx` — `handleSend()`
```js
// Déjà préparé — décommenter :
await apiSendNotification({ target, message })
```

#### `components/merchant/QRCodeTab.jsx` — QR dynamique
```js
// Remplacer le QR statique par :
const [qrToken, setQrToken] = useState(null)
useEffect(() => {
  apiGenerateQRToken().then(({ token }) => setQrToken(token))
  const interval = setInterval(async () => {
    const { token } = await apiGenerateQRToken()
    setQrToken(token)
  }, 55_000)
  return () => clearInterval(interval)
}, [])
// Afficher le QR depuis qrToken avec une lib (qrcode.react)
```

### 3. Vraie caméra QR

```bash
npm install jsqr
```

Dans `pages/ClientPage.jsx` — `ScanTab`, remplacer le bouton "Simuler un scan" par :
```js
import jsQR from 'jsqr'
// Accéder à navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
// Dessiner sur un canvas, extraire avec jsQR(imageData, width, height)
// Appeler handleScan(token) avec le résultat
```

### 4. Endpoints backend à créer

```
POST   /api/register               { email, password, name, role, inviteCode? }
POST   /api/login                  { email, password } → { token, user }
POST   /api/programs               Créer programme
GET    /api/programs               Mes programmes (commerçant)
DELETE /api/programs/:id           Supprimer
POST   /api/scan/:token            Valider scan → crédite point
GET    /api/cards/me               Cartes du client connecté
POST   /api/notifications          Envoyer notification push
GET    /api/rewards/pending        Récompenses en attente
POST   /api/rewards/:id/validate   Valider récompense
GET    /api/merchant/stats         Stats dashboard (?period=day|week|month)
POST   /api/qr/generate            Générer token JWT 60s
GET    /api/qr/:token/merchant     Identifier commerçant depuis token
```

### 5. Schéma MongoDB

```js
// users        { name, email, passwordHash, role, createdAt }
// merchants    { name, address, category, plan, ownerId }
// programs     { merchantId, maxPoints, reward, pointsPerScan }
// cards        { userId, programId, currentPoints, completedCount }
// transactions { cardId, tokenUsed, pointsAdded, scannedAt }
// invitations  { code, merchantData, usedAt, usedBy }
```

---

## Déploiement Vercel

`vercel.json` est déjà configuré pour le routing SPA :
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

```bash
git push  # → déploiement automatique sur Vercel
```

---

## Design system

| Variable CSS   | Valeur    | Usage                        |
|----------------|-----------|------------------------------|
| `--coral`      | `#FF5C3A` | Primaire, boutons CTA        |
| `--navy`       | `#1B2340` | Headers, textes foncés       |
| `--gold`       | `#FFB347` | Récompenses, accents chauds  |
| `--mint`       | `#2ECC9A` | Succès, stats positives      |
| `--danger`     | `#FF4466` | Erreurs, suppression         |
| `--bg`         | `#FFF8F0` | Fond général                 |
| `--surface`    | `#FFFFFF` | Cartes, panels               |
| `--surfaceAlt` | `#F2F4FF` | Fonds légers, toggles        |

Typographie : **Syne** 700-900 (titres) · **DM Sans** 400-700 (corps)
