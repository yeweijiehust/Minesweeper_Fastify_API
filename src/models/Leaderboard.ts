import mongoose, { type Document, Schema } from "mongoose";

export interface ILeaderboard extends Document {
	username: string;
	difficulty: string;
	durationSeconds: number;
	dateTimestamp: number;
}

const LeaderboardSchema: Schema = new Schema({
	username: { type: String, required: true },
	difficulty: { type: String, required: true },
	durationSeconds: { type: Number, required: true },
	dateTimestamp: { type: Number, required: true },
});

LeaderboardSchema.index({ difficulty: 1, durationSeconds: 1 });

export default mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
