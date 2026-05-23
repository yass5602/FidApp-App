// src/controllers/stats.controller.js
import Transaction from '../models/Transaction.js'
import Card        from '../models/Card.js'
import Program     from '../models/Program.js'
import Merchant    from '../models/Merchant.js'

const PERIOD_MS = { today: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000 }

export async function getMerchantStats(request, reply) {
  const userId = request.user.id
  const period = request.query.period || 'week'

  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send({ clients: 0, scans: 0, rewards: 0, newClients: 0 })

  const since    = new Date(Date.now() - (PERIOD_MS[period] || PERIOD_MS.week))
  const programs = await Program.find({ merchantId: merchant._id, active: true })
  const programIds = programs.map(p => p._id)

  // Toutes les cartes liées aux programmes du commerçant
  const allCards = await Card.find({ programId: { $in: programIds } })
  const cardIds  = allCards.map(c => c._id)

  // Transactions sur la période
  const transactions = await Transaction.find({
    cardId:    { $in: cardIds },
    createdAt: { $gte: since },
  })

  // Nouvelles cartes créées sur la période (= nouveaux clients)
  const newCards = await Card.find({
    programId:  { $in: programIds },
    createdAt:  { $gte: since },
  })

  // Récompenses déclenchées sur la période
  const rewards = transactions.filter(t => t.isComplete).length

  return reply.send({
    clients:    allCards.length,
    scans:      transactions.length,
    rewards,
    newClients: newCards.length,
    period,
  })
}