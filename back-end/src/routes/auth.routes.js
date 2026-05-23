// src/routes/auth.routes.js
import { register, login } from '../controllers/auth.controller.js'

export default async function authRoutes(app) {
  app.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email:      { type: 'string', format: 'email' },
          password:   { type: 'string', minLength: 6 },
          name:       { type: 'string', minLength: 1 },
          role:       { type: 'string', enum: ['client', 'merchant'] },
          inviteCode: { type: 'string' },
        },
      },
    },
  }, register)

  app.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
    },
  }, login)
}
