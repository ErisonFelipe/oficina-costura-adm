import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { refreshTokenService } from './refresh-token.service';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export class AuthService {
  /**
   * Valida as credenciais do usuário (email + senha).
   * Retorna o usuário SEM a senha, ou null se inválido.
   */
  async validateCredentials({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.active) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Atualiza o último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Retorna sem o hash da senha
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Cria um novo refresh token para o usuário.
   * O access token (JWT) é gerado pelo controller.
   */
  async createRefreshToken(data: {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { token, expiresAt } = await refreshTokenService.create({
      userId: data.userId,
      expiresInDays: 30, // 30 dias
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });

    return { token, expiresAt };
  }

  /**
   * Valida um refresh token e rotaciona (gera um novo).
   * Retorna o usuário + o novo refresh token.
   */
  async refresh(data: {
    token: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const rotated = await refreshTokenService.rotate(
      data.token,
      data.userAgent,
      data.ipAddress
    );

    if (!rotated) {
      return null;
    }

    // Pega o usuário associado (para gerar novo access token)
    const record = await refreshTokenService.validate(rotated.token);
    if (!record) {
      return null;
    }

    return {
      user: record.user,
      refreshToken: rotated.token,
      expiresAt: rotated.expiresAt,
    };
  }

  /**
   * Revoga um refresh token específico (logout).
   */
  async logout(refreshToken: string) {
    await refreshTokenService.revoke(refreshToken);
  }

  /**
   * Busca um usuário pelo ID (para GET /me).
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        lastLogin: true,
        createdAt: true,
      },
    });
  }

  /**
   * Gera hash bcrypt da senha.
   */
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Registra um novo usuário com role VIEWER.
   * NÃO faz login automático (o usuário precisa ir para /login).
   */
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('E-mail já cadastrado');
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hash,
        role: 'VIEWER',
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
