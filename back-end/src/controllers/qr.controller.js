// src/controllers/qr.controller.js
import Merchant from '../models/Merchant.js'
import Program  from '../models/Program.js'
import QRToken  from '../models/QRToken.js'

function generateShortCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// POST /api/qr/generate
export async function generateQRToken(request, reply) {
  const userId = request.user.id

  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(404).send({ error: 'Profil commerçant introuvable' })

  const isFreemium = merchant.plan === 'freemium'

  if (isFreemium) {
    // Freemium : QR statique — on réutilise l'existant ou on en crée un nouveau permanent
    let existing = await QRToken.findOne({ merchantId: merchant._id, isStatic: true })
    if (!existing) {
      let code, exists
      do {
        code   = generateShortCode()
        exists = await QRToken.findOne({ code })
      } while (exists)

      existing = await QRToken.create({
        code,
        merchantId: merchant._id,
        expiresAt:  new Date('2099-01-01'),  // jamais expiré
        isStatic:   true,
      })
    }
    return reply.send({ token: existing.code, expiresAt: null, isStatic: true })
  }

  // Solo / Multi : QR dynamique — supprimer l'ancien, créer un nouveau
  await QRToken.deleteMany({ merchantId: merchant._id, isStatic: false, usedAt: null })

  let code, exists
  do {
    code   = generateShortCode()
    exists = await QRToken.findOne({ code })
  } while (exists)

  const expiresAt = new Date(Date.now() + 60_000)

  await QRToken.create({ code, merchantId: merchant._id, expiresAt, isStatic: false })

  return reply.send({ token: code, expiresAt: expiresAt.getTime(), isStatic: false })
}

// GET /api/qr/merchant?token=A3F9K2
export async function getMerchantByQRToken(request, reply) {
  const code = request.query.token
  if (!code) return reply.status(400).send({ error: 'Token manquant' })

  const qrToken = await QRToken.findOne({ code: code.toUpperCase() })
  if (!qrToken) return reply.status(404).send({ error: 'QR code introuvable' })

  // Vérifier expiration uniquement pour les tokens dynamiques
  if (!qrToken.isStatic && qrToken.expiresAt < new Date()) {
    return reply.status(400).send({ error: 'QR code expiré' })
  }

  const merchant = await Merchant.findById(qrToken.merchantId).select('name category address')
  if (!merchant) return reply.status(404).send({ error: 'Commerçant introuvable' })

  const program = await Program.findOne({ merchantId: merchant._id, active: true })
  if (!program)  return reply.status(404).send({ error: 'Aucun programme actif pour ce commerçant' })

  return reply.send({
    merchant: {
      id:         merchant._id,
      name:       merchant.name,
      category:   merchant.category,
      address:    merchant.address,
      logo:       merchant.name.charAt(0).toUpperCase(),
      color1:     program.color1,
      color2:     program.color2,
      logoBase64: program.logoBase64,
      bgImage:    program.bgImage,
      maxPoints:  program.maxPoints,
      reward:     program.reward,
    },
    programId: program._id,
  })
}