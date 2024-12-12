import express from 'express';
import { searchThreads, searchUsers } from '../controllers/searchController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/suggestions', authorize({ minRole: 'user' }), searchUsers);
router.get('/threads', authorize({ minRole: 'user' }), searchThreads);

export default router;
