// src/models/QRToken.js
import mongoose from 'mongoose'

const qrTokenSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  expiresAt:  { type: Date, required: true },
  usedAt:     { type: Date, default: null },
  isStatic:   { type: Boolean, default: false },
}, { timestamps: true })

qrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 })

export default mongoose.model('QRToken', qrTokenSchema)