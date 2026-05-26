// src/routes/rewards.routes.js
import { getPendingRewards, redeemReward } from '../controllers/rewards.controller.js'

export default async function rewardsRoutes(app) {
  const auth = { preHandler: [app.authenticate] }
  app.get('/rewards/pending',  auth, getPendingRewards)
  app.post('/rewards/redeem',  auth, redeemReward)
}