import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
import Save from "../models/saveModel.js"; // Import the Save model

const saveUnsaveThread = async (req, res) => {
    try {
        const { threadId } = req.body; // Extract threadId from request body
        const userId = req.user._id; // Get the userId from the authenticated user
        const thread = await Thread.findById(threadId);

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the thread is already saved by the user
        const existingSave = await Save.findOne({ user: userId, thread: threadId });

        if (existingSave) {
            // If thread is saved, unsave it by deleting the Save document
            await Save.findByIdAndDelete(existingSave._id);
            return res.status(200).json({ success: true, message: "Thread unsaved successfully" });
        } else {
            // If thread is not saved, save it by creating a new Save document
            const newSave = new Save({
                user: userId,
                thread: threadId,
            });
            await newSave.save(); // Save the new Save document to the database
            return res.status(200).json({ success: true, message: "Thread saved successfully" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    saveUnsaveThread,
};
