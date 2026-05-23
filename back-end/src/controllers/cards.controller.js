// src/controllers/cards.controller.js
import Card    from '../models/Card.js'
import Program from '../models/Program.js'

// GET /api/cards/me
export async function getMyCards(request, reply) {
  const userId = request.user.id

  const cards = await Card.find({ userId }).populate({
    path: 'programId',
    populate: { path: 'merchantId', select: 'name category' },
  })

  // Formater pour le frontend (même structure que DEMO_CLIENT_CARDS)
  const formatted = cards.map(c => ({
    id:        c._id,
    programId: c.programId._id,        // ← nécessaire pour le scan étape 3
    points:    c.currentPoints,
    merchant: {
      id:         c.programId.merchantId._id,
      name:       c.programId.merchantId.name,
      category:   c.programId.merchantId.category,
      maxPoints:  c.programId.maxPoints,
      reward:     c.programId.reward,
      color1:     c.programId.color1,
      color2:     c.programId.color2,
      logoBase64: c.programId.logoBase64,
      bgImage:    c.programId.bgImage,   // ← image de couverture
      logo:       c.programId.merchantId.name.charAt(0).toUpperCase(),
    },
  }))

  return reply.send(formatted)
}
