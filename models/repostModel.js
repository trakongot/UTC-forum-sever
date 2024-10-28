import mongoose from "mongoose";

const repostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threads",
        required: true,
    },
    repostedAt: {
        type: Date,
        default: Date.now,
    },
    replies: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            profilePic: {
                type: String,
            },
            username: {
                type: String,
            },
        },
    ],
});


const Repost = mongoose.models.Repost || mongoose.model("Reposts", repostSchema);

export default Repost;

