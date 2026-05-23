// src/routes/stats.routes.js
import { getMerchantStats } from '../controllers/stats.controller.js'

export default async function statsRoutes(app) {
  app.get('/merchant/stats', { preHandler: [app.authenticate] }, getMerchantStats)
}
