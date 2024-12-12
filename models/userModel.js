import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			minLength: 6,
			required: true,
		},
		profilePic: {
			type: String,
			default: "",
		},
		followers: {
			ref: "User",
			type: [mongoose.Schema.Types.ObjectId],
			default: [],
		},
		following: {
			ref: "User",
			type: [mongoose.Schema.Types.ObjectId],
			default: [],
		},
		bio: {
			type: String,
			default: "",
		},
		saves: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Thread",
		}],
		reposts: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Thread",
		}],
		blockedUsers: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: [],
		}],
		onboarded: {
			type: Boolean,
			default: false,
		},
		viewedThreads: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Thread",
				default: [],
			}
		],
		accountStatus: {
			type: String,
			default: "active",
			enum: ["active", "inactive", "temporary_ban", "permanent_ban"],
		},
		banExpiration: {
			type: Date,
		},
		role: {
			type: String,
			enum: ["user", "moderator", "super_admin"],
			default: "user",
		},
		socialLinks: {
			type: String,
		},
		lastActive: { type: Date }
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
