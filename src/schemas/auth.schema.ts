import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').max(150),
  password: z.string().min(6, 'Senha precisa ter pelo menos 6 caracteres').max(100),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres').max(100),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).default('VIEWER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional(),
  active: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
