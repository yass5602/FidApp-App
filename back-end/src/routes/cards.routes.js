// src/routes/cards.routes.js
import { getMyCards } from '../controllers/cards.controller.js'

export default async function cardsRoutes(app) {
  app.get('/cards/me', { preHandler: [app.authenticate] }, getMyCards)
}
