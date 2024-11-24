import Repost from '../models/repostModel.js';
import User from "../models/userModel.js";
import Thread from "../models/threadModel.js";

export const repostUnrepostThread = async (req, res) => {
    try {
        const userId = req.user._id;
        const { threadId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        const existingRepost = await Repost.findOne({ user: userId, thread: threadId });

        if (existingRepost) {
            await Repost.findByIdAndDelete(existingRepost._id);
            await Thread.findByIdAndUpdate(threadId, { $inc: { repostCount: -1 } });
            await User.findByIdAndUpdate(userId, { $pull: { reposts: existingRepost._id } });
            return res.status(200).json({
                success: true,
                message: "Repost removed successfully",
            });
        } else {
            const repost = await Repost.create({
                user: userId,
                thread: threadId,
                repostedFrom: threadId,
            });
            await Thread.findByIdAndUpdate(threadId, { $inc: { repostCount: 1 } });
            await User.findByIdAndUpdate(userId, { $push: { reposts: repost._id } });
            return res.status(200).json({
                success: true,
                message: "Thread reposted successfully",
                repostedThread: repost,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const addReplyToRepost = async (req, res) => {
    try {
        const { repostId } = req.params;
        const { text } = req.body;
        console.log(repostId);
        const userId = req.user._id;
        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Text is required" });
        }
        const repost = await Repost.findById(repostId);
        if (!repost) {
            return res.status(404).json({ error: "Repost not found" });
        }
        const user = await User.findById(userId).select("username profilePic");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newReply = {
            userId,
            text,
            profilePic: user.profilePic || "",
            username: user.username || "Anonymous",
        };
        repost.replies.push(newReply);
        await repost.save();
        res.status(201).json({ success: true, message: "Reply added successfully", reply: newReply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }

};
export const deleteReplyFromRepost = async (req, res) => {
    try {
        const { repostId, replyId } = req.params;
        const userId = req.user._id;

        // Validate repost existence and user existence in a single query
        const repost = await Repost.findById(repostId);
        if (!repost) {
            return res.status(404).json({ error: "Repost not found" });
        }

        const reply = repost.replies.find((reply) => reply._id.toString() === replyId);
        if (!reply) {
            return res.status(404).json({ error: "Reply not found" });
        }

        // Check if the user is authorized to delete this reply
        if (reply.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this reply" });
        }

        // Use $pull to remove the reply from the repost document's replies array
        await Repost.updateOne(
            { _id: repostId },
            { $pull: { replies: { _id: replyId } } }
        );

        res.status(200).json({ success: true, message: "Reply deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getRepostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;

        const reposts = await Repost.find({ 'user': userId })
            .populate({
                path: 'thread',
                select: '_id text createdAt likeCount commentCount shareCount repostCount imgs'
            })
            .populate({
                path: 'thread.postedBy',
                select: '_id name profilePic'
            })
            .sort({ repostedAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize));

        if (reposts.length === 0) {
            return res.status(200).json({ success: true, reposts: [], isNext: false });
        }

        const totalRepostsCount = await Repost.countDocuments({ 'user': userId });
        const isNext = totalRepostsCount > skipAmount + reposts.length;

        res.status(200).json({
            success: true,
            reposts: reposts.map(repost => repost.thread),
            isNext: isNext
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
