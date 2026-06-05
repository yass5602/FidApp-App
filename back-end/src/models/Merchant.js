// src/models/Merchant.js
import mongoose from 'mongoose'

const merchantSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  address:  { type: String, default: '' },
  category: { type: String, default: 'Divers' },
  plan:     { type: String, enum: ['freemium', 'solo', 'multi'], default: 'freemium' },
  ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat:      { type: Number, default: null },
  lng:      { type: Number, default: null },
}, { timestamps: true })

export default mongoose.model('Merchant', merchantSchema)