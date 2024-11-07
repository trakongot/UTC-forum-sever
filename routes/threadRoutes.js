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
} from "../controllers/threadController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { fileUploadMiddleware as multer } from "../middlewares/fileUploadMiddleware.js";

const router = express.Router();

router.get("/", getThreads);
router.get("/:id", getThreadById);
router.post("/", authenticateUser, multer.array("imgs"), createOrReplyThread);
router.post("/reply/:parentId?", authenticateUser, multer.array("imgs"), createOrReplyThread);
router.delete("/:id", authenticateUser, deleteThread);
router.put("/like/:id", authenticateUser, likeUnlikeThread);
router.put("/hide/:id", authenticateUser, hideThread);
router.get("/:id/likes", authenticateUser, getLikes);
router.put("/repost", authenticateUser, repostThread);

export default router;
