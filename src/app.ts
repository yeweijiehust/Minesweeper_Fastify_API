import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import authRoutes from './routes/authRoutes';
import syncRoutes from './routes/syncRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';

export const buildApp = async () => {
  const app = Fastify({ logger: true });

  // Allow requests from any origin (Crucial for Mobile Apps)
  await app.register(cors, {
    origin: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-minesweeper-key',
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Minesweeper Fastify API',
        description: 'API documentation for Minesweeper backend services',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Local development server',
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
      deepLinking: false,
    },
    staticCSP: true,
  });

  app.get('/docs/json', async () => app.swagger());

  app.get('/ping', async () => {
    return { status: 'ok', message: 'Fastify API is running' };
  });

  await app.register(authRoutes);
  await app.register(syncRoutes);
  await app.register(leaderboardRoutes);

  return app;
};
