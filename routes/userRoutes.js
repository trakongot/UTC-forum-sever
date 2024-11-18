import express from "express";
import {
	followUnFollowUser,
	getUserById,
	//getRepliesByUser,
	signinUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
	verifyEmail,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/protectRoute.js";



const router = express.Router();

router.get("/:id", getUserById);
router.get("/suggested", authenticateUser, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/signin", signinUser);

router.get("/:id/verifyEmail", verifyEmail);
router.post("/logout", logoutUser);
router.post("/:id/follow", authenticateUser, followUnFollowUser);
router.put("/:id", authenticateUser, updateUser);
router.put("/:id/freeze", authenticateUser, freezeAccount);

export default router;
