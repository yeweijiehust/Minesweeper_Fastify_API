import { FastifyInstance } from 'fastify';
import Leaderboard from '../models/Leaderboard';
import { authenticate } from '../middleware/auth';

interface LeaderboardQuery {
    difficulty: string;
}

interface LeaderboardBody {
    difficulty: string;
    durationSeconds: number;
    dateTimestamp: number;
}

export default async function leaderboardRoutes(app: FastifyInstance) {

    // GET Leaderboard (Public)
    app.get<{
        Querystring: LeaderboardQuery
    }>('/leaderboard', async (request, reply) => {

        const { difficulty } = request.query;

        if (!difficulty) {
            return reply.code(400).send({ error: 'Difficulty query parameter is required' });
        }

        const records = await Leaderboard.find({ difficulty })
            .sort({ durationSeconds: 1, dateTimestamp: -1 })
            .limit(100);

        const response = records.map(record => ({
            username: record.username,
            durationSeconds: record.durationSeconds,
            dateTimestamp: record.dateTimestamp
        }));

        return reply.code(200).send(response);
    });

    // POST Leaderboard (Protected)
    app.post<{
        Body: LeaderboardBody
    }>('/leaderboard',
        { preHandler: [authenticate] },
        async (request, reply) => {

            const { username } = request.user as { username: string };
            const { difficulty, durationSeconds, dateTimestamp } = request.body;

            if (!difficulty || durationSeconds === undefined || !dateTimestamp) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            const newRecord = new Leaderboard({
                username,
                difficulty,
                durationSeconds,
                dateTimestamp
            });

            await newRecord.save();

            return reply.code(200).send({ success: true });
        }
    );
}