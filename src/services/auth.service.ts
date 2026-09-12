import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import type { LoginInput } from '../schemas/auth.schema';

export class AuthService {
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

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Retornar sem o hash
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

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

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}

export const authService = new AuthService();
