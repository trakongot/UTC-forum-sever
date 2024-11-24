import express from "express";
import { addReplyToRepost, deleteReplyFromRepost, repostUnrepostThread } from "../controllers/repostController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.put("/repost", authenticateUser, repostUnrepostThread);
router.post('/:repostId/replies', authenticateUser, addReplyToRepost);
router.delete('/:repostId/replies/:replyId',authenticateUser, deleteReplyFromRepost); 

export default router;