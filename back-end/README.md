# FidApp — Backend API

Node.js + Fastify + MongoDB Atlas

## Démarrage

```bash
npm install
cp .env.example .env    # remplir les valeurs
npm run dev             # http://localhost:3000
```

## Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/register` | — | Inscription |
| `POST` | `/api/login` | — | Connexion |
| `POST` | `/api/programs` | ✅ merchant | Créer un programme |
| `GET`  | `/api/programs` | ✅ merchant | Mes programmes |
| `DELETE` | `/api/programs/:id` | ✅ merchant | Supprimer |
| `GET`  | `/api/cards/me` | ✅ client | Mes cartes |
| `POST` | `/api/scan/:token` | ✅ client | Valider un scan |
| `POST` | `/api/qr/generate` | ✅ merchant | Token QR 60s |
| `GET`  | `/api/qr/:token/merchant` | — | Infos commerçant |
| `POST` | `/api/notifications` | ✅ merchant | Envoyer notif |
| `GET`  | `/api/rewards/pending` | ✅ merchant | Récompenses en attente |
| `POST` | `/api/rewards/:id/validate` | ✅ merchant | Valider récompense |
| `GET`  | `/api/merchant/stats` | ✅ merchant | Stats dashboard |
| `GET`  | `/health` | — | Health check |

## Variables d'environnement

Voir `.env.example` pour la liste complète.
