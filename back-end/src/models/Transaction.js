// src/models/Transaction.js
import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  cardId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  qrTokenUsed: { type: String, required: true, unique: true },
  pointsAdded: { type: Number, default: 1 },
  isNewCard:   { type: Boolean, default: false },
  isComplete:  { type: Boolean, default: false },
  rewardCode:  { type: String, default: null },
  rewardValidated:    { type: Boolean, default: false },
  rewardValidatedAt:  { type: Date, default: null },
  scannedAt:   { type: Date, default: Date.now },
}, { timestamps: true })

transactionSchema.index({ cardId: 1, scannedAt: -1 })

export default mongoose.model('Transaction', transactionSchema)