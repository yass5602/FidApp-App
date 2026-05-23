// src/routes/notifications.routes.js
import { sendNotification, getNotificationHistory, getTargetCounts } from '../controllers/notifications.controller.js'

export default async function notificationsRoutes(app) {
  const auth = { preHandler: [app.authenticate] }
  app.post('/notifications',         auth, sendNotification)
  app.get('/notifications/history',  auth, getNotificationHistory)
  app.get('/notifications/targets',   auth, getTargetCounts)
}
