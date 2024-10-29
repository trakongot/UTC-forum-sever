import express from "express";
import {
    createThread,
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    replyToThread,
} from "../controllers/threadController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getThreads);
router.get("/:id", protectRoute, getThreadById);
router.post("/", protectRoute, createThread);
router.delete("/:id", protectRoute, deleteThread);
router.put("/like/:id", protectRoute, likeUnlikeThread);
router.put("/reply/:id", protectRoute, replyToThread);

export default router;
