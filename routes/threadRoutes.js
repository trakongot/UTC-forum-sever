import express from "express";
import {
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    hideThread,
    getLikes,
    createOrReplyThread,
    repostThread,
    getReplies,
    getThreadsByUser
} from "../controllers/threadController.js";
import { authenticateUser, authenticateUserWithOptionalCookie } from "../middlewares/authMiddleware.js";
import { fileUploadMiddleware as multer } from "../middlewares/fileUploadMiddleware.js";

const router = express.Router();

router.get("/", authenticateUserWithOptionalCookie, getThreads); // Get a list of all threads
router.get("/:id", authenticateUserWithOptionalCookie, getThreadById); // Get details of a single thread by its ID
router.post("/", authenticateUser, multer.array("media"), createOrReplyThread); // Create a new thread or reply to an existing thread
router.post("/:id/replies", authenticateUser, multer.array("media"), createOrReplyThread); // Reply to a specific thread (sub-thread)
router.get("/:id/replies", authenticateUserWithOptionalCookie, getReplies); // Get all replies for a specific thread
router.delete("/:id", authenticateUser, deleteThread); // Delete a thread by its ID
router.post("/:id/like", authenticateUser, likeUnlikeThread); // Like or unlike a thread
router.put("/:id/hide", authenticateUser, hideThread); // Hide a thread by its ID
router.get("/:id/likes", getLikes); // Get the likes of a specific thread
router.post("/:id/repost", authenticateUser, repostThread); // Repost a thread
router.get("/:userId/byUser", authenticateUserWithOptionalCookie, getThreadsByUser); // Get all threads created by a specific user

export default router;


