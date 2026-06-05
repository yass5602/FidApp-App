// src/config.js
// Point d'entrée unique pour toutes les variables d'environnement.
// Importer depuis ici plutôt que process.env directement.

// src/config.js
import * as dotenv from 'dotenv'

// Charger .env uniquement en développement — en prod Railway injecte les variables directement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

function require(key) {
  const val = process.env[key]
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`)
  return val
}

export const config = {
  port:            parseInt(process.env.PORT || '3000', 10),
  nodeEnv:         process.env.NODE_ENV || 'development',
  isDev:           (process.env.NODE_ENV || 'development') === 'development',

  mongoUri:        require('MONGODB_URI'),

  jwtSecret:       require('JWT_SECRET'),
  jwtExpiresIn:    process.env.JWT_EXPIRES_IN    || '7d',

  qrJwtSecret:     require('QR_JWT_SECRET'),
  qrJwtExpiresIn:  process.env.QR_JWT_EXPIRES_IN || '60s',

  allowedOrigins:  (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
}
