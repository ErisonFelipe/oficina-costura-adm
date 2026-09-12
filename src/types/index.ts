import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  name: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
