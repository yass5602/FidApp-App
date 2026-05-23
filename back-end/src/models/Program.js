// src/models/Program.js
import mongoose from 'mongoose'

const programSchema = new mongoose.Schema({
  merchantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name:        { type: String, required: true, trim: true },
  maxPoints:   { type: Number, required: true, min: 1, max: 20 },
  reward:      { type: String, required: true },
  color1:      { type: String, default: '#FF5C3A' },
  color2:      { type: String, default: '#FFB347' },
  logoBase64:  { type: String, default: null },  // stocké en base64 — passer à un bucket S3 en prod
  bgImage:     { type: String, default: null },
  active:      { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Program', programSchema)
