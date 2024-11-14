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
	blockAndUnblockUser,
	getBlockedUsers,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/protectRoute.js";



const router = express.Router();

router.get("/block", authenticateUser, getBlockedUsers);
router.get("/:id", getUserById);
router.get("/suggested", authenticateUser, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.post("/logout", logoutUser);
router.post("/:id/follow", authenticateUser, followUnFollowUser);
router.put("/:id", authenticateUser, updateUser);
router.put("/:id/freeze", authenticateUser, freezeAccount);
// router.post("/block", authenticateUser, blockUser);
// router.post("/unblock", authenticateUser, unBlockUser);
router.post('/block', authenticateUser, blockAndUnblockUser);
export default router;
