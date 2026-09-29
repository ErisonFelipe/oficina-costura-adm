import type { FastifyInstance } from 'fastify';
import { clientController } from '../controllers/client.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function clientRoutes(app: FastifyInstance) {
  // Todas as rotas exigem autenticação
  app.addHook('preHandler', authenticate);

  // Listar com filtros e paginação
  app.get('/', {
    schema: {
      tags: ['Clientes'],
      summary: 'Listar clientes',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.list.bind(clientController),
  });

  // Busca rápida (autocomplete)
  app.get('/search', {
    schema: {
      tags: ['Clientes'],
      summary: 'Busca rápida por clientes',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.search.bind(clientController),
  });

  // Buscar por ID
  app.get('/:id', {
    schema: {
      tags: ['Clientes'],
      summary: 'Buscar cliente por ID',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.show.bind(clientController),
  });

  // Criar novo
  app.post('/', {
    schema: {
      tags: ['Clientes'],
      summary: 'Criar cliente',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.create.bind(clientController),
  });

  // Atualizar
  app.patch('/:id', {
    schema: {
      tags: ['Clientes'],
      summary: 'Atualizar cliente',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.update.bind(clientController),
  });

  // Deletar
  app.delete('/:id', {
    schema: {
      tags: ['Clientes'],
      summary: 'Deletar cliente',
      security: [{ bearerAuth: [] }],
    },
    handler: clientController.delete.bind(clientController),
  });
}
