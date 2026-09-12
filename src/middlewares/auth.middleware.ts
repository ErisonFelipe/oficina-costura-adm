import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      error: 'Não autenticado',
      message: 'Token inválido ou expirado',
    });
  }
}

export function authorize(...roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    await authenticate(req, reply);
    if (reply.sent) return;

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso',
      });
    }
  };
}
