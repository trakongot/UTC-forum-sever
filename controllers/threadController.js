import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
import Repost from '../models/repostModel.js'; 
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const createOrReplyThread = async (req, res) => {
    try {
        const { text, postedBy } = req.body;
        const userId = req.user._id;
        const { parentId } = req.params;
        const imgs = req.files;
        if (!postedBy) {
            return res.status(400).json({ error: "You are not owner post" });
        }

        const user = await User.findById(postedBy);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user._id.toString() !== userId.toString()) {
            return res.status(401).json({ error: "Unauthorized to create post" });
        }
        if (!text) return res.status(400).json({ error: "Text field is required" });
        if (text.length > 500) return res.status(400).json({ error: "Text must be less than 500 characters" });

        const thread = parentId ? await Thread.findById(parentId) : null;
        if (parentId && !thread) return res.status(404).json({ error: "Parent thread not found" });

        let imgUrls = [];
        if (imgs && imgs.length > 0) {
            try {
                const uploadPromises = imgs.map(img => {
                    return cloudinary.uploader.upload(img.path)
                        .then(result => {
                            fs.unlinkSync(img.path);
                            console.log(result) 
                            return result.secure_url;  
                        })
                        .catch(err => {
                            fs.unlinkSync(img.path);
                            console.error("Error uploading image:", err);
                            throw err;
                        });
                });
                imgUrls = await Promise.all(uploadPromises);  // This will be an array of URLs
            } catch (error) {
                console.error("Error uploading images:", error);
                throw error;
            }
        }

        console.log(imgUrls)

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

const getThreads = async (req, res) => {
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


// const getThreads = async (req, res) => {
//     try {
//         const { pageNumber = 1, pageSize = 20 } = req.query;
//         const skipAmount = (pageNumber - 1) * pageSize;
//         const userId = req?.user?._id;

//         // Khởi tạo biến để lưu danh sách ID theo dõi và ID thread đã xem
//         let followingIds = [];
//         let viewedThreads = [];

//         // Nếu có userId, lấy thông tin người dùng
//         if (userId) {
//             const user = await User.findById(userId).select("viewedThreads following").lean();
//             followingIds = user.following || [];
//             viewedThreads = user.viewedThreads || [];
//         }

//         // Điều kiện tìm kiếm cho các thread
//         const threadConditions = {
//             parentId: null, // Lấy các thread cha
//             isHidden: false,
//             ...(viewedThreads.length > 0 ? { _id: { $nin: viewedThreads } } : {})
//         };

//         // Truy vấn các thread
//         const threads = await Thread.aggregate([
//             { $match: threadConditions },
//             {
//                 $lookup: {
//                     from: 'users',
//                     localField: 'postedBy',
//                     foreignField: '_id',
//                     as: 'postedByInfo'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$postedByInfo',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $addFields: {
//                     isFollowed: { $in: ['$postedByInfo._id', followingIds] },
//                     postedBy: {
//                         name: '$postedByInfo.name',
//                         profilePic: '$postedByInfo.profilePic'
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     likes: 0,
//                     __v: 0,
//                     children: 0,
//                     'postedByInfo': 0 // Bỏ trường không cần thiết
//                 }
//             },
//             { $sort: { createdAt: -1 } },
//             { $skip: skipAmount },
//             { $limit: parseInt(pageSize) }
//         ]);

//         // Tính tổng số lượng thread
//         const totalThreadsCount = await Thread.countDocuments(threadConditions);
//         const isNext = totalThreadsCount > skipAmount + threads.length;

//         // Trả về kết quả
//         res.status(200).json({ success: true, threads, isNext });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

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



const getThreadById = async (req, res) => {
    try {
        const threadId = req.params.id;
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

        // Check if the user has already liked the thread
        const userLikedThread = thread.likes.includes(userId);

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
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const getLikes = async (req, res) => {
    try {
        const { id: threadId } = req.params;

        const thread = await Thread.findById(threadId).populate('likes', '_id name username profilePic');

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: true, likes: thread.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const hideThread = async (req, res) => {
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
const shareThread = async (req, res) => {
    try {
        const { id: threadId } = req.params;

        const thread = await Thread.findById(threadId);
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

const repostThread = async (req, res) => {
    try {
        const userId = req.user._id
        const { id: threadId } = req.body;
        const user = await User.findById(userId)
        const thread = await thread.updateOne(
            threadId,
            { $inc: { repostCount: 1 } });
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
const getRepliesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;

        // Lấy danh sách các thread mà người dùng đã reply
        const result = await Thread.find({
            postedBy: userId,
            parentId: { $ne: null },
            isHidden: false
        })
            .select('-__v') 
            .populate({
                path: 'postedBy',
                select: '_id name profilePic'
            })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(parseInt(pageSize));

        if (result.length === 0) {
            return res.status(200).json({ success: true, threads: [], isNext: false });
        }

        // Lấy danh sách thread gốc bằng cách truy vấn thêm thông tin từ parentId
        const threadIds = result.map(thread => thread.parentId);
        const threadsGoc = await Thread.find({ '_id': { $in: threadIds } })
         //.select('_id likes imgs text postedBy createdAt likeCount commentCount shareCount repostCount');

        const totalRepliesCount = await Thread.countDocuments({
            postedBy: userId,
            parentId: { $ne: null },
        });
        const isNext = totalRepliesCount > skipAmount + result.length;

        const threadsWithReplies = result.map(thread => {
            const threadGoc = threadsGoc.find(t => t._id.toString() === thread.parentId);
            return {
                thread: threadGoc, // Thread gốc
                reply: thread, // Reply của người dùng
            };
        });

        res.status(200).json({ success: true, threads: threadsWithReplies, isNext: isNext });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getRepostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;  
        const { pageNumber = 1, pageSize = 20 } = req.query;  
        const skipAmount = (pageNumber - 1) * pageSize;

        const reposts = await Repost.find({ 'user': userId })  // Tìm reposts của người dùng
            .populate({
                path: 'thread',  // Lấy thông tin thread gốc từ trường thread trong Repost
                select: '_id text createdAt likeCount commentCount shareCount repostCount imgs'
            })
            .populate({
                path: 'thread.postedBy',  // Lấy thông tin người đăng thread gốc
                select: '_id name profilePic'
            })
            .sort({ repostedAt: -1 }) 
            .skip(skipAmount) 
            .limit(parseInt(pageSize)); 

        if (reposts.length === 0) {
            return res.status(200).json({ success: true, reposts: [], isNext: false });
        }

        // Đếm tổng số reposts để xác định xem có page kế tiếp không
        const totalRepostsCount = await Repost.countDocuments({ 'user': userId });
        const isNext = totalRepostsCount > skipAmount + reposts.length;

        // Trả về kết quả
        res.status(200).json({
            success: true,
            reposts: reposts.map(repost => repost.thread),  // Chỉ trả về thread gốc của mỗi repost
            isNext: isNext  // Kiểm tra xem có còn page kế tiếp không
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



  
export {
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    createOrReplyThread,
    hideThread,
    getLikes,
    repostThread,
    shareThread,
    getRepliesByUser,
    getRepostsByUser,
};


