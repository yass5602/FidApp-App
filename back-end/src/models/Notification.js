import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  target:     { type: String, enum: ['all', 'loyal', 'inactive'], required: true },
  message:    { type: String, required: true },
  count:      { type: Number, default: 0 },
  opened:     { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)