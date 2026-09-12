import { prisma } from '../config/database';
import { authService } from './auth.service';
import type { CreateUserInput, UpdateUserInput } from '../schemas/auth.schema';

export class UserService {
  async create(data: CreateUserInput) {
    const hash = await authService.hashPassword(data.password);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hash,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await authService.hashPassword(data.password);
    }

    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
