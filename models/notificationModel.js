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
        refPath: "contentType",
    },
    contentType: {
        type: String,
        enum: ["Thread", "Comment"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
});

const Notification = mongoose.models.Notification || mongoose.model("Notifications", notificationSchema);

export default Notification;
