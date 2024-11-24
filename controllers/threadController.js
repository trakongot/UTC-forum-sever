import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
import { checkBadWords } from "../utils/helpers/checkBadword.js";
import { handleImagesAndVideosCheckAndUpload } from "../utils/helpers/handleMediasCheckAndUpload.js";

export const createOrReplyThread = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const { id: parentId } = req.params; // ID của thread cha (nếu có)
        const media = req.files;
        if (!text) return res.status(400).json({ error: "Text field is required" });
        if (text.length > 500) return res.status(400).json({ error: "Text must be less than 500 characters" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const badWords = checkBadWords(text);
        if (badWords.length > 0) {
            return res.status(400).json({ error: "Text contains inappropriate language", badWords });
        }

        let mediaUrls = [];

        if (media && media.length > 0) {
            const result = await handleImagesAndVideosCheckAndUpload(media);
            if (result.error) {
                return res.status(400).json({
                    error: result.error,
                    violations: result.violations,
                    details: result.details,
                });
            }
            mediaUrls = result.data;
        }

        const newThread = new Thread({
            postedBy: userId,
            text,
            parentId: parentId || null,
            media: mediaUrls || [],
        });

        await newThread.save();

        // Nếu là reply (có parentId), dùng addComment
        if (parentId) {
            const parentThread = await Thread.findById(parentId);
            if (!parentThread) {
                return res.status(404).json({ error: "Parent thread not found" });
            }

            await parentThread.addComment(newThread._id);
        }

        res.status(201).json(newThread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getReplies = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;
        const userId = req?.user?._id.toString();
        const { id: parentId } = req.params;
        const parentThread = await Thread.findById(parentId);
        if (!parentThread) {
            return res.status(404).json({ error: "Parent thread not found" });
        }

        const baseQuery = { parentId, isHidden: false };
        const threadsQuery = Thread.find(baseQuery)
            .populate({ path: 'postedBy', select: '_id name profilePic bio username followers' })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize))
            .select('-__v -isHidden')
            .lean();

        if (!userId) {
            const threads = await threadsQuery;
            threads.forEach(thread => {
                thread.postedBy.isFollowed = false;
                thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
                thread.isLiked = false;
                delete thread.postedBy.followers;
            });

            const totalThreads = await Thread.countDocuments(baseQuery);
            return res.status(200).json({
                success: true,
                threads,
                isNext: totalThreads > skipAmount + threads.length
            });
        }

        const user = await User.findById(userId).select("viewedThreads following").lean();
        const followingIds = new Set(user.following?.map(id => id.toString()) || []);

        const threads = await threadsQuery;
        threads.forEach(thread => {
            thread.postedBy.isFollowed = followingIds.has(thread.postedBy._id.toString());
            thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
            thread.isLiked = thread.likes?.some(like => like.toString() === userId);
            delete thread.postedBy.followers;
        });

        const totalThreads = await Thread.countDocuments(baseQuery);
        return res.status(200).json({
            success: true,
            threads,
            isNext: totalThreads > skipAmount + threads.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getThreads = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;
        const userId = req?.user?._id?.toString();

        const baseQuery = { parentId: null, isHidden: false };
        const threadsQuery = Thread.find(baseQuery)
            .populate({ path: 'postedBy', select: '_id name profilePic bio username followers' })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize))
            .select('-__v -isHidden')
            .lean();

        if (!userId) {
            const threads = await threadsQuery;
            threads.forEach(thread => {
                thread.postedBy.isFollowed = false;
                thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
                thread.isLiked = false;
                delete thread.postedBy.followers;
            });

            const totalThreads = await Thread.countDocuments(baseQuery);
            return res.status(200).json({
                success: true,
                threads,
                isNext: totalThreads > skipAmount + threads.length
            });
        }

        const user = await User.findById(userId).select("viewedThreads following").lean();
        const followingIds = new Set(user.following?.map(id => id.toString()) || []);
        const viewedThreads = new Set(user.viewedThreads?.map(id => id.toString()) || []);

        const threadConditions = {
            ...baseQuery,
            ...(viewedThreads.size > 0 && { _id: { $nin: Array.from(viewedThreads) } })
        };

        const threads = await threadsQuery.where(threadConditions);
        threads.forEach(thread => {
            thread.postedBy.isFollowed = followingIds.has(thread.postedBy._id.toString());
            thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
            thread.isLiked = thread.likes?.some(like => like.toString() === userId);
            delete thread.postedBy.followers;
        });

        // if (threads.length > 0) {
        //     const threadIds = threads.map(thread => thread._id.toString());
        //     await User.findByIdAndUpdate(
        //         userId,
        //         { $addToSet: { viewedThreads: { $each: threadIds } } },
        //         { new: true }
        //     );
        // }

        const totalThreads = await Thread.countDocuments(baseQuery);
        return res.status(200).json({
            success: true,
            threads,
            isNext: totalThreads > skipAmount + threads.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getThreadsByUser = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const { userId: authorId } = req.params;
        const userId = req.user?._id?.toString();

        if (!authorId) {
            return res.status(400).json({ error: "Author ID is required" });
        }

        const parsedPageSize = parseInt(pageSize);
        const skipAmount = (pageNumber - 1) * parsedPageSize;


        const threads = await Thread.find({
            postedBy: authorId,
            isHidden: false,
        })
            .populate({ path: 'postedBy', select: '_id name profilePic username' })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parsedPageSize)
            .select('-__v -isHidden')
            .lean();


        const updatedThreads = threads.map(thread => ({
            ...thread,
            isLiked: thread.likes?.some(like => like.toString() === userId),
        }));

        const totalThreads = await Thread.countDocuments({ postedBy: authorId, isHidden: false });
        const isNext = totalThreads > skipAmount + updatedThreads.length;

        return res.status(200).json({
            success: true,
            threads: updatedThreads,
            isNext,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getThreadById = async (req, res) => {
    try {
        const threadId = req.params.id;
        const userId = req?.user?._id?.toString();

        const thread = await Thread.findOne({
            _id: threadId,
            isHidden: false
        })
            .select('-__v -parentId -children')
            .populate({ path: 'postedBy', select: '_id name profilePic bio username followers' })
            .lean();

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const isLiked = thread.likes?.some(like => like.toString() === userId) || false;
        const followerCount = thread.postedBy?.followers?.length || 0;

        delete thread.likes;

        return res.status(200).json({
            ...thread,
            isLiked,
            followerCount
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
export const deleteThread = async (req, res) => {
    try {
        const thread = await Thread.findOne({
            _id: req.params.id, isHidden: false
        })
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
export const likeUnlikeThread = async (req, res) => {
    try {
        const { id: threadId } = req.params;
        const userId = req.user._id;

        const thread = await Thread.findOne({ _id: threadId, isHidden: false });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const userLikedThread = thread.likes.includes(userId);

        const updateQuery = userLikedThread
            ? { $pull: { likes: userId }, $inc: { likeCount: -1 } }
            : { $addToSet: { likes: userId }, $inc: { likeCount: 1 } };

        await Thread.updateOne({ _id: threadId }, updateQuery);

        const likeCount = thread.likeCount + (userLikedThread ? -1 : 1);
        const message = userLikedThread
            ? "Thread unliked successfully"
            : "Thread liked successfully";

        return res.status(200).json({
            success: true,
            message,
            likeCount: Math.max(likeCount, 0), // Ensure like count doesn't go below zero
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getLikes = async (req, res) => {
    try {
        const { id: threadId } = req.params;

        const thread = await Thread
            .findOne({ _id: req.params.id, isHidden: false })
            .populate('likes', '_id name username profilePic');

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: true, likes: thread.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const hideThread = async (req, res) => {
    try {
        const { id: threadId } = req.params;
        const userId = req.user._id;

        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const isOwner = thread.postedBy.equals(userId);
        const isAdminOrModerator = req.user.role === 'admin' || req.user.role === 'moderator';

        if (!isOwner && !isAdminOrModerator) {
            return res.status(403).json({ error: "You do not have permission to hide this thread" });
        }

        await Thread.findByIdAndUpdate(
            threadId,
            { isHidden: true },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Thread hidden successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const shareThread = async (req, res) => {
    try {
        const { id: threadId } = req.params;

        const thread = await Thread
            .findOne({ _id: req.params.id, isHidden: false })
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        await Thread.findByIdAndUpdate(
            threadId,
            { $inc: { shareCount: 1 } },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Thread shared successfully", shareCount: thread.shareCount + 1 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const repostThread = async (req, res) => {
    try {
        const userId = req.user._id
        const { id: threadId } = req.body;
        const user = await User.findById(userId)
        const thread = await Thread.updateOne(
            { _id: threadId, isHidden: false },
            { $inc: { repostCount: 1 } }
        );
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        await user.updateOne(
            userId,
            { $push: { reposts: threadId } });
        res.status(200).json({ success: true, message: "Thread repost successfully", repostCount: thread.repostCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


