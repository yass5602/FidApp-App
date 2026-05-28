// src/controllers/rewards.controller.js
import Transaction from '../models/Transaction.js'
import Card        from '../models/Card.js'
import Program     from '../models/Program.js'
import Merchant    from '../models/Merchant.js'

// GET /api/rewards/pending
// Récompenses en attente de validation pour ce commerçant
export async function getPendingRewards(request, reply) {
  const userId = request.user.id

  const merchant  = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send([])

  const programs  = await Program.find({ merchantId: merchant._id, active: true })
  const programIds = programs.map(p => p._id)
  const cards     = await Card.find({ programId: { $in: programIds } })
  const cardIds   = cards.map(c => c._id)

  const pending = await Transaction.find({
    cardId:           { $in: cardIds },
    rewardCode:       { $ne: null },
    rewardValidated:  false,
  })
  .sort({ createdAt: -1 })
  .populate({ path: 'cardId', populate: { path: 'userId', select: 'name' } })

  return reply.send(pending.map(t => ({
    id:          t._id,
    rewardCode:  t.rewardCode,
    clientName:  t.cardId?.userId?.name || 'Client',
    createdAt:   t.createdAt,
  })))
}

// POST /api/rewards/redeem
// Le commerçant valide le code présenté par le client
export async function redeemReward(request, reply) {
  const userId = request.user.id
  const { code } = request.body

  if (!code || code.length !== 6) {
    return reply.status(400).send({ error: 'Code invalide — 6 caractères attendus' })
  }

  // Vérifier que ce code appartient bien à un programme de ce commerçant
  const merchant  = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(403).send({ error: 'Non autorisé' })

  const programs  = await Program.find({ merchantId: merchant._id })
  const programIds = programs.map(p => p._id)
  const cards     = await Card.find({ programId: { $in: programIds } })
  const cardIds   = cards.map(c => c._id)

  const transaction = await Transaction.findOne({
    cardId:          { $in: cardIds },
    rewardCode:      code.toUpperCase(),
    rewardValidated: false,
  })

  if (!transaction) {
    return reply.status(404).send({ error: 'Code introuvable ou déjà validé' })
  }

  transaction.rewardValidated  = true
  transaction.rewardValidatedAt = new Date()
  await transaction.save()

  return reply.send({ success: true, message: 'Récompense validée ✅' })
}

// GET /api/rewards/check?code=A3F9K2
export async function checkRewardValidated(request, reply) {
  const { code } = request.query
  if (!code) return reply.status(400).send({ error: 'Code manquant' })

  const transaction = await Transaction.findOne({
    rewardCode: code.toUpperCase()
  })

  if (!transaction) return reply.status(404).send({ error: 'Code introuvable' })

  return reply.send({ validated: transaction.rewardValidated })
}