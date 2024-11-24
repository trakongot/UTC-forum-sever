import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    media: {
        type: [String],
        default: [],
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    likeCount: {
        type: Number,
        default: 0,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
        default: null,
    },
    isHidden: {
        type: Boolean,
        default: false,
    }
});

threadSchema.pre('save', function (next) {
    this.likeCount = this.likes.length;
    next();
});

threadSchema.methods.addComment = async function (commentId) {
    const parentThread = await this.model("Thread").findById(this.parentId);
    if (parentThread) {
        parentThread.commentCount += 1;
        await parentThread.save();
    }
};

threadSchema.methods.removeComment = async function (commentId) {
    const parentThread = await this.model("Thread").findById(this.parentId);
    if (parentThread) {
        parentThread.commentCount -= 1;
        await parentThread.save();
    }
};

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
