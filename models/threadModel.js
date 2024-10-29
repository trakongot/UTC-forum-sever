import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },
    img: {
        type: String,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    shareCount: {
        type: Number,
        default: 0,
    },
    repostCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        },
    ],
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
