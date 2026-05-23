// src/controllers/merchant.controller.js
import Merchant from '../models/Merchant.js'

// PATCH /api/merchant/plan
export async function updatePlan(request, reply) {
  const { plan } = request.body
  if (!['freemium', 'solo', 'multi'].includes(plan)) {
    return reply.status(400).send({ error: 'Plan invalide' })
  }
  const merchant = await Merchant.findOneAndUpdate(
    { ownerId: request.user.id },
    { plan },
    { new: true }
  )
  if (!merchant) return reply.status(404).send({ error: 'Commerçant introuvable' })
  return reply.send({ plan: merchant.plan })
}