// src/routes/rewards.routes.js
import { getPendingRewards, validateReward } from '../controllers/rewards.controller.js'

export default async function rewardsRoutes(app) {
  const auth = { preHandler: [app.authenticate] }
  app.get('/rewards/pending',          auth, getPendingRewards)
  app.post('/rewards/:id/validate',    auth, validateReward)
}
