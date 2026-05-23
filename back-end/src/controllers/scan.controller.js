// src/controllers/scan.controller.js
import Card        from '../models/Card.js'
import Program     from '../models/Program.js'
import Transaction from '../models/Transaction.js'
import QRToken     from '../models/QRToken.js'

function generateRewardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// POST /api/scan/:token
export async function validateScan(request, reply) {
  const code   = request.params.token.toUpperCase()
  const userId = request.user.id

  // 1. Trouver le token QR en base
  const qrToken = await QRToken.findOne({ code })
  if (!qrToken) {
    return reply.status(404).send({ error: 'QR code introuvable' })
  }

  // 2. Vérifier expiration (dynamiques uniquement)
  if (!qrToken.isStatic && qrToken.expiresAt < new Date()) {
    return reply.status(400).send({ error: 'QR code expiré — demandez au commerçant de renouveler' })
  }

  // 3. Usage unique pour les tokens dynamiques
  if (!qrToken.isStatic && qrToken.usedAt) {
    return reply.status(409).send({ error: 'Ce QR code a déjà été utilisé' })
  }

  // 4. Trouver le programme actif
  const program = await Program.findOne({ merchantId: qrToken.merchantId, active: true })
  if (!program) {
    return reply.status(404).send({ error: 'Aucun programme actif pour ce commerçant' })
  }

  // 5. Trouver ou créer la carte du client
  let card        = await Card.findOne({ userId, programId: program._id })
  const isNewCard = !card

  if (!card) {
    card = await Card.create({ userId, programId: program._id, currentPoints: 0 })
  }

  // 6. Incrémenter les points
  const newPoints  = card.currentPoints + (program.pointsPerScan || 1)
  const isComplete = newPoints >= program.maxPoints

  card.currentPoints = isComplete ? 0 : newPoints
  if (isComplete) card.completedCount += 1
  await card.save()

  // 7. Marquer le token dynamique comme utilisé
  if (!qrToken.isStatic) {
    qrToken.usedAt = new Date()
    await qrToken.save()
  }

  // 8. Générer le code de récompense si carte complète
  const rewardCode = isComplete ? generateRewardCode() : null

  // 9. Enregistrer la transaction

  // APRÈS — pour les tokens statiques, on génère un identifiant unique par scan
  const transactionKey = qrToken.isStatic
    ? `${code}_${Date.now()}_${userId}`
    : code

  await Transaction.create({
    cardId:      card._id,
    qrTokenUsed: transactionKey,
    pointsAdded: program.pointsPerScan || 1,
    isNewCard,
    isComplete,
    rewardCode,
  })

  return reply.send({
    pointsAdded:    program.pointsPerScan || 1,
    currentPoints:  card.currentPoints,
    maxPoints:      program.maxPoints,
    isNewCard,
    isComplete,
    reward:         isComplete ? program.reward : null,
    rewardCode,
    completedCount: card.completedCount,
  })
}