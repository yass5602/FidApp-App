// src/routes/rewards.routes.js
import { getPendingRewards, redeemReward, checkRewardValidated } from '../controllers/rewards.controller.js'

export default async function rewardsRoutes(app) {
  const auth = { preHandler: [app.authenticate] }
  app.get('/rewards/pending',  auth, getPendingRewards)
  app.post('/rewards/redeem',  auth, redeemReward)
  app.get('/rewards/check', auth, checkRewardValidated)
}