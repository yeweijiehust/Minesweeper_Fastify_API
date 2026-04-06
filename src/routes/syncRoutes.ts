import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth";
import User from "../models/User";

const economySchema = Type.Object({
	coins: Type.Number(),
	lastCheckIn: Type.Number(),
	streak: Type.Number(),
});

const inventorySchema = Type.Record(Type.String(), Type.Number());

const successSchema = Type.Object({
	success: Type.Boolean(),
});

const errorSchema = Type.Object({
	error: Type.String(),
});

export default async function syncRoutes(app: FastifyInstance) {
	const typedApp = app.withTypeProvider<TypeBoxTypeProvider>();

	typedApp.get(
		"/economy",
		{
			preHandler: [authenticate],
			schema: {
				tags: ["Sync"],
				summary: "Get the authenticated user economy data",
				security: [{ bearerAuth: [] }],
				response: {
					200: economySchema,
					404: errorSchema,
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.user as { userId: string };

			const user = await User.findById(userId);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}

			return reply.code(200).send(user.economy);
		},
	);

	typedApp.post(
		"/economy",
		{
			preHandler: [authenticate],
			schema: {
				tags: ["Sync"],
				summary: "Update the authenticated user economy data",
				security: [{ bearerAuth: [] }],
				body: economySchema,
				response: {
					200: successSchema,
					404: errorSchema,
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.user as { userId: string };
			const { coins, lastCheckIn, streak } = request.body;

			const user = await User.findById(userId);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}

			user.economy = { coins, lastCheckIn, streak };
			await user.save();

			return reply.code(200).send({ success: true });
		},
	);

	typedApp.get(
		"/inventory",
		{
			preHandler: [authenticate],
			schema: {
				tags: ["Sync"],
				summary: "Get the authenticated user inventory",
				security: [{ bearerAuth: [] }],
				response: {
					200: inventorySchema,
					404: errorSchema,
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.user as { userId: string };

			const user = await User.findById(userId);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}

			const inventory =
				user.inventory instanceof Map
					? Object.fromEntries(user.inventory)
					: (user.inventory ?? {});

			return reply.code(200).send(inventory);
		},
	);

	typedApp.post(
		"/inventory",
		{
			preHandler: [authenticate],
			schema: {
				tags: ["Sync"],
				summary: "Update the authenticated user inventory",
				security: [{ bearerAuth: [] }],
				body: inventorySchema,
				response: {
					200: successSchema,
					404: errorSchema,
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.user as { userId: string };
			const inventory = request.body;

			const user = await User.findById(userId);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}

			user.inventory = inventory;
			await user.save();

			return reply.code(200).send({ success: true });
		},
	);
}
