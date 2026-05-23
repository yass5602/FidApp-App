// src/routes/scan.routes.js
import { validateScan } from '../controllers/scan.controller.js'

export default async function scanRoutes(app) {
  // Protégé : seuls les clients connectés peuvent scanner
  app.post('/scan/:token', {
    preHandler: [app.authenticate],
  }, validateScan)
}
