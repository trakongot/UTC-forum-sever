    import mongoose from "mongoose"

    const notificationSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "comment", "follow", "mention", "repost"],
            required: true,
        },
        content: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "type",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        thread: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread", // Liên kết tới chủ đề, nếu có
        },
        target: { // Đây là người hoặc bài viết được nhắm tới
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Hoặc "Post" nếu liên quan đến bài viết
        },
    });

    const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

    export default Notification;
