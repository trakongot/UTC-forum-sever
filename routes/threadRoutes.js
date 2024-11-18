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
    getRepliesByUser,
    getRepostsByUser,
} from "../controllers/threadController.js";
import multer from "multer";
import { authenticateUser } from "../middlewares/protectRoute.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "temp/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", getThreads);
router.get("/:id", getThreadById);
router.post("/", authenticateUser, upload.array("imgs"), createOrReplyThread);
router.post("/reply/:parentId?", authenticateUser, upload.array("imgs"), createOrReplyThread);
router.get("/:userId/replies", getRepliesByUser);
router.get("/:userId/reposts", getRepostsByUser);
router.delete("/:id", authenticateUser, deleteThread);
router.put("/like/:id", authenticateUser, likeUnlikeThread);
router.put("/hide/:id", authenticateUser, hideThread);
router.get("/:id/likes", authenticateUser, getLikes);
router.put("/repost", authenticateUser, repostThread);

export default router;
