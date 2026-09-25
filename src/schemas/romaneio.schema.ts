import { z } from 'zod';

// ===== GRADE (linha cor × tamanho) =====
const gradeItemSchema = z.object({
  cor: z.string().min(1, 'Cor é obrigatória').max(50),
  tamanho: z.string().max(20).optional().or(z.literal('')),
  quantidade: z.number().int().min(0, 'Quantidade deve ser positiva'),
});

// ===== COBRANÇA =====
const cobrancaSchema = z.object({
  valorUnitario: z.number().min(0, 'Valor unitário deve ser positivo'),
  valorTotal: z.number().min(0, 'Valor total deve ser positivo'),
  observacao: z.string().max(500).optional().or(z.literal('')),
});

// ===== CRIAR ROMANEIO =====
export const createRomaneioSchema = z.object({
  cliente: z.string().min(2, 'Cliente é obrigatório').max(150),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  produto: z.string().min(2, 'Produto é obrigatório').max(150),
  referencia: z.string().max(50).optional().or(z.literal('')),
  tipoTecido: z.string().max(100).optional().or(z.literal('')),
  quantidadeRolos: z.number().int().min(0).optional(),
  quantidadeFolhas: z.number().int().min(0).optional(),
  quantidadeEncaixados: z.number().int().min(0).optional(),
  quantidadePecas: z.number().int().min(1, 'Quantidade de peças é obrigatória'),
  quantidadeVolumes: z.number().int().min(0).optional(),
  cortadorResponsavel: z.string().max(100).optional().or(z.literal('')),
  conferidoPor: z.string().max(100).optional().or(z.literal('')),
  grade: z.array(gradeItemSchema).min(1, 'Adicione pelo menos uma linha na grade'),
  cobranca: cobrancaSchema,
  observacoes: z.string().max(1000).optional().or(z.literal('')),
});

// ===== ATUALIZAR ROMANEIO =====
export const updateRomaneioSchema = createRomaneioSchema.partial();

// ===== LISTAR ROMANEIOS (query params) =====
export const listRomaneiosQuerySchema = z.object({
  search: z.string().max(100).optional(),
  cliente: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===== TIPOS EXPORTADOS =====
export type CreateRomaneioInput = z.infer<typeof createRomaneioSchema>;
export type UpdateRomaneioInput = z.infer<typeof updateRomaneioSchema>;
export type ListRomaneiosQuery = z.infer<typeof listRomaneiosQuerySchema>;
