# FidApp — Guide d'installation complet

> Ce fichier remplace le `requirements.txt` des projets Python.
> En JavaScript/Node.js, les dépendances sont déclarées dans `package.json`
> et installées avec `npm install`.

---

## Prérequis système (à installer une seule fois sur ta machine)

### 1. Node.js ≥ 20

Vérifie si tu l'as déjà :
```bash
node --version   # doit afficher v20.x.x ou supérieur
npm --version    # doit afficher 10.x.x ou supérieur
```

Si ce n'est pas le cas, télécharge Node.js sur **https://nodejs.org** (choisir "LTS").  
L'installation de Node.js inclut automatiquement `npm`.

### 2. Git (pour travailler en équipe)

```bash
git --version    # vérifie s'il est installé
```

Sinon : **https://git-scm.com/downloads**

---

## Structure des deux projets

```
fidapp-final/
├── fidapp/           ← Frontend React   (port 5173)
└── fidapp-backend/   ← Backend Node.js  (port 3000)
```

Chaque projet a son propre `package.json` et ses propres dépendances.
**Les deux `npm install` sont indépendants** — il faut les exécuter séparément.

---

## Installation — Frontend (`fidapp/`)

### Dépendances déclarées dans `fidapp/package.json`

| Package | Version | Rôle |
|---------|---------|------|
| `react` | ^18.3.1 | Bibliothèque UI principale |
| `react-dom` | ^18.3.1 | Rendu React dans le navigateur |
| `react-router-dom` | ^6.27.0 | Navigation entre les pages (`/`, `/login`, `/client`, `/merchant`) |
| `vite` *(dev)* | ^5.4.11 | Serveur de développement ultra-rapide + bundler de production |
| `@vitejs/plugin-react` *(dev)* | ^4.3.3 | Plugin Vite pour supporter JSX et React Fast Refresh |

### Commandes d'installation

```bash
# 1. Aller dans le dossier frontend
cd fidapp

# 2. Installer toutes les dépendances listées dans package.json
#    Crée le dossier node_modules/ et le fichier package-lock.json
npm install

# 3. Créer le fichier de configuration locale (copier l'exemple)
cp .env.example .env.local

# 4. Lancer le serveur de développement
npm run dev
# → L'app est accessible sur http://localhost:5173
```

### Dépendances optionnelles à installer plus tard (quand tu branches le vrai scanner et le QR)

Ces packages ne sont **pas encore dans `package.json`** — tu les ajouteras quand tu en auras besoin :

```bash
# Vrai scanner QR caméra (remplace la simulation)
npm install jsqr

# Génération du QR code depuis le token JWT (remplace QRSvg.jsx)
npm install qrcode.react
```

### Scripts disponibles

```bash
npm run dev       # Démarre le serveur de développement (avec hot reload)
npm run build     # Compile l'app pour la production → dossier dist/
npm run preview   # Prévisualise le build de production en local
```

---

## Installation — Backend (`fidapp-backend/`)

### Dépendances déclarées dans `fidapp-backend/package.json`

