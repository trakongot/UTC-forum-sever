import mongoose from "mongoose"

const saveSchema = new mongoose.Schema({
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
const Save = mongoose.models.Save || mongoose.model("Saves", saveSchema);

export default Save;
