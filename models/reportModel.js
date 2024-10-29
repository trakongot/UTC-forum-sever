import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "contentType",
    },
    contentType: {
        type: String,
        enum: ["Thread", "Comment", "System", "Account"],
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
