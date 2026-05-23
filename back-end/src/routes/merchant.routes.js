// src/routes/merchant.routes.js
import { updatePlan } from '../controllers/merchant.controller.js'

export default async function merchantRoutes(app) {
  app.patch('/merchant/plan', { preHandler: [app.authenticate] }, updatePlan)
}