import express from "express";
import {
    getThreads,
    getThreadById,
    deleteThread,
    likeUnlikeThread,
    hideThread,
    getLikes,
    createOrReplyThread,
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
router.post("/", protectRoute, createOrReplyThread);
router.post("/reply/:parentId", protectRoute, createOrReplyThread)
router.delete("/:id", protectRoute, deleteThread);
router.put("/like/:id", protectRoute, likeUnlikeThread);
router.put("/hide/:id", protectRoute, hideThread);
router.get("/:id/likes", protectRoute, getLikes);


export default router;
