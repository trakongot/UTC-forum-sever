import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserById = async (req, res) => {
	const { id } = req.params;

	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		const user = await User.findById(id).select("-password -updatedAt");

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserById: ", err.message);
	}
};

const signupUser = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;

		if (!name || name.trim() === '') return res.status(400).json({ error: "Name is required" });
		if (!email || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) return res.status(400).json({ error: "Invalid email" });
		if (!username || username.trim() === '') return res.status(400).json({ error: "Username is required" });
		// if (!password || !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(password)) {
		// 	return res.status(400).json({ error: "Password must be at least 6 characters long, and include at least one upper case letter, one lower case letter, one number, and one special character" });
		// }
		if (!password) {
			return res.status(400).json({ error: "Password not be empty" });
		}
		const user = await User.findOne({ $or: [{ email }, { username }] });
		if (user) return res.status(400).json({ error: "User already exists" });

		const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

		const newUser = new User({ name, email, username, password: hashedPassword });
		await newUser.save();

		generateTokenAndSetCookie(newUser._id, res);

		res.status(201).json({
			_id: newUser._id,
			name: newUser.name,
			email: newUser.email,
			username: newUser.username,
			bio: newUser.bio,
			profilePic: newUser.profilePic,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};


const signinUser = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

		if (user.isFrozen) {
			user.isFrozen = false;
			await user.save();
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			username: user.username,
			bio: user.bio,
			profilePic: user.profilePic,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log("Error in loginUser: ", error.message);
	}
};

const logoutUser = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 1 });
		res.status(200).json({ message: "User logged out successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};


const followUnFollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		if (id === req.user._id.toString())
			return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

		const [userToModify, currentUser] = await Promise.all([
			User.findById(id),
			User.findById(req.user._id)
		]);

		if (!userToModify || !currentUser)
			return res.status(400).json({ error: "User not found" });

		const updateAction = currentUser.following.includes(id) ? '$pull' : '$push';
		const message = updateAction === '$pull' ? "User unfollowed successfully" : "User followed successfully";

		await Promise.all([
			User.findByIdAndUpdate(id, { [updateAction]: { followers: req.user._id } }),
			User.findByIdAndUpdate(req.user._id, { [updateAction]: { following: id } })
		]);

		res.status(200).json({ message });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in followUnFollowUser: ", err.message);
	}
};

const updateUser = async (req, res) => {
	const { name, username, bio } = req.body;
	let { profilePic } = req.files.path;
	console.log(profilePic)
	const userId = req.user._id;

	try {
		if (req.params.id !== userId.toString()) {
			return res.status(400).json({ error: "You cannot update other user's profile" });
		}

		const user = await User.findById(userId).select("-password");
		if (!user) return res.status(400).json({ error: "User not found" });

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}
			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			user.profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.username = username || user.username;
		user.bio = bio || user.bio;

		await user.save();

		user.password = null;
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const freezeAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true;
		await user.save();

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {
	signupUser,
	signinUser,
	logoutUser,
	followUnFollowUser,
	updateUser,
	getUserById,
	getSuggestedUsers,
	freezeAccount,
};
