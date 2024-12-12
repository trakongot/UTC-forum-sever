import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/messageController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/conversations', authorize({ minRole: 'user' }), getConversations);
router.get('/:otherUserId', authorize({ minRole: 'user' }), getMessages);
router.post('/', authorize({ minRole: 'user' }), sendMessage);

export default router;
