import { prisma } from '../config/database';
import type {
  CreateClientInput,
  UpdateClientInput,
  ListClientsQuery,
} from '../schemas/client.schema';

export class ClientService {
  /**
   * Cria um novo cliente.
   */
  async create(data: CreateClientInput) {
    return prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        document: data.document || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
  }

  /**
   * Lista clientes com busca, paginação e filtro de ativo/inativo.
   */
  async findAll(filters: ListClientsQuery) {
    const { search, active, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um cliente pelo ID.
   */
  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { romaneios: true },
        },
      },
    });
  }

  /**
   * Busca rápida para autocomplete (retorna até 10 clientes).
   */
  async search(term: string) {
    return prisma.client.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term } },
          { document: { contains: term } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        document: true,
      },
    });
  }

  /**
   * Atualiza um cliente existente.
   */
  async update(id: string, data: UpdateClientInput) {
    const existente = await prisma.client.findUnique({ where: { id } });
    if (!existente) {
      throw new Error('Cliente não encontrado');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.document !== undefined) updateData.document = data.document || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.active !== undefined) updateData.active = data.active;

    return prisma.client.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deleta um cliente.
   * Se ele tiver romaneios, faz soft delete (active = false).
   * Se não tiver, deleta de verdade.
   */
  async delete(id: string) {
    const existente = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { romaneios: true },
        },
      },
    });

    if (!existente) {
      throw new Error('Cliente não encontrado');
    }

    // Se tem romaneios vinculados, faz soft delete
    if (existente._count.romaneios > 0) {
      return prisma.client.update({
        where: { id },
        data: { active: false },
      });
    }

    // Se não tem, deleta mesmo
    return prisma.client.delete({ where: { id } });
  }
}

export const clientService = new ClientService();
