// src/controllers/rewards.controller.js
// Les récompenses "en attente" sont des cartes complétées non encore validées.

import Card     from '../models/Card.js'
import Program  from '../models/Program.js'
import Merchant from '../models/Merchant.js'
import User     from '../models/User.js'

// GET /api/rewards/pending
export async function getPendingRewards(request, reply) {
  const userId = request.user.id
  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send([])

  const programs = await Program.find({ merchantId: merchant._id, active: true })
  const programIds = programs.map(p => p._id)

  // Cartes avec au moins une complétion non validée
  // (simplification : retourner toutes les cartes complétées récemment)
  const completedCards = await Card.find({
    programId: { $in: programIds },
    completedCount: { $gt: 0 },
  }).populate('userId', 'name').populate('programId', 'name reward')

  const rewards = completedCards.map(c => ({
    id:          c._id,
    clientName:  c.userId.name,
    programName: c.programId.name,
    reward:      c.programId.reward,
    count:       c.completedCount,
  }))

  return reply.send(rewards)
}

// POST /api/rewards/:id/validate
export async function validateReward(request, reply) {
  const { id } = request.params
  const userId = request.user.id

  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(403).send({ error: 'Non autorisé' })

  const card = await Card.findById(id)
  if (!card) return reply.status(404).send({ error: 'Carte introuvable' })

  // Décrémenter le compteur de complétions
  if (card.completedCount > 0) {
    card.completedCount -= 1
    await card.save()
  }

  return reply.send({ validated: true })
}
