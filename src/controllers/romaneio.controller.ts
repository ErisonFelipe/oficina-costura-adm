import type { FastifyRequest, FastifyReply } from 'fastify';
import { romaneioService } from '../services/romaneio.service';
import {
  createRomaneioSchema,
  updateRomaneioSchema,
  listRomaneiosQuerySchema,
} from '../schemas/romaneio.schema';

export class RomaneioController {
  /**
   * POST /api/admin/romaneios
   */
  async create(req: FastifyRequest, reply: FastifyReply) {
    const parsed = createRomaneioSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const romaneio = await romaneioService.create(parsed.data);
      return reply.status(201).send({
        message: 'Romaneio criado com sucesso',
        data: romaneio,
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao criar romaneio',
      });
    }
  }

  /**
   * GET /api/admin/romaneios
   */
  async list(req: FastifyRequest, reply: FastifyReply) {
    const parsed = listRomaneiosQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await romaneioService.findAll(parsed.data);
      return reply.send(result);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao listar romaneios',
      });
    }
  }

  /**
   * GET /api/admin/romaneios/stats
   */
  async stats(_: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await romaneioService.stats();
      return reply.send({ data: stats });
    } catch (err) {
      reply.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao buscar estatísticas',
      });
    }
  }

  /**
   * GET /api/admin/romaneios/:id
   */
  async show(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const romaneio = await romaneioService.findById(req.params.id);

      if (!romaneio) {
        return reply.status(404).send({ error: 'Romaneio não encontrado' });
      }

      return reply.send({ data: romaneio });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao buscar romaneio',
      });
    }
  }

  /**
   * PATCH /api/admin/romaneios/:id
   */
  async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateRomaneioSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const romaneio = await romaneioService.update(req.params.id, parsed.data);
      return reply.send({
        message: 'Romaneio atualizado com sucesso',
        data: romaneio,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Romaneio não encontrado') {
        return reply.status(404).send({ error: 'Romaneio não encontrado' });
      }
      req.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao atualizar romaneio',
      });
    }
  }

  /**
   * DELETE /api/admin/romaneios/:id
   */
  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await romaneioService.delete(req.params.id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof Error && err.message === 'Romaneio não encontrado') {
        return reply.status(404).send({ error: 'Romaneio não encontrado' });
      }
      req.log.error(err);
      return reply.status(500).send({
        error: 'Erro ao deletar romaneio',
      });
    }
  }
}

export const romaneioController = new RomaneioController();
