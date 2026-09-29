import type { FastifyRequest, FastifyReply } from 'fastify';
import { clientService } from '../services/client.service';
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
  searchClientsQuerySchema,
} from '../schemas/client.schema';

export class ClientController {
  /**
   * POST /api/admin/clients
   */
  async create(req: FastifyRequest, reply: FastifyReply) {
    const parsed = createClientSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const client = await clientService.create(parsed.data);
      return reply.status(201).send({
        message: 'Cliente criado com sucesso',
        data: client,
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao criar cliente' });
    }
  }

  /**
   * GET /api/admin/clients
   */
  async list(req: FastifyRequest, reply: FastifyReply) {
    const parsed = listClientsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await clientService.findAll(parsed.data);
      return reply.send(result);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao listar clientes' });
    }
  }

  /**
   * GET /api/admin/clients/search?q=termo
   */
  async search(req: FastifyRequest, reply: FastifyReply) {
    const parsed = searchClientsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const clients = await clientService.search(parsed.data.q);
      return reply.send({ data: clients });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao buscar clientes' });
    }
  }

  /**
   * GET /api/admin/clients/:id
   */
  async show(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const client = await clientService.findById(req.params.id);

      if (!client) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      return reply.send({ data: client });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao buscar cliente' });
    }
  }

  /**
   * PATCH /api/admin/clients/:id
   */
  async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateClientSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const client = await clientService.update(req.params.id, parsed.data);
      return reply.send({
        message: 'Cliente atualizado com sucesso',
        data: client,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Cliente não encontrado') {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao atualizar cliente' });
    }
  }

  /**
   * DELETE /api/admin/clients/:id
   */
  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await clientService.delete(req.params.id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof Error && err.message === 'Cliente não encontrado') {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao deletar cliente' });
    }
  }
}

export const clientController = new ClientController();
