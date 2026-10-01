import type { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function authRoutes(app: FastifyInstance) {
  // Público — login
  app.post(
    '/login',
    {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
        errorResponseBuilder: ()=> ({
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos',
        }),
      },
    },
    schema: { 
      tags: ['Autenticação'], 
      summary: 'Login do usuário' }
  },
    authController.login.bind(authController)
  );

  // Protegido — dados do usuário logado
  app.get('/me', {
    preHandler: [authenticate],
    schema: { tags: ['Autenticação'], summary: 'Dados do usuário logado' },
    handler: authController.me.bind(authController),
  });

  // Logout (o frontend só descarta o token)
  app.post('/logout', {
    schema: { tags: ['Autenticação'], summary: 'Logout' },
    handler: authController.logout.bind(authController),
  });

  // Público — auto-cadastro
  app.post('/register', {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '1 hour',
      errorResponseBuilder: ()=> ({
          error: 'Muitos cadastros. Tente novamente em 1 hora',
        }),
    },
  },
  schema: {
    tags: ['Autenticação'],
    summary: 'Auto-cadastro de novo usuário',
  },
  },
  authController.register.bind(authController)
);
}
