import type { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function authRoutes(app: FastifyInstance) {
  // Público — login
  app.post('/login', {
    schema: { tags: ['Autenticação'], summary: 'Login do usuário' },
    handler: authController.login.bind(authController),
  });

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
    schema: {
      tags: ['Autenticação'],
      summary: 'Auto-cadastro de novo usuário',
      description:
        'Cria um usuário com role VIEWER. O admin pode promover depois.',
    },
    handler: authController.register.bind(authController),
  });
}
