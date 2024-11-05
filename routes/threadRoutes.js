import express from "express";
import {
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    hideThread,
    getLikes,
    createOrReplyThread,
    saveThread,
} from "../controllers/threadController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/", getThreads);
router.get("/:id", getThreadById);
router.post("/", protectRoute, createOrReplyThread);
router.post("/reply/:parentId", protectRoute, createOrReplyThread)
router.delete("/:id", protectRoute, deleteThread);
router.put("/like/:id", protectRoute, likeUnlikeThread);
router.put("/hide/:id", protectRoute, hideThread);
router.get("/:id/likes", protectRoute, getLikes);
router.post("/save", protectRoute, saveThread);





export default router;
