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
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:id", getUserById);
router.get("/suggested", authenticateUser, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.post("/logout", logoutUser);
router.post("/:id/follow", authenticateUser, followUnFollowUser);
router.put("/:id", authenticateUser, updateUser);
router.put("/:id/freeze", authenticateUser, freezeAccount);

export default router;
