import type { FastifyInstance } from 'fastify';
import { romaneioController } from '../controllers/romaneio.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function romaneioRoutes(app: FastifyInstance) {
  // Todas as rotas exigem autenticação (JWT)
  app.addHook('preHandler', authenticate);

  // Listar com filtros e paginação
  app.get('/', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Listar romaneios',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.list.bind(romaneioController),
  });

  // Estatísticas (PRECISA vir antes de /:id)
  app.get('/stats', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Estatísticas dos romaneios',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.stats.bind(romaneioController),
  });

  // Buscar por ID
  app.get('/:id', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Buscar romaneio por ID',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.show.bind(romaneioController),
  });

  // Criar novo romaneio
  app.post('/', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Criar romaneio',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.create.bind(romaneioController),
  });

  // Atualizar romaneio
  app.patch('/:id', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Atualizar romaneio',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.update.bind(romaneioController),
  });

  // Deletar romaneio
  app.delete('/:id', {
    schema: {
      tags: ['Romaneios'],
      summary: 'Deletar romaneio',
      security: [{ bearerAuth: [] }],
    },
    handler: romaneioController.delete.bind(romaneioController),
  });
}
