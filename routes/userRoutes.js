import express from "express";
import {
	followUnFollowUser,
	getUserById,
	signinUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
	updateUserOnboarded,
	getUserByCookies,
	getTop4Follow,
	getUsersIAmFollowing
} from "../controllers/userController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";
import { fileUploadMiddleware as multer } from "../middlewares/fileUploadMiddleware.js";

const router = express.Router();

// Authentication Routes
router.post("/signup", signupUser); // Sign up a new user
router.post("/signin", signinUser); // Sign in an existing user
router.post("/logout", logoutUser); // Log out the current user

// User Profile Routes
router.get("/", authenticateUser, getUserByCookies); // Get user details by cookies
router.get("/:id", getUserById); // Get user details by ID
router.put("/", authenticateUser, multer.single("img"), updateUser); // Update user profile
router.post("/onboarded", authenticateUser, multer.single("img"), updateUserOnboarded); // Mark user as onboarded

// User Actions Routes
router.post("/:id/follow", authenticateUser, followUnFollowUser); // Follow or unfollow a user
router.put("/:id/freeze", authenticateUser, freezeAccount); // Freeze a user account

// Other Info
router.get("/suggested", authenticateUser, getSuggestedUsers); // Get suggested users for following
router.get("/suggested/top4FollowersUser", authenticateUser, getTop4Follow); // Get user details by cookies
router.get("/suggested/usersIamFollow", authenticateUser, getUsersIAmFollowing); // Get user details by cookies





export default router;
