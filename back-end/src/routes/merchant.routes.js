// src/routes/merchant.routes.js
import { updatePlan, updateLocation, getNearbyMerchants } from '../controllers/merchant.controller.js'

export default async function merchantRoutes(app) {
  const auth = { preHandler: [app.authenticate] }
  app.patch('/merchant/plan',       auth, updatePlan)
  app.patch('/merchant/location',   auth, updateLocation)
  app.get('/merchants/nearby',      getNearbyMerchants)  // publique — pas besoin d'être connecté
}