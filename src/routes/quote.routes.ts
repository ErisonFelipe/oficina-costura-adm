import type { FastifyInstance } from 'fastify';
import { quoteController } from '../controllers/quote.controller';
import { authenticate } from '../middlewares/auth.middleware';

export async function quoteRoutes(app: FastifyInstance) {
  // Todas as rotas exigem autenticação
  app.addHook('preHandler', authenticate);

  app.get('/', {
    schema: { tags: ['Orçamentos (Admin)'], summary: 'Listar orçamentos' },
    handler: quoteController.list.bind(quoteController),
  });

  app.get('/stats', {
    schema: { tags: ['Orçamentos (Admin)'], summary: 'Estatísticas' },
    handler: quoteController.stats.bind(quoteController),
  });

  app.get('/:id', {
    schema: { tags: ['Orçamentos (Admin)'], summary: 'Buscar orçamento' },
    handler: quoteController.show.bind(quoteController),
  });

  app.patch('/:id/status', {
    schema: { tags: ['Orçamentos (Admin)'], summary: 'Atualizar status' },
    handler: quoteController.updateStatus.bind(quoteController),
  });

  app.delete('/:id', {
    schema: { tags: ['Orçamentos (Admin)'], summary: 'Deletar orçamento' },
    handler: quoteController.delete.bind(quoteController),
  });
}
