import { z } from 'zod';

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});

export const listQuotesQuerySchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
export type ListQuotesQuery = z.infer<typeof listQuotesQuerySchema>;
