import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { checkBadWords } from "../utils/helpers/checkBadword.js";
import { checkImageViolation, loadModel } from "../utils/helpers/imageValidation.js";

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
        const badWords = checkBadWords(text);
        if (badWords.length > 0) {
            return res.status(400).json({ error: "Text contains inappropriate language", badWords });
        }
        let imgUrls = [];

        if (imgs && imgs.length > 0) {
            await loadModel();

            const imageChecks = await Promise.all(imgs.map(async (img) => {
                const violation = await checkImageViolation(img.path);
                return { image: img.path, violation };
            }));

            const violations = imageChecks.filter(imgCheck => imgCheck.violation.isViolation);
            if (violations.length > 0) {
                return res.status(400).json({
                    error: "Some images contain inappropriate content",
                    violations: violations.map(violation => violation.image),
                    violationDetails: violations.map(violation => ({
                        image: violation.image,
                        violations: violation.violation.violations
                    }))
                });
            }

            try {
                const uploadPromises = imgs.map(img =>
                    cloudinary.uploader.upload(img.path)
                        .then(result => {
                            fs.unlinkSync(img.path);
                            return result.secure_url;
                        })
                        .catch(err => {
                            fs.unlinkSync(img.path);
                            console.error("Error uploading image:", err);
                            throw err;
                        })
                );

                imgUrls = await Promise.all(uploadPromises);
            } catch (error) {
                console.error("Error uploading images:", error);
                throw error;
            }
        } else {
            return res.status(400).json({
                error: "No images provided"
            });
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



const getThreads = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 20 } = req.query;
        const skipAmount = (pageNumber - 1) * pageSize;
        const userId = req?.user?._id;

        // Khởi tạo biến để lưu danh sách ID theo dõi và ID thread đã xem
        let followingIds = [];
        let viewedThreads = [];

        // Nếu có userId, lấy thông tin người dùng
        if (userId) {
            const user = await User.findById(userId).select("viewedThreads following").lean();
            followingIds = user.following || [];
            viewedThreads = user.viewedThreads || [];
        }

        // Điều kiện tìm kiếm cho các thread
        const threadConditions = {
            parentId: null, // Lấy các thread cha
            isHidden: false,
            ...(viewedThreads.length > 0 ? { _id: { $nin: viewedThreads } } : {})
        };

        // Truy vấn các thread
        const threads = await Thread.aggregate([
            { $match: threadConditions },
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
                    isFollowed: { $in: ['$postedByInfo._id', followingIds] },
                    postedBy: {
                        name: '$postedByInfo.name',
                        profilePic: '$postedByInfo.profilePic'
                    }
                }
            },
            {
                $project: {
                    likes: 0,
                    __v: 0,
                    children: 0,
                    'postedByInfo': 0 // Bỏ trường không cần thiết
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skipAmount },
            { $limit: parseInt(pageSize) }
        ]);

        // Tính tổng số lượng thread
        const totalThreadsCount = await Thread.countDocuments(threadConditions);
        const isNext = totalThreadsCount > skipAmount + threads.length;

        // Trả về kết quả
        res.status(200).json({ success: true, threads, isNext });
    } catch (err) {
        console.error(err);
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

export {
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    createOrReplyThread,
    hideThread,
    getLikes,
    repostThread,
    shareThread
};


