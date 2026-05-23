// src/routes/qr.routes.js
import { generateQRToken, getMerchantByQRToken } from '../controllers/qr.controller.js'

export default async function qrRoutes(app) {
  app.post('/qr/generate', { preHandler: [app.authenticate] }, generateQRToken)
  app.get('/qr/merchant',  getMerchantByQRToken)  // public — ?token=A3F9K2
}