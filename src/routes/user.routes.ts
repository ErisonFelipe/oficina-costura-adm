import type { FastifyInstance } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authorize } from '../middlewares/auth.middleware';

export async function userRoutes(app: FastifyInstance) {
  // Só ADMIN pode gerenciar usuários
  app.addHook('preHandler', authorize('ADMIN'));

  app.get('/', {
    schema: { tags: ['Usuários'], summary: 'Listar usuários' },
    handler: userController.list.bind(userController),
  });

  app.post('/', {
    schema: { tags: ['Usuários'], summary: 'Criar usuário' },
    handler: userController.create.bind(userController),
  });

  app.patch('/:id', {
    schema: { tags: ['Usuários'], summary: 'Atualizar usuário' },
    handler: userController.update.bind(userController),
  });

  app.delete('/:id', {
    schema: { tags: ['Usuários'], summary: 'Deletar usuário' },
    handler: userController.delete.bind(userController),
  });
}
