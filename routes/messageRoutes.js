import express from "express";

import { authenticateUser } from "../middlewares/authMiddleware.js";
import { getMessages, sendMessage, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", authenticateUser, getConversations);
router.get("/:otherUserId", authenticateUser, getMessages);
router.post("/", authenticateUser, sendMessage);

export default router;
