// src/db/seed.js
// Insère les codes d'invitation de démonstration en base.
// Usage : node src/db/seed.js  (une seule fois après npm install)
import 'dotenv/config'
import mongoose   from 'mongoose'
import Invitation from '../models/Invitation.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('Connecté à MongoDB')

const codes = [
  { code: 'FIDELE-CAFE-0001',  merchantData: { name: 'Café Baguette',   category: 'Café',        address: 'Paris' } },
  { code: 'FIDELE-BIO-0002',   merchantData: { name: 'BioMarch',        category: 'Épicerie',    address: 'Lyon'  } },
  { code: 'FIDELE-BOUL-0003',  merchantData: { name: "Boulan'Gerie Jo", category: 'Boulangerie', address: 'Metz'  } },
  { code: 'FIDELE-DEMO-9999',  merchantData: { name: 'Commerce Démo',   category: 'Divers',      address: ''      } },
  { code: 'FIDELE-NAAN-0000',  merchantData: { name: 'Naan-kebab',   category: 'Divers',      address: ''      } },
]

for (const c of codes) {
  await Invitation.updateOne({ code: c.code }, c, { upsert: true })
  console.log(`✅  ${c.code}`)
}

console.log('Seed terminé')
await mongoose.disconnect()