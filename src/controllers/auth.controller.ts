import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { loginSchema } from '../schemas/auth.schema';

export class AuthController {
  async login(req: FastifyRequest, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await authService.validateCredentials(parsed.data);

    if (!user) {
      return reply.status(401).send({
        error: 'E-mail ou senha inválidos',
      });
    }

    const token = await reply.jwtSign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return reply.send({
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  }

  async me(req: FastifyRequest, reply: FastifyReply) {
    const user = await authService.findById(req.user.sub);

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return reply.send({ data: user });
  }

  async logout(_: FastifyRequest, reply: FastifyReply) {
    // JWT não tem estado — o frontend apenas descarta o token
    return reply.send({ message: 'Logout realizado com sucesso' });
  }
}

export const authController = new AuthController();
