// src/routes/programs.routes.js
import { createProgram, getMyPrograms, deleteProgram } from '../controllers/programs.controller.js'

export default async function programsRoutes(app) {
  const auth = { preHandler: [app.authenticate] }

  app.post('/programs',     auth, createProgram)
  app.get('/programs',      auth, getMyPrograms)
  app.delete('/programs/:id', auth, deleteProgram)
}
