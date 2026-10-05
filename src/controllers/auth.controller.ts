import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshCookie,
} from '../utils/cookies';

export class AuthController {
  /**
   * POST /api/auth/login
   * Gera access token (JSON) + refresh token (cookie httpOnly).
   */
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

    // Gera access token (JWT) — 15 min
    const accessToken = await reply.jwtSign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Gera refresh token (30 dias) — salvo no banco
    const { token: refreshToken, expiresAt } = await authService.createRefreshToken({
      userId: user.id,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Salva refresh token em cookie httpOnly
    setRefreshCookie(reply, refreshToken, expiresAt);

    return reply.send({
      message: 'Login realizado com sucesso',
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  }

  /**
   * POST /api/auth/refresh
   * Lê o refresh token do cookie, rotaciona e devolve novo access token.
   */
  async refresh(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = getRefreshCookie(req.cookies);

    if (!refreshToken) {
      return reply.status(401).send({ error: 'Refresh token não encontrado' });
    }

    const result = await authService.refresh({
      token: refreshToken,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    if (!result) {
      // Token inválido/expirado/revogado — limpa o cookie
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Sessão expirada' });
    }

    // Gera novo access token
    const accessToken = await reply.jwtSign(
      {
        sub: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Rotaciona o cookie com o novo refresh token
    setRefreshCookie(reply, result.refreshToken, result.expiresAt);

    return reply.send({
      message: 'Token renovado',
      data: {
        accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  }

  /**
   * POST /api/auth/logout
   * Revoga o refresh token e limpa o cookie.
   */
  async logout(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = getRefreshCookie(req.cookies);

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    clearRefreshCookie(reply);

    return reply.send({ message: 'Logout realizado com sucesso' });
  }

  /**
   * GET /api/auth/me
   * Retorna os dados do usuário logado (usando o access token).
   */
  async me(req: FastifyRequest, reply: FastifyReply) {
    const user = await authService.findById(req.user.sub);

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return reply.send({ data: user });
  }

  /**
   * POST /api/auth/register
   * Auto-cadastro (role VIEWER, sem login automático).
   */
  async register(req: FastifyRequest, reply: FastifyReply) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await authService.register(parsed.data);
      return reply.status(201).send({
        message: 'Cadastro realizado com sucesso! Você pode fazer login agora.',
        data: { user },
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'E-mail já cadastrado') {
        return reply.status(409).send({ error: 'E-mail já cadastrado' });
      }
      req.log.error(err);
      return reply.status(500).send({ error: 'Erro ao cadastrar usuário' });
    }
  }
}

export const authController = new AuthController();
