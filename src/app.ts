import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authRoutes from './routes/authRoutes';
import syncRoutes from './routes/syncRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';

export const buildApp = async () => {
    const app = Fastify({ logger: true });

    // Allow requests from any origin (Crucial for Mobile Apps)
    await app.register(cors, {
        origin: true
    });

    await app.register(jwt, {
        secret: process.env.JWT_SECRET || 'super-secret-minesweeper-key'
    });

    app.get('/ping', async (request, reply) => {
        return { status: 'ok', message: 'Fastify API is running' };
    });

    await app.register(authRoutes);
    await app.register(syncRoutes);
    await app.register(leaderboardRoutes);

    return app;
};