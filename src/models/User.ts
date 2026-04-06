import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
	username: string;
	passwordHash: string;
	economy: {
		coins: number;
		lastCheckIn: number;
		streak: number;
	};
	inventory: Record<string, number>;
}

const UserSchema: Schema = new Schema(
	{
		username: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		economy: {
			coins: { type: Number, default: 0 },
			lastCheckIn: { type: Number, default: 0 },
			streak: { type: Number, default: 0 },
		},
		inventory: {
			type: Map,
			of: Number,
			default: {},
		},
	},
	{ timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
