import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
<<<<<<< HEAD
import Notification from "../models/notificationModel.js";

import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";

const createOrReplyThread = async (req, res) => {
=======
import { checkBadWords } from "../utils/helpers/checkBadword.js";
import { handleImagesCheckAndUpload } from "../utils/helpers/handleImagesCheckAndUpload.js";

export const createOrReplyThread = async (req, res) => {
>>>>>>> origin/main
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const { parentId } = req.params;
        const imgs = req.files;
        // if (!postedBy) {
        //     return res.status(400).json({ error: "You are not owner post" });
        // }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        // if (user._id.toString() !== userId.toString()) {
        //     return res.status(401).json({ error: "Unauthorized to create post" });
        // }
        if (!text) return res.status(400).json({ error: "Text field is required" });
        if (text.length > 500) return res.status(400).json({ error: "Text must be less than 500 characters" });

        const thread = parentId ? await Thread.findOne({ _id: threadId, isHidden: false }) : null;
        if (parentId && !thread) return res.status(404).json({ error: "Parent thread not found" });
        const badWords = checkBadWords(text);
        if (badWords.length > 0) {
            return res.status(400).json({ error: "Text contains inappropriate language", badWords });
        }

        let imgUrls = [];

        if (imgs && imgs.length > 0) {
            const result = await handleImagesCheckAndUpload(imgs);
            if (result.error) {
                return res.status(400).json({
                    error: result.error,
                    violations: result.violations,
                    details: result.details,
                });
            }
            imgUrls = result.data;
        }

        const newThread = new Thread({
            postedBy: userId,
            text,
            parentId: parentId || null,
            imgs: imgUrls || [],
        });

        await newThread.save();

        if (parentId) {
            await Thread.findByIdAndUpdate(parentId, {
                $push: { children: newThread._id },
                $inc: { commentCount: 1 },
            });
        }

        res.status(201).json(newThread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getReplies = async (req, res) => {
    try {
        const { id: parentId } = req.params;
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;

        if (!parentId) {
            return res.status(400).json({ error: "Parent thread ID is required" });
        }

        const parentThread = await Thread.findById(parentId);
        if (!parentThread) {
            return res.status(404).json({ error: "Parent thread not found" });
        }

        const replies = await Thread.aggregate([
            { $match: { parentId: parentId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedBy',
                    foreignField: '_id',
                    as: 'postedByInfo'
                }
            },
            {
                $unwind: {
                    path: '$postedByInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    postedBy: {
                        name: '$postedByInfo.name',
                        profilePic: '$postedByInfo.profilePic',
                        _id: '$postedByInfo._id'
                    }
                }
            },
            {
                $project: {
                    likes: 0,
                    __v: 0,
                    parentId: 0,
                    children: 0,
                    'postedByInfo': 0
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skipAmount },
            { $limit: parseInt(pageSize) }
        ]);

        const totalRepliesCount = await Thread.countDocuments({ parentId });
        const isNext = totalRepliesCount > skipAmount + replies.length;

        res.status(200).json({ success: true, threads: replies, isNext });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getThreads = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;
        const userId = req?.user?._id;

        let followingIds = [];
        let viewedThreads = [];

        if (userId) {
            const { following = [], viewedThreads: viewed = [] } = await User.findById(userId)
                .select("viewedThreads following")
                .lean() || {};
            followingIds = following;
            viewedThreads = viewed;
        }
        const threadConditions = {
            parentId: null,
            isHidden: false,
            ...(viewedThreads.length ? { _id: { $nin: viewedThreads } } : {})
        };

        const threads = await Thread.find(threadConditions)
            .populate({
                path: 'postedBy',
                select: '_id name profilePic',
            })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize))
            .select('-__v -isHidden')
            .lean();
        threads.forEach(thread => {
            thread.isFollowed = followingIds.includes(thread.postedBy._id);
            thread.isLiked = Array.isArray(thread.likes) && thread.likes.includes(userId);
        });

        const totalThreadsCount = await Thread.countDocuments(threadConditions);
        const isNext = totalThreadsCount > skipAmount + threads.length;

        res.status(200).json({
            success: true,
            threads,
            isNext
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getThreadById = async (req, res) => {
    try {
        const threadId = req.params.id;
        const userId = req?.user?._id.toString();
        const thread = await Thread.findOne({
            _id: threadId, isHidden: false
        })
            .select('-__v -parentId -children')
            .populate("postedBy", "_id name username profilePic")
            .exec();
        if (userId && Array.isArray(thread?.likes))
            thread.isLiked = thread.likes.includes(userId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json(thread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
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
<<<<<<< HEAD
        
        const thread = await Thread.findById(threadId);
        const recipientId  = await User.findById(thread.postedBy);   
=======

        const thread = await Thread.findOne({
            _id: req.params.id, isHidden: false
        })
>>>>>>> origin/main
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        // Check if the user has already liked the thread
        const userLikedThread = thread.likes.includes(userId);
        console.log(threadId , userId , "hahaahahha");
        let notification = await Notification.findOne({
            thread: threadId,
             user: userId, // Nếu trường `User` trong `Notification` là ObjectId của `userId`
            // type: "like"
        });
        console.log(notification,"hehehehe")
        if (userLikedThread) {
            if (thread.likeCount > 0) {
                await Thread.updateOne(
                    { _id: threadId },
                    {
                        $pull: { likes: userId },
                        $inc: { likeCount: -1 }
                    }
                );
                res.status(200).json({
                    success: true,
                    message: "Thread unliked successfully",
                    likeCount: thread.likeCount - 1
                });
            } else {
                await Thread.updateOne(
                    { _id: threadId },
                    {
                        $pull: { likes: userId },
                    }
                );
                res.status(200).json({
                    success: true,
                    message: "Thread already has zero likes",
                    likeCount: thread.likeCount
                });
            }
            const result = await Notification.deleteOne({
                thread: threadId,
                user: userId,
                type: "like"
            });
                
        } else {

            await Thread.updateOne(
                { _id: threadId },
                {
                    $addToSet: { likes: userId },
                    $inc: { likeCount: 1 }
                }
            );
            res.status(200).json({
                success: true,
                message: "Thread liked successfully",
                likeCount: thread.likeCount + 1
            });

            if (!notification) {
                notification = new Notification({
                    user: userId,
                    type: "like",
                    thread: threadId
                });
                await notification.save();
            }
            console.log(notification);


		    const recipientSocketId = getRecipientSocketId(recipientId._id);
            io.to(recipientSocketId).emit('notification', {
                threadId,
                action: 'like',
                userId,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
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

export const getThreadsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;

        const result = await Thread.find({
            postedBy: userId,
            isHidden: false
        })
            .select('-__v -parentId -children -postedByInfo')
            .populate({
                path: 'postedBy',
                select: '_id name profilePic',
            }).sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize));
        if (result.length === 0) {
            return res.status(200).json({ success: true, threads: [], isNext: false });
        }
        const totalRepliesCount = await Thread.countDocuments({ postedBy: userId });
        const isNext = totalRepliesCount > skipAmount + result.length;

        res.status(200).json({ success: true, threads: result, isNext: isNext });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
