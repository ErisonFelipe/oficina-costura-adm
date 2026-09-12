import type { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service';
import { createUserSchema, updateUserSchema } from '../schemas/auth.schema';

export class UserController {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await userService.create(parsed.data);
      return reply.status(201).send({ data: user });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: 'E-mail já cadastrado' });
      }
      throw err;
    }
  }

  async list(_: FastifyRequest, reply: FastifyReply) {
    const users = await userService.findAll();
    return reply.send({ data: users });
  }

  async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await userService.update(req.params.id, parsed.data);
      return reply.send({ data: user });
    } catch {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await userService.delete(req.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }
  }
}

export const userController = new UserController();
