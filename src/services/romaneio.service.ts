import { prisma } from '../config/database';
import type {
  CreateRomaneioInput,
  UpdateRomaneioInput,
  ListRomaneiosQuery,
} from '../schemas/romaneio.schema';

export class RomaneioService {
  /**
   * Gera o próximo número sequencial do ano.
   * Formato: YYYY-NNNN (ex: 2026-0001)
   */
  private async generateNumero(): Promise<string> {
    const ano = new Date().getFullYear();
    const prefixo = `${ano}-`;

    // Busca o último romaneio do ano atual
    const ultimo = await prisma.romaneio.findFirst({
      where: {
        numero: { startsWith: prefixo },
      },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    // Extrai o número sequencial
    let proximoSequencial = 1;
    if (ultimo) {
      const partes = ultimo.numero.split('-');
      const ultimoSequencial = parseInt(partes[1], 10);
      if (!isNaN(ultimoSequencial)) {
        proximoSequencial = ultimoSequencial + 1;
      }
    }

    // Formata com 4 dígitos (0001, 0002, ...)
    const sequencialFormatado = String(proximoSequencial).padStart(4, '0');
    return `${prefixo}${sequencialFormatado}`;
  }

  /**
   * Cria um novo romaneio, gerando o número sequencial automaticamente.
   */
  async create(data: CreateRomaneioInput) {
    const numero = await this.generateNumero();

    const romaneio = await prisma.romaneio.create({
      data: {
        numero,
        cliente: data.cliente,
        data: data.data,
        produto: data.produto,
        referencia: data.referencia || null,
        tipoTecido: data.tipoTecido || null,
        quantidadeRolos: data.quantidadeRolos ?? null,
        quantidadeFolhas: data.quantidadeFolhas ?? null,
        quantidadeEncaixados: data.quantidadeEncaixados ?? null,
        quantidadePecas: data.quantidadePecas,
        quantidadeVolumes: data.quantidadeVolumes ?? null,
        cortadorResponsavel: data.cortadorResponsavel || null,
        conferidoPor: data.conferidoPor || null,
        grade: data.grade as any,
        cobranca: data.cobranca as any,
        observacoes: data.observacoes || null,
      },
    });

    return romaneio;
  }

  /**
   * Lista romaneios com busca, filtros e paginação.
   */
  async findAll(filters: ListRomaneiosQuery) {
    const { search, cliente, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (cliente) {
      where.cliente = { contains: cliente, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { cliente: { contains: search, mode: 'insensitive' } },
        { produto: { contains: search, mode: 'insensitive' } },
        { referencia: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [romaneios, total] = await Promise.all([
      prisma.romaneio.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.romaneio.count({ where }),
    ]);

    return {
      data: romaneios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um romaneio pelo ID.
   */
  async findById(id: string) {
    return prisma.romaneio.findUnique({ where: { id } });
  }

  /**
   * Estatísticas gerais dos romaneios (para dashboard).
   */
  async stats() {
    const inicioAno = new Date(new Date().getFullYear(), 0, 1);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [total, doAno, doMes, pecasTotal] = await Promise.all([
      prisma.romaneio.count(),
      prisma.romaneio.count({ where: { createdAt: { gte: inicioAno } } }),
      prisma.romaneio.count({ where: { createdAt: { gte: inicioMes } } }),
      prisma.romaneio.aggregate({
        _sum: { quantidadePecas: true },
      }),
    ]);

    return {
      total,
      doAno,
      doMes,
      pecasTotal: pecasTotal._sum.quantidadePecas ?? 0,
    };
  }


  /**
   * Atualiza um romaneio existente.
   * Nota: o campo `numero` NÃO pode ser alterado (é imutável).
   */
  async update(id: string, data: UpdateRomaneioInput) {
    // Verifica se o romaneio existe
    const existente = await prisma.romaneio.findUnique({ where: { id } });
    if (!existente) {
      throw new Error('Romaneio não encontrado');
    }

    // Monta o objeto de atualização, ignorando campos undefined
    const updateData: any = {};

    if (data.cliente !== undefined) updateData.cliente = data.cliente;
    if (data.data !== undefined) updateData.data = data.data;
    if (data.produto !== undefined) updateData.produto = data.produto;
    if (data.referencia !== undefined) updateData.referencia = data.referencia || null;
    if (data.tipoTecido !== undefined) updateData.tipoTecido = data.tipoTecido || null;
    if (data.quantidadeRolos !== undefined) updateData.quantidadeRolos = data.quantidadeRolos ?? null;
    if (data.quantidadeFolhas !== undefined) updateData.quantidadeFolhas = data.quantidadeFolhas ?? null;
    if (data.quantidadeEncaixados !== undefined) updateData.quantidadeEncaixados = data.quantidadeEncaixados ?? null;
    if (data.quantidadePecas !== undefined) updateData.quantidadePecas = data.quantidadePecas;
    if (data.quantidadeVolumes !== undefined) updateData.quantidadeVolumes = data.quantidadeVolumes ?? null;
    if (data.cortadorResponsavel !== undefined) updateData.cortadorResponsavel = data.cortadorResponsavel || null;
    if (data.conferidoPor !== undefined) updateData.conferidoPor = data.conferidoPor || null;
    if (data.grade !== undefined) updateData.grade = data.grade as any;
    if (data.cobranca !== undefined) updateData.cobranca = data.cobranca as any;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null;

    return prisma.romaneio.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deleta um romaneio.
   */
  async delete(id: string) {
    const existente = await prisma.romaneio.findUnique({ where: { id } });
    if (!existente) {
      throw new Error('Romaneio não encontrado');
    }
    return prisma.romaneio.delete({ where: { id } });
  }

}

export const romaneioService = new RomaneioService();
