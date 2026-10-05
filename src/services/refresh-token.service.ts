import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '../config/database';

export class RefreshTokenService {
  /**
   * Gera um novo refresh token (string aleatória) e o hash para salvar no banco.
   * Nunca salvamos o token em texto puro — só o hash (segurança).
   */
  private generateToken(): { token: string; hash: string } {
    const token = randomBytes(48).toString('hex'); // 96 caracteres
    const hash = this.hashToken(token);
    return { token, hash };
  }

  /**
   * Cria um hash SHA-256 do token.
   * Por que hash e não bcrypt? Porque o refresh token é muito longo e aleatório
   * (não precisa de salt bcrypt), e queremos buscar por ele rápido no banco.
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Cria um novo refresh token para um usuário.
   */
  async create(data: {
    userId: string;
    expiresInDays: number;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { token, hash } = this.generateToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    await prisma.refreshToken.create({
      data: {
        token: hash,
        userId: data.userId,
        expiresAt,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
      },
    });

    // Retorna o token em texto puro (vai para o cookie)
    return { token, expiresAt };
  }

  /**
   * Valida um refresh token e retorna o registro (com user).
   * Retorna null se inválido, expirado ou revogado.
   */
  async validate(token: string) {
    const hash = this.hashToken(token);

    const record = await prisma.refreshToken.findUnique({
      where: { token: hash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
          },
        },
      },
    });

    if (!record) return null;
    if (record.revokedAt) return null;
    if (record.expiresAt < new Date()) return null;
    if (!record.user.active) return null;

    return record;
  }

  /**
   * Revoga um refresh token específico.
   */
  async revoke(token: string) {
    const hash = this.hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { token: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoga TODOS os refresh tokens de um usuário.
   * Útil para "logout de todos os dispositivos" ou ao trocar a senha.
   */
  async revokeAllForUser(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Rotação: revoga o token atual e cria um novo.
   * Retorna o novo token em texto puro.
   */
  async rotate(oldToken: string, userAgent?: string, ipAddress?: string) {
    const record = await this.validate(oldToken);
    if (!record) return null;

    // Revoga o antigo
    await this.revoke(oldToken);

    // Cria o novo (mesma duração)
    const expiresInDays = Math.ceil(
      (record.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return this.create({
      userId: record.userId,
      expiresInDays: Math.max(expiresInDays, 1),
      userAgent,
      ipAddress,
    });
  }

  /**
   * Limpeza: apaga tokens expirados há mais de 7 dias.
   * Pode ser chamado periodicamente (ex: cron job).
   */
  async cleanupExpired() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: sevenDaysAgo } },
          { revokedAt: { lt: sevenDaysAgo } },
        ],
      },
    });

    return result.count;
  }
}

export const refreshTokenService = new RefreshTokenService();
