// src/models/Invitation.js
import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true },
  merchantData: { type: Object, default: {} },  // données pré-remplies (nom, catégorie…)
  usedAt:       { type: Date, default: null },
  usedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export default mongoose.model('Invitation', invitationSchema)
