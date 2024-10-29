import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createThread = async (req, res) => {
    try {
        const { postedBy, text, community, img } = req.body;
        if (!postedBy || !text) {
            return res.status(400).json({ error: "PostedBy and text field are reqired" })
        }
        const user = await User.findById(postedBy)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to create Thread" })
        }
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
        }
        const newThread = new Thread({ postedBy, text, community })
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            newThread.img = uploadedResponse.secure_url
        }
        await newThread.save()
        res.status(201).json(newThread)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Internal Sever Error" })
    }
};

const getThreads = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query; // Fetch page number and size from query params
        const skipAmount = (pageNumber - 1) * pageSize;

        const threads = await Thread.find({ parentId: { $in: [null, undefined] } }) // Fetch top-level threads
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(parseInt(pageSize))
            .populate({
                path: "children",
                populate: {
                    path: "author",
                    model: User,
                    select: "_id name parentId image",
                },
            });

        const totalThreadsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });
        const isNext = totalThreadsCount > skipAmount + threads.length;

        res.status(200).json({ success: true, threads, isNext });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getThreadById = async (req, res) => {
    try {
        const threadId = req.params.id; // Get thread ID from request parameters
        const thread = await Thread.findById(threadId)
            .populate("postedBy")
            .populate({
                path: "children",
                populate: {
                    path: "author",
                    model: User,
                    select: "_id name parentId image",
                },
            });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: true, thread });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteThread = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        if (thread.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Unauthorized to delete thread" });
        }

        await Thread.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Thread deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const likeUnlikeThread = async (req, res) => {
    try {
        const { id: threadId } = req.params;
        const userId = req.user._id;

        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const userLikedThread = thread.likes.includes(userId);

        if (userLikedThread) {
            await Thread.updateOne({ _id: threadId }, { $pull: { likes: userId } });
            res.status(200).json({ success: true, message: "Thread unliked successfully" });
        } else {
            thread.likes.push(userId);
            await thread.save();
            res.status(200).json({ success: true, message: "Thread liked successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const replyToThread = async (req, res) => {
    try {
        const { text } = req.body;
        const threadId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const reply = new Thread({
            postedBy: userId,
            text,
            parentId: threadId,
        });

        await reply.save();
        thread.children.push(reply._id);
        thread.commentCount += 1;
        await thread.save();

        res.status(200).json({ success: true, reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCommunityThreads = async (req, res) => {
    try {
        const { communityId } = req.params;

        const threads = await Thread.find({ community: communityId })
            .populate("postedBy author")
            .sort({ createdAt: -1 });

        if (threads.length === 0) {
            return res.status(204).json({ message: "No threads found for this community" });
        }

        res.status(200).json({ success: true, threads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export {
    createThread,
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    replyToThread,
    getCommunityThreads,
};
