import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth";
import Leaderboard from "../models/Leaderboard";

const leaderboardQuerySchema = Type.Object({
	difficulty: Type.String({ minLength: 1 }),
});

const leaderboardBodySchema = Type.Object({
	difficulty: Type.String({ minLength: 1 }),
	durationSeconds: Type.Number({ minimum: 0 }),
	dateTimestamp: Type.Number({ minimum: 0 }),
});

const leaderboardItemSchema = Type.Object({
	username: Type.String(),
	durationSeconds: Type.Number(),
	dateTimestamp: Type.Number(),
});

const leaderboardResponseSchema = Type.Array(leaderboardItemSchema);

const successSchema = Type.Object({
	success: Type.Boolean(),
});

export default async function leaderboardRoutes(app: FastifyInstance) {
	const typedApp = app.withTypeProvider<TypeBoxTypeProvider>();

	typedApp.get(
		"/leaderboard",
		{
			schema: {
				tags: ["Leaderboard"],
				summary: "Fetch leaderboard records by difficulty",
				querystring: leaderboardQuerySchema,
				response: {
					200: leaderboardResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { difficulty } = request.query;

			const records = await Leaderboard.find({ difficulty })
				.sort({ durationSeconds: 1, dateTimestamp: -1 })
				.limit(100);

			const response = records.map((record) => ({
				username: record.username,
				durationSeconds: record.durationSeconds,
				dateTimestamp: record.dateTimestamp,
			}));

			return reply.code(200).send(response);
		},
	);

	typedApp.post(
		"/leaderboard",
		{
			preHandler: [authenticate],
			schema: {
				tags: ["Leaderboard"],
				summary: "Submit a leaderboard record for the authenticated user",
				security: [{ bearerAuth: [] }],
				body: leaderboardBodySchema,
				response: {
					200: successSchema,
				},
			},
		},
		async (request, reply) => {
			const { username } = request.user as { username: string };
			const { difficulty, durationSeconds, dateTimestamp } = request.body;

			const newRecord = new Leaderboard({
				username,
				difficulty,
				durationSeconds,
				dateTimestamp,
			});

			await newRecord.save();

			return reply.code(200).send({ success: true });
		},
	);
}
