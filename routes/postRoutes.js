import express from "express";
import {
	createPost,
	deletePost,
	getPost,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
} from "../controllers/postController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/feed", authenticateUser, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", authenticateUser, createPost);
router.delete("/:id", authenticateUser, deletePost);
router.put("/like/:id", authenticateUser, likeUnlikePost);
router.put("/reply/:id", authenticateUser, replyToPost);

export default router;
