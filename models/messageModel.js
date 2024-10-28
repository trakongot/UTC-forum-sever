import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversations" },
		sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		text: String,
		seen: {
			type: Boolean,
			default: false,
		},
		img: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model("Messages", messageSchema);

export default Message;
