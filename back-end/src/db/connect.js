// src/db/connect.js
import mongoose from 'mongoose'
import { config } from '../config.js'

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ MongoDB Atlas connecté')
  } catch (err) {
    console.error('❌ Erreur MongoDB :', err.message)
    process.exit(1)
  }
}
