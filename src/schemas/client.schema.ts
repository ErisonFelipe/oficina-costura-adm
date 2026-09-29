import { z } from 'zod';

// ===== CRIAR CLIENTE =====
export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(150),
  phone: z.string().min(8, 'Telefone é obrigatório').max(20),
  email: z.string().email('E-mail inválido').max(150).optional().or(z.literal('')),
  document: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

// ===== ATUALIZAR CLIENTE =====
export const updateClientSchema = createClientSchema.partial().extend({
  active: z.boolean().optional(),
});

// ===== LISTAR CLIENTES =====
export const listClientsQuerySchema = z.object({
  search: z.string().max(100).optional(),
  active: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===== BUSCA RÁPIDA (autocomplete) =====
export const searchClientsQuerySchema = z.object({
  q: z.string().min(1, 'Termo de busca é obrigatório').max(100),
});

// ===== TIPOS =====
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
