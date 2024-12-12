import express from 'express';
import {
  addReplyToRepost,
  deleteReplyFromRepost,
  repostUnrepostThread,
} from '../controllers/repostController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/repost', authorize({ minRole: 'user' }), repostUnrepostThread);
router.post(
  '/:repostId/replies',
  authorize({ minRole: 'user' }),
  addReplyToRepost,
);
router.delete(
  '/:repostId/replies/:replyId',
  authorize({ minRole: 'user' }),
  deleteReplyFromRepost,
);

export default router;
