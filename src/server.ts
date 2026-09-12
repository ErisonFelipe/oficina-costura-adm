import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { prisma } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { quoteRoutes } from './routes/quote.routes';
import { userRoutes } from './routes/user.routes';

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // ===== PLUGINS =====
  await app.register(cors, {
    origin: [env.ADMIN_URL, 'http://localhost:5174'],
    credentials: true,
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // ===== SWAGGER =====
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Linha & Ponto — API Admin',
        description: 'API administrativa da oficina de costura Linha & Ponto',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Desenvolvimento',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ===== ROTAS =====
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(quoteRoutes, { prefix: '/api/admin/quotes' });
  await app.register(userRoutes, { prefix: '/api/admin/users' });

  // ===== HEALTH CHECK =====
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'oficina-costura-adm',
  }));

  // ===== ERROR HANDLER =====
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.validation,
      });
    }

    reply.status(error.statusCode || 500).send({
      error: error.message || 'Erro interno do servidor',
    });
  });

  // ===== START =====
  try {
    await prisma.$connect();
    app.log.info('✅ Banco de dados conectado');

    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 Admin API rodando em http://localhost:${env.PORT}`);
    app.log.info(`📚 Documentação: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // ===== GRACEFUL SHUTDOWN =====
  const shutdown = async (signal: string) => {
    app.log.info(`\n${signal} recebido. Encerrando...`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap();
