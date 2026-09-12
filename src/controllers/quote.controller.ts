import type { FastifyRequest, FastifyReply } from 'fastify';
import { quoteService } from '../services/quote.service';
import {
  updateQuoteStatusSchema,
  listQuotesQuerySchema,
} from '../schemas/quote.schema';

export class QuoteController {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const parsed = listQuotesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await quoteService.findAll(parsed.data);
    return reply.send(result);
  }

  async show(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const quote = await quoteService.findById(req.params.id);
    if (!quote) return reply.status(404).send({ error: 'Orçamento não encontrado' });
    return reply.send({ data: quote });
  }

  async updateStatus(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateQuoteStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const quote = await quoteService.updateStatus(req.params.id, parsed.data);
      return reply.send({ data: quote });
    } catch {
      return reply.status(404).send({ error: 'Orçamento não encontrado' });
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await quoteService.delete(req.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Orçamento não encontrado' });
    }
  }

  async stats(_: FastifyRequest, reply: FastifyReply) {
    const stats = await quoteService.stats();
    return reply.send({ data: stats });
  }
}

export const quoteController = new QuoteController();
