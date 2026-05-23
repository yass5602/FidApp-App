// src/controllers/auth.controller.js
import User       from '../models/User.js'
import Invitation from '../models/Invitation.js'
import Merchant   from '../models/Merchant.js'
import { hashPassword, comparePassword } from '../utils/hash.js'

// POST /api/register
export async function register(request, reply) {
  const { email, password, name, role, inviteCode } = request.body

  // Vérifier email unique (normalisé pour éviter les doublons casse)
  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) return reply.status(409).send({ error: 'Cet email est déjà utilisé' })

  if (role === 'merchant') {
    if (!inviteCode) return reply.status(400).send({ error: "Code d'invitation requis" })

    const invite = await Invitation.findOne({ code: inviteCode.toUpperCase(), usedAt: null })
    if (!invite) return reply.status(400).send({ error: "Code d'invitation invalide ou déjà utilisé" })

    const passwordHash = await hashPassword(password)
    let user
    try {
      user = await User.create({ name, email, passwordHash, role })
    } catch (e) {
      if (e.code === 11000) return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
      throw e
    }

    await Merchant.create({ ...invite.merchantData, name, ownerId: user._id })

    invite.usedAt = new Date()
    invite.usedBy = user._id
    await invite.save()

    // APRÈS
    const token = await reply.jwtSign({ id: user._id, role: user.role }, { expiresIn: '7d' })
    return reply.status(201).send({
      token,
      user: { id: user._id, name: user.name, role: user.role, plan: merchant.plan || 'freemium' }
    })
  }

  // Client
  const passwordHash = await hashPassword(password)
  let user
  try {
    user = await User.create({ name, email, passwordHash, role })
  } catch (e) {
    if (e.code === 11000) return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
    throw e
  }

  const token = await reply.jwtSign({ id: user._id, role: user.role }, { expiresIn: '7d' })
  return reply.status(201).send({ token, user: { id: user._id, name: user.name, role: user.role } })
}

// POST /api/login
export async function login(request, reply) {
  const { email, password } = request.body

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return reply.status(401).send({ error: 'Email ou mot de passe incorrect' })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) return reply.status(401).send({ error: 'Email ou mot de passe incorrect' })

  // APRÈS
  const merchant = user.role === 'merchant'
    ? await Merchant.findOne({ ownerId: user._id })
    : null
  const token = await reply.jwtSign({ id: user._id, role: user.role }, { expiresIn: '7d' })
  return reply.send({
    token,
    user: {
      id:   user._id,
      name: user.name,
      role: user.role,
      plan: merchant?.plan || null,
    }
  })
}