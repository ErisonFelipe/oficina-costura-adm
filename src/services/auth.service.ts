import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
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

    /**
   * Registra um novo usuário.
   * Sempre com role VIEWER (menor privilégio) — admin pode promover depois.
   */
  async register(data: RegisterInput) {
    // Verifica se o email já existe
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
        role: 'VIEWER',   // sempre VIEWER no auto-cadastro
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
