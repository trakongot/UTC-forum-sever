import mongoose from "mongoose"

const saveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
        required: true,
    },
    savedAt: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Users",
        default: [],
    },
});
const Save = mongoose.models.Save || mongoose.model("Save", saveSchema);

export default Save;
