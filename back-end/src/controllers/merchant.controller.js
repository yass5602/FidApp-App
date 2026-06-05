// src/controllers/merchant.controller.js
import Merchant from '../models/Merchant.js'
import Program  from '../models/Program.js'

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

// PATCH /api/merchant/location
export async function updateLocation(request, reply) {
  const { address } = request.body
  if (!address) return reply.status(400).send({ error: 'Adresse requise' })

  // Géocoder l'adresse via Nominatim
  let lat = null
  let lng = null
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    const res  = await fetch(url, {
      headers: { 'User-Agent': 'FidApp/1.0', 'Accept-Language': 'fr' }
    })
    const data = await res.json()
    if (data[0]) {
      lat = parseFloat(data[0].lat)
      lng = parseFloat(data[0].lon)
    }
  } catch {}

  const merchant = await Merchant.findOneAndUpdate(
    { ownerId: request.user.id },
    { address, lat, lng },
    { new: true }
  )
  if (!merchant) return reply.status(404).send({ error: 'Commerçant introuvable' })

  return reply.send({
    address: merchant.address,
    lat:     merchant.lat,
    lng:     merchant.lng,
    geocoded: lat !== null,
  })
}

// Haversine — distance en km
function haversine(lat1, lng1, lat2, lng2) {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    = Math.sin(dLat/2)**2 +
               Math.cos(lat1 * Math.PI/180) *
               Math.cos(lat2 * Math.PI/180) *
               Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// GET /api/merchants/nearby?lat=&lng=&radius=
export async function getNearbyMerchants(request, reply) {
  const { lat, lng, radius = 10 } = request.query

  if (!lat || !lng) {
    return reply.status(400).send({ error: 'Coordonnées requises' })
  }

  const userLat = parseFloat(lat)
  const userLng = parseFloat(lng)
  const maxKm   = parseFloat(radius)

  // Récupérer tous les commerçants avec coordonnées
  const merchants = await Merchant.find({
    lat: { $ne: null },
    lng: { $ne: null },
  })

  // Calculer les distances et filtrer par rayon
  const nearby = merchants
    .map(m => ({
      id:       m._id,
      name:     m.name,
      category: m.category,
      address:  m.address,
      distance: haversine(userLat, userLng, m.lat, m.lng),
    }))
    .filter(m => m.distance <= maxKm)
    .sort((a, b) => a.distance - b.distance)

  // Enrichir avec le programme actif de chaque commerçant
  const enriched = await Promise.all(nearby.map(async m => {
    const program = await Program.findOne({ merchantId: m.id, active: true })
    if (!program) return null
    return {
      ...m,
      color1:    program.color1,
      color2:    program.color2,
      logoBase64: program.logoBase64,
      maxPoints: program.maxPoints,
      reward:    program.reward,
      programId: program._id,
      logo:      m.name.charAt(0).toUpperCase(),
    }
  }))

  return reply.send(enriched.filter(Boolean))
}