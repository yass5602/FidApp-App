// src/index.js
import Fastify          from 'fastify'
import fastifyCors      from '@fastify/cors'
import fastifyJwt       from '@fastify/jwt'
import fastifyHelmet    from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import { config }       from './config.js'
import { connectDB }    from './db/connect.js'

// Routes
import authRoutes          from './routes/auth.routes.js'
import programsRoutes      from './routes/programs.routes.js'
import cardsRoutes         from './routes/cards.routes.js'
import scanRoutes          from './routes/scan.routes.js'
import qrRoutes            from './routes/qr.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import rewardsRoutes       from './routes/rewards.routes.js'
import statsRoutes         from './routes/stats.routes.js'
import merchantRoutes from './routes/merchant.routes.js'

import '../src/models/QRToken.js'  // enregistrement du modèle + création index TTL

// trustProxy: true corrige la CVE spoofing X-Forwarded (Fastify v5)
const app = Fastify({ logger: config.isDev, trustProxy: true })

// ── Plugins ───────────────────────────────────────────────────────────────────

// Headers de sécurité HTTP
/*await app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...config.allowedOrigins],
    },
  },
})

// CORS
await app.register(fastifyCors, {
  origin: config.allowedOrigins,
  credentials: true,
})*/

// APRÈS
await app.register(fastifyCors, {
  origin: (origin, cb) => {
    // Autoriser les requêtes sans origine (mobile, Postman)
    if (!origin) return cb(null, true)
    if (config.isDev || config.allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Non autorisé par CORS'), false)
    }
  },
  credentials: true,
})

// JWT auth (sessions 7 jours)
await app.register(fastifyJwt, {
  secret: config.jwtSecret,
})

// Upload fichiers — limite 5MB (utilisé pour logos/images en base64)
await app.register(fastifyMultipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
})

// ── Décorateur auth ───────────────────────────────────────────────────────────
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ error: 'Non autorisé', message: err.message })
  }
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.register(authRoutes,          { prefix: '/api' })
app.register(programsRoutes,      { prefix: '/api' })
app.register(cardsRoutes,         { prefix: '/api' })
app.register(scanRoutes,          { prefix: '/api' })
app.register(qrRoutes,            { prefix: '/api' })
app.register(notificationsRoutes, { prefix: '/api' })
app.register(rewardsRoutes,       { prefix: '/api' })
app.register(statsRoutes,         { prefix: '/api' })
app.register(merchantRoutes,      { prefix: '/api' })

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async () => { return { status: 'ok', env: config.nodeEnv } })

// ── Démarrage ─────────────────────────────────────────────────────────────────
async function start() {
  await connectDB()
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`🚀 FidApp API démarrée sur http://localhost:${config.port}`)
}

start()