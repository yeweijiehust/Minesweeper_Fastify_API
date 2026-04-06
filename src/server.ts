import dotenv from "dotenv";
import { buildApp } from "./app";
import { connectDB } from "./config/db";

dotenv.config();

const start = async () => {
	try {
		await connectDB();
		const app = await buildApp();
		const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

		await app.listen({ port: port, host: "0.0.0.0" });
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
