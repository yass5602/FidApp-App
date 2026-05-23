// src/models/Card.js
import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  programId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  currentPoints:  { type: Number, default: 0, min: 0 },
  completedCount: { type: Number, default: 0 },
}, { timestamps: true })

cardSchema.index({ userId: 1, programId: 1 }, { unique: true })

export default mongoose.model('Card', cardSchema)