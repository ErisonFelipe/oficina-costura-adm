import type { FastifyReply } from 'fastify';
import { env } from '../config/env';

const REFRESH_COOKIE_NAME = 'lunexx_refresh_token';

/**
 * Salva o refresh token em cookie httpOnly.
 */
export function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date
): void {
  reply.setCookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,       // JS não acessa
    secure: env.COOKIE_SECURE, // só HTTPS em prod
    sameSite: 'lax',      // envia em navegação top-level
    path: '/api/auth',    // só envia para /api/auth/*
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
    expires: expiresAt,
    signed: false,
  });
}

/**
 * Remove o cookie de refresh.
 */
export function clearRefreshCookie(reply: FastifyReply): void {
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    path: '/api/auth',
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
  });
}

/**
 * Lê o refresh token do cookie.
 */
export function getRefreshCookie(cookies: Record<string, string | undefined>): string | null {
  return cookies[REFRESH_COOKIE_NAME] || null;
}

export { REFRESH_COOKIE_NAME };
