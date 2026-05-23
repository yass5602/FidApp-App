import Merchant    from '../models/Merchant.js'
import Card        from '../models/Card.js'
import Program     from '../models/Program.js'
import Notification from '../models/Notification.js'

// POST /api/notifications
export async function sendNotification(request, reply) {
  const userId = request.user.id
  const { target, message } = request.body

  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(403).send({ error: 'Non autorisé' })

  // Compter les clients réels selon la cible
  const programs = await Program.find({ merchantId: merchant._id, active: true })
  const programIds = programs.map(p => p._id)
  const allCards = await Card.find({ programId: { $in: programIds } })

  let count = 0
  if (target === 'all')      count = allCards.length
  if (target === 'loyal')    count = allCards.filter(c => c.completedCount > 0).length
  if (target === 'inactive') count = allCards.filter(c => c.currentPoints === 0 && c.completedCount === 0).length

  // Stocker en base
  const notif = await Notification.create({
    merchantId: merchant._id,
    target,
    message,
    count,
    opened: 0,  // sera mis à jour par FCM en prod
  })

  return reply.send({
    sent:   true,
    count,
    sentAt: notif.createdAt,
  })
}

// GET /api/notifications/history
export async function getNotificationHistory(request, reply) {
  const userId = request.user.id
  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send([])

  const history = await Notification.find({ merchantId: merchant._id })
    .sort({ createdAt: -1 })
    .limit(20)

  return reply.send(history)
}

// GET /api/notifications/targets
export async function getTargetCounts(request, reply) {
  const userId = request.user.id
  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send({ all: 0, loyal: 0, inactive: 0 })

  const programs = await Program.find({ merchantId: merchant._id, active: true })
  const programIds = programs.map(p => p._id)
  const allCards = await Card.find({ programId: { $in: programIds } })

  return reply.send({
    all:      allCards.length,
    loyal:    allCards.filter(c => c.completedCount > 0).length,
    inactive: allCards.filter(c => c.currentPoints === 0 && c.completedCount === 0).length,
  })
}