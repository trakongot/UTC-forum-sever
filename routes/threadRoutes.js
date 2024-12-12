import express from 'express';
import {
  createOrReplyThread,
  deleteThread,
  getLikes,
  getReplies,
  getThreadById,
  getThreads,
  getThreadsByUser,
  likeUnlikeThread,
  repostThread,
  restrictThread,
} from '../controllers/threadController.js';
import { authorize } from '../middlewares/authMiddleware.js';
import { fileUploadMiddleware as multer } from '../middlewares/fileUploadMiddleware.js';

const router = express.Router();

router.get('/', authorize({ minRole: 'user' }), getThreads); // Get a list of all threads
router.get('/:id', authorize({ minRole: 'user' }), getThreadById); // Get details of a single thread by its ID
router.post(
  '/',
  authorize({ minRole: 'user' }),
  multer.array('media'),
  createOrReplyThread,
); // Create a new thread or reply to an existing thread
router.post(
  '/:id/replies',
  authorize({ minRole: 'user' }),
  multer.array('media'),
  createOrReplyThread,
); // Reply to a specific thread (sub-thread)
router.get('/:id/replies', authorize({ minRole: 'user' }), getReplies); // Get all replies for a specific thread
router.delete('/:id', authorize({ minRole: 'user' }), deleteThread); // Delete a thread by its ID
router.post('/:id/like', authorize({ minRole: 'user' }), likeUnlikeThread); // Like or unlike a thread
router.put('/:id/restrict', authorize({ minRole: 'user' }), restrictThread); // Hide a thread by its ID
router.get('/:id/likes', authorize({ minRole: 'user' }), getLikes); // Get the likes of a specific thread
router.post('/:id/repost', authorize({ minRole: 'user' }), repostThread); // Repost a thread
router.get('/:userId/byUser', authorize({ minRole: 'user' }), getThreadsByUser); // Get all threads created by a specific user

export default router;
