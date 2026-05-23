// src/utils/jwt.js
// Gestion des tokens JWT QR (différents des tokens d'auth Fastify)
import jwt    from 'jsonwebtoken'
import { config } from '../config.js'

/**
 * Génère un token QR signé, valable config.qrJwtExpiresIn (60s par défaut).
 * Contient { merchantId, type: 'qr' }.
 */
export function signQRToken(merchantId) {
  return jwt.sign(
    { merchantId, type: 'qr' },
    config.qrJwtSecret,
    { expiresIn: config.qrJwtExpiresIn }
  )
}

/**
 * Vérifie et décode un token QR.
 * Lance une erreur si expiré ou signature invalide.
 */
export function verifyQRToken(token) {
  return jwt.verify(token, config.qrJwtSecret)
}
