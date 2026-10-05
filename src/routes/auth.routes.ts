import type { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function authRoutes(app: FastifyInstance) {
  // ===== PÚBLICO =====

  // Login (5 tentativas / 15 min)
  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          errorResponseBuilder: () => ({
            error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          }),
        },
      },
      schema: {
        tags: ['Autenticação'],
        summary: 'Login do usuário',
        description: 'Retorna access token (15 min) e define cookie de refresh (30 dias).',
      },
    },
    authController.login.bind(authController)
  );

  // Refresh token (rotação a cada uso)
  app.post(
    '/refresh',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '15 minutes',
          errorResponseBuilder: () => ({
            error: 'Muitas renovações. Tente novamente em 15 minutos.',
          }),
        },
      },
      schema: {
        tags: ['Autenticação'],
        summary: 'Renovar access token',
        description: 'Usa o cookie httpOnly de refresh para gerar novo access token.',
      },
    },
    authController.refresh.bind(authController)
  );

  // Logout (revoga o refresh token)
  app.post(
    '/logout',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Logout',
        description: 'Revoga o refresh token e limpa o cookie.',
      },
    },
    authController.logout.bind(authController)
  );

  // Register (3 cadastros / hora)
  app.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 hour',
          errorResponseBuilder: () => ({
            error: 'Muitos cadastros. Tente novamente em 1 hora.',
          }),
        },
      },
      schema: {
        tags: ['Autenticação'],
        summary: 'Auto-cadastro de novo usuário',
        description: 'Cria usuário com role VIEWER (não faz login automático).',
      },
    },
    authController.register.bind(authController)
  );

  // ===== PROTEGIDO =====

  // Dados do usuário logado
  app.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Autenticação'],
        summary: 'Dados do usuário logado',
        security: [{ bearerAuth: [] }],
      },
    },
    authController.me.bind(authController)
  );
}
