import express from 'express';
import {
  forgotPassword,
  logoutUser,
  resetPassword,
  signinUser,
  signupUser,
} from '../controllers/authController.js';
import {
  followUnFollowUser,
  freezeAccount,
  getSuggestedUsers,
  getUserByCookies,
  getUserById,
  updateUser,
  updateUserOnboarded,
} from '../controllers/userController.js';
import {
  authenticateUserWithOptionalCookie,
  authorize,
} from '../middlewares/authMiddleware.js';
import { fileUploadMiddleware as multer } from '../middlewares/fileUploadMiddleware.js';

const router = express.Router();

// Authentication Routes
router.post('/signup', signupUser); // Sign up a new user
router.post('/signin', signinUser); // Sign in an existing user
router.post('/logout', logoutUser); // Log out the current user
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User Profile Routes
router.get('/', authenticateUserWithOptionalCookie, getUserByCookies); // Get user details by cookies
router.get('/:id', authorize({ minRole: 'user' }), getUserById); // Get user details by ID
router.put(
  '/',
  authorize({ minRole: 'user' }),
  multer.single('img'),
  updateUser,
); // Update user profile
router.post(
  '/onboarded',
  authorize({ minRole: 'user' }),
  multer.single('img'),
  updateUserOnboarded,
); // Mark user as onboarded

// User Actions Routes
router.post('/:id/follow', authorize({ minRole: 'user' }), followUnFollowUser); // Follow or unfollow a user
router.put('/:id/freeze', authorize({ minRole: 'user' }), freezeAccount); // Freeze a user account

// Other Info
router.get('/suggested', authorize({ minRole: 'user' }), getSuggestedUsers); // Get suggested users for following

export default router;
