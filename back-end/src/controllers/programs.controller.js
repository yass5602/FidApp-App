// src/controllers/programs.controller.js
import Program  from '../models/Program.js'
import Merchant from '../models/Merchant.js'
import Card     from '../models/Card.js'
import sharp    from 'sharp'

// POST /api/programs
export async function createProgram(request, reply) {
  const userId = request.user.id
  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(403).send({ error: 'Profil commerçant introuvable' })

  let { logoBase64, bgImage, ...rest } = request.body

  // Compresser le logo — 200×200 WebP
  if (logoBase64) {
    try {
      const buf = Buffer.from(logoBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      const out = await sharp(buf).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()
      logoBase64 = `data:image/webp;base64,${out.toString('base64')}`
    } catch {}
  }

  // Compresser l'image de fond — 800px max, WebP
  if (bgImage) {
    try {
      const buf = Buffer.from(bgImage.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      const out = await sharp(buf).resize(800, null, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer()
      bgImage = `data:image/webp;base64,${out.toString('base64')}`
    } catch {}
  }

const program = await Program.create({ ...rest, logoBase64, bgImage, merchantId: merchant._id })

// Géocoder l'adresse et mettre à jour le Merchant
if (rest.address) {
  try {
    const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(rest.address)}&format=json&limit=1`
    const res  = await fetch(url, { headers: { 'User-Agent': 'FidApp/1.0', 'Accept-Language': 'fr' } })
    const data = await res.json()
    if (data[0]) {
      await Merchant.findByIdAndUpdate(merchant._id, {
        address: rest.address,
        lat:     parseFloat(data[0].lat),
        lng:     parseFloat(data[0].lon),
      })
    }
  } catch {}
}

return reply.status(201).send(program)
}
// GET /api/programs
export async function getMyPrograms(request, reply) {
  const userId = request.user.id
  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.send([])

  const programs = await Program.find({ merchantId: merchant._id, active: true }).sort('-createdAt')

  // Enrichir avec les stats (nombre de clients, scans, récompenses)
  const enriched = await Promise.all(programs.map(async (p) => {
    const cards = await Card.find({ programId: p._id })
    return {
      ...p.toObject(),
      stats: {
        clients: cards.length,
        scans:   cards.reduce((s, c) => s + c.completedCount * p.maxPoints + c.currentPoints, 0),
        rewards: cards.reduce((s, c) => s + c.completedCount, 0),
      },
    }
  }))

  return reply.send(enriched)
}

// DELETE /api/programs/:id
export async function deleteProgram(request, reply) {
  const userId = request.user.id
  const { id } = request.params

  const merchant = await Merchant.findOne({ ownerId: userId })
  if (!merchant) return reply.status(403).send({ error: 'Non autorisé' })

  const program = await Program.findOne({ _id: id, merchantId: merchant._id })
  if (!program) return reply.status(404).send({ error: 'Programme introuvable' })

  // Soft delete (conserver les transactions historiques)
  program.active = false
  await program.save()

  return reply.send({ deleted: true })
}