| Package | Version | Rôle |
|---------|---------|------|
| `fastify` | ^4.28.1 | Serveur HTTP Node.js (plus rapide qu'Express) |
| `@fastify/cors` | ^9.0.1 | Autorise le frontend (localhost:5173, Vercel) à appeler l'API |
| `@fastify/jwt` | ^8.0.1 | Vérifie les tokens JWT sur les routes protégées |
| `mongoose` | ^8.4.1 | ORM MongoDB — définit les schémas et fait les requêtes en base |
| `bcryptjs` | ^2.4.3 | Hachage sécurisé des mots de passe (jamais stockés en clair) |
| `dotenv` | ^16.4.5 | Charge les variables d'environnement depuis le fichier `.env` |
| `eslint` *(dev)* | ^9.0.0 | Linter — détecte les erreurs de code |

### Commandes d'installation

```bash
# 1. Aller dans le dossier backend (depuis la racine du projet)
cd fidapp-backend

# 2. Installer toutes les dépendances
npm install

# 3. Créer le fichier de configuration (NE JAMAIS committer ce fichier)
cp .env.example .env

# 4. Ouvrir .env et remplir les valeurs obligatoires :
#    - MONGODB_URI   → ton URL MongoDB Atlas (voir section MongoDB ci-dessous)
#    - JWT_SECRET    → générer avec la commande ci-dessous
#    - QR_JWT_SECRET → générer avec la commande ci-dessous

# Générer des secrets aléatoires sécurisés :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copier la sortie dans JWT_SECRET, relancer pour QR_JWT_SECRET

# 5. Lancer le serveur de développement
npm run dev
# → API accessible sur http://localhost:3000
# → Vérification : http://localhost:3000/health doit retourner { "status": "ok" }
```

### Scripts disponibles

```bash
npm run dev     # Démarre avec --watch (redémarre automatiquement à chaque modification)
npm run start   # Démarre en mode production (sans --watch)
npm run lint    # Vérifie le code avec ESLint
```

---

## Configurer MongoDB Atlas (base de données cloud)

MongoDB Atlas est la base de données cloud utilisée par le backend.
Le plan gratuit (M0) est suffisant pour démarrer.

### Étapes

**1.** Créer un compte sur **https://cloud.mongodb.com** (gratuit)

**2.** Créer un nouveau projet → "Create Cluster" → choisir **M0 Free**

**3.** Dans "Database Access" → "Add New Database User" :
   - Username : `fidapp-user`
   - Password : générer un mot de passe fort (le noter)
   - Rôle : "Read and write to any database"

**4.** Dans "Network Access" → "Add IP Address" :
   - En développement : cliquer "Allow Access from Anywhere" (`0.0.0.0/0`)
   - En production : restreindre à l'IP de ton serveur Railway/Render

**5.** Dans "Clusters" → "Connect" → "Drivers" → copier l'URI :
   ```
   mongodb+srv://fidapp-user:<password>@cluster0.xxxxx.mongodb.net/fidapp?retryWrites=true&w=majority
   ```
   Remplacer `<password>` par le mot de passe créé à l'étape 3.

**6.** Coller cette URI dans `fidapp-backend/.env` :
   ```env
   MONGODB_URI=mongodb+srv://fidapp-user:monMotDePasse@cluster0.xxxxx.mongodb.net/fidapp?retryWrites=true&w=majority
   ```

---

## Lancer les deux projets en même temps

Ouvrir **deux terminaux** côte à côte :

```bash
# Terminal 1 — Frontend
cd fidapp
npm run dev
# http://localhost:5173

# Terminal 2 — Backend
cd fidapp-backend
npm run dev
# http://localhost:3000
```

Pour que le frontend appelle le backend local, vérifier que `fidapp/.env.local` contient :
```env
VITE_API_URL=http://localhost:3000
```

---

## Installation pour un nouveau développeur (résumé en 5 minutes)

```bash
# Cloner le repo
git clone https://github.com/ton-org/fidapp.git
cd fidapp

# ── Frontend ──────────────────────────────
cd fidapp
npm install
cp .env.example .env.local
# Éditer .env.local : VITE_API_URL=http://localhost:3000
npm run dev

# ── Backend (nouveau terminal) ────────────
cd ../fidapp-backend
npm install
cp .env.example .env
# Éditer .env : remplir MONGODB_URI, JWT_SECRET, QR_JWT_SECRET
npm run dev
```

---

## Résumé des versions minimales requises

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| Node.js | 20.0.0 | `node --version` |
| npm | 10.0.0 | `npm --version` |
| Git | 2.x | `git --version` |

---

## En cas de problème

**`node_modules` corrompu ou erreurs bizarres :**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port déjà utilisé :**
```bash
# Trouver et tuer le process sur le port 5173 (frontend)
npx kill-port 5173

# Ou changer le port dans vite.config.js :
export default defineConfig({
  server: { port: 5174 }
})
```

**Variables d'environnement non chargées :**
- Frontend : le fichier doit s'appeler `.env.local` (pas `.env`)
- Backend : le fichier doit s'appeler `.env` (pas `.env.local`)
- Toutes les variables frontend doivent commencer par `VITE_`
