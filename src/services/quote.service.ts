import { prisma } from '../config/database';
import type {
  UpdateQuoteStatusInput,
  ListQuotesQuery,
} from '../schemas/quote.schema';

export class QuoteService {
  async findAll(filters: ListQuotesQuery) {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.quote.findUnique({ where: { id } });
  }

  async updateStatus(id: string, data: UpdateQuoteStatusInput) {
    return prisma.quote.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async delete(id: string) {
    return prisma.quote.delete({ where: { id } });
  }

  async stats() {
    const [total, pending, inProgress, completed, cancelled] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.quote.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.quote.count({ where: { status: 'COMPLETED' } }),
      prisma.quote.count({ where: { status: 'CANCELLED' } }),
    ]);

    return { total, pending, inProgress, completed, cancelled };
  }
}

export const quoteService = new QuoteService();
