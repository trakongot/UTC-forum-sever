import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import mongoose from "mongoose";
import { checkBadWords } from "../utils/helpers/checkBadword.js";
import { handleImagesCheckAndUpload } from "../utils/helpers/handleImagesCheckAndUpload.js";

export const getUserById = async (req, res) => {
	const { id } = req.params;

	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		const user = await User.findById(id).select("-password -updatedAt");

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json({
			_id: user._id,
			name: user.name || "Welcome to UTC Threads",
			email: user.email,
			username: user.username || "user_" + user._id.toString().slice(-6),
			bio: user.bio || "New member at UTC Threads",
			profilePic: user.profilePic || "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
			onboarded: user.onboarded || false,
			followers: user.followers || [],
			following: user.following || [],
			role: user.role || "user",
			accountStatus: user.accountStatus || "active",
			banExpiration: user.banExpiration || null,
			viewedThreads: user.viewedThreads || [],
			saves: user.saves || [],
			reposts: user.reposts || [],
			blockedUsers: user.blockedUsers || [],
			createdAt: user.createdAt || new Date().toISOString(),
			updatedAt: user.updatedAt || new Date().toISOString(),
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserById: ", err.message);
	}
};
export const getUserByCookies = async (req, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(404).json({ error: "User not found" });
		res.status(200).json({
			_id: user._id,
			name: user.name || "Welcome to UTC Threads",
			email: user.email,
			username: user.username || "user_" + user._id.toString().slice(-6),
			bio: user.bio || "New member at UTC Threads",
			profilePic: user.profilePic || "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
			onboarded: user.onboarded || false,
			followers: user.followers || [],
			following: user.following || [],
			role: user.role || "user",
			accountStatus: user.accountStatus || "active",
			banExpiration: user.banExpiration || null,
			viewedThreads: user.viewedThreads || [],
			saves: user.saves || [],
			reposts: user.reposts || [],
			blockedUsers: user.blockedUsers || [],
			createdAt: user.createdAt || new Date().toISOString(),
			updatedAt: user.updatedAt || new Date().toISOString(),
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserById: ", err.message);
	}
};
export const signupUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
			return res.status(400).json({ error: "Invalid email" });
		}

		if (!password || !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(password)) {
			return res.status(400).json({
				error: "Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			email, password: hashedPassword, name: "Welcome to UTC Threads", username: "new_user" + Date.now().toString(),
		});
		await newUser.save();
		generateTokenAndSetCookie(newUser._id, res);
		res.status(201).json({
			_id: newUser._id,
			email: newUser.email,
			username: "user_" + newUser._id.toString().slice(-6),
			bio: "New member at UTC Threads",
			profilePic: "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
		});
	} catch (err) {
		console.error("Error in signupUser:", err.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const signinUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Kiểm tra email và password
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}
		if (!password) {
			return res.status(400).json({ error: 'Password is required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: 'Invalid username or password' });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ error: 'Invalid username or password' });
		}

		if (user.isFrozen) {
			user.isFrozen = false;
		}

		// Gán giá trị mặc định nếu chưa có
		const defaults = {
			name: "Welcome to UTC Threads",
			username: "user_" + user._id.toString().slice(-6),
			bio: "New member at UTC Threads",
			profilePic: "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
			role: "user",
			accountStatus: "active",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		let hasChanges = false;
		for (let key in defaults) {
			if (!user[key]) {
				user[key] = defaults[key];
				hasChanges = true;
			}
		}

		if (hasChanges) {
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
			onboarded: user.onboarded || false,
			followers: user.followers || [],
			following: user.following || [],
			role: user.role,
			accountStatus: user.accountStatus,
			banExpiration: user.banExpiration || null,
			viewedThreads: user.viewedThreads || [],
			saves: user.saves || [],
			reposts: user.reposts || [],
			blockedUsers: user.blockedUsers || [],
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	} catch (error) {
		console.error("Error in signinUser: ", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


export const logoutUser = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 1 });
		res.status(200).json({ message: "User logged out successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

export const followUnFollowUser = async (req, res) => {
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

export const updateUserOnboarded = async (req, res) => {
	try {
		const { name, username, bio } = req.body;
		const img = req.file;
		const userId = req.user._id;

		const badWordsInName = checkBadWords(name);
		const badWordsInUsername = checkBadWords(username);
		const badWordsInBio = bio ? checkBadWords(bio) : [];

		if (badWordsInName.length > 0 || badWordsInUsername.length > 0 || badWordsInBio.length > 0) {
			return res.status(400).json({
				error: "Text contains inappropriate language",
				badWords: [
					...badWordsInName,
					...badWordsInUsername,
					...badWordsInBio,
				],
			});
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		if (!name) {
			errors.push("Name is required.");
		} else if (name.length < 3) {
			errors.push("Name must be at least 3 characters.");
		} else if (name.length > 15) {
			errors.push("Name must not exceed 15 characters.");
		}

		if (!username) {
			errors.push("Username is required.");
		} else if (username.length < 3) {
			errors.push("Username must be at least 3 characters.");
		} else if (username.length > 15) {
			errors.push("Username must not exceed 15 characters.");
		} else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			errors.push(
				"Username must contain only letters, numbers, and underscores, and no spaces or special characters."
			);
		}

		let imgUrl = null;
		if (img) {
			const result = await handleImagesCheckAndUpload([img]);
			if (result.error) {
				return res.status(400).json({
					error: result.error,
					violations: result.violations,
					details: result.details,
				});
			}
			imgUrl = result.data[0];
		}

		user.onboarded = true;
		user.name = name;
		user.username = username;
		user.bio = bio || user.bio;
		user.profilePic = imgUrl;

		await user.save();

		res.status(200).json({
			_id: user._id,
			name: user.name || "Welcome to UTC Threads",
			email: user.email,
			username: user.username || "user_" + user._id.toString().slice(-6),
			bio: user.bio || "New member at UTC Threads",
			profilePic: user.profilePic || "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
			onboarded: user.onboarded || false,
			followers: user.followers || [],
			following: user.following || [],
			role: user.role || "user",
			accountStatus: user.accountStatus || "active",
			banExpiration: user.banExpiration || null,
			viewedThreads: user.viewedThreads || [],
			saves: user.saves || [],
			reposts: user.reposts || [],
			blockedUsers: user.blockedUsers || [],
			createdAt: user.createdAt || new Date().toISOString(),
			updatedAt: user.updatedAt || new Date().toISOString(),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const updateUser = async (req, res) => {
	try {
		const { name, username, bio } = req.body;
		const img = req.file;
		const userId = req.user._id;

		const badWordsInName = checkBadWords(name);
		const badWordsInUsername = checkBadWords(username);
		const badWordsInBio = bio ? checkBadWords(bio) : [];

		if (badWordsInName.length > 0 || badWordsInUsername.length > 0 || badWordsInBio.length > 0) {
			return res.status(400).json({
				error: "Text contains inappropriate language",
				badWords: [
					...badWordsInName,
					...badWordsInUsername,
					...badWordsInBio,
				],
			});
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		if (!name) {
			errors.push("Name is required.");
		} else if (name.length < 3) {
			errors.push("Name must be at least 3 characters.");
		} else if (name.length > 15) {
			errors.push("Name must not exceed 15 characters.");
		}

		if (!username) {
			errors.push("Username is required.");
		} else if (username.length < 3) {
			errors.push("Username must be at least 3 characters.");
		} else if (username.length > 15) {
			errors.push("Username must not exceed 15 characters.");
		} else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			errors.push(
				"Username must contain only letters, numbers, and underscores, and no spaces or special characters."
			);
		}

		let imgUrl = null;
		if (img) {
			const result = await handleImagesCheckAndUpload([img]);

			if (result.error) {
				return res.status(400).json({
					error: result.error,
					violations: result.violations,
					details: result.details,
				});
			}

			imgUrl = result.data[0];
		}

		user.name = name;
		user.username = username;
		user.bio = bio || user.bio;
		user.profilePic = imgUrl;

		await user.save();

		res.status(200).json({
			_id: user._id,
			name: user.name || "Welcome to UTC Threads",
			email: user.email,
			username: user.username || "user_" + user._id.toString().slice(-6),
			bio: user.bio || "New member at UTC Threads",
			profilePic: user.profilePic || "https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png",
			onboarded: user.onboarded || false,
			followers: user.followers || [],
			following: user.following || [],
			role: user.role || "user",
			accountStatus: user.accountStatus || "active",
			banExpiration: user.banExpiration || null,
			viewedThreads: user.viewedThreads || [],
			saves: user.saves || [],
			reposts: user.reposts || [],
			blockedUsers: user.blockedUsers || [],
			createdAt: user.createdAt || new Date().toISOString(),
			updatedAt: user.updatedAt || new Date().toISOString(),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
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

export const freezeAccount = async (req, res) => {
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

