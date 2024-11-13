import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import sendVerificationEmail from '../utils/helpers/sendVerificationEmail.js';


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
		const { name, email, username, password, verificationCode } = req.body;

		// Kiểm tra thông tin cơ bản
		if (!name || !email || !username || !password) {return res.status(400).json({ error: "All fields are required." });}
		if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {return res.status(400).json({ error: "Invalid email format." });}
		if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(password)) {return res.status(400).json({ error: "Password does not meet criteria." });}
		
		const userExists = await User.findOne({ $or: [{ email }, { username }] });
		if (userExists) return res.status(400).json({ error: "User already exists." });

		const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

		const newUser = new User({ 
			name, 
			email, 
			username, 
			password: hashedPassword, 
		});
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

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
		// Kiểm tra xem người dùng có cần xác thực không
        if (!user.emailVerifiedToken) {
            // Gửi email xác thực nếu chưa có token
			//Đặt tên cho action
            await sendVerificationEmail(user, 'login');
            return res.status(200).json({
                message: "Verification link sent to your email. Please check to complete login."
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in signinUser: ", error.message);
    }
};

const verifyEmail = async (req, res) => {
    const { token, action } = req.query;
    const { id } = req.params;  // ID người dùng sẽ được lấy từ URL

    if (!token) {
        return res.status(400).json({ error: "Invalid or missing verification token" });
    }

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (userId !== id) {
            return res.status(400).json({ error: "User ID does not match" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

		//Các action cần verify
        if (action === 'login') {
            // Thực hiện logic đăng nhập
            generateTokenAndSetCookie(user._id, res);
            return res.status(200).json({ message: "Login verified successfully" });
        } 
		else if (action === 'delete') {
            // Thực hiện logic xóa dữ liệu quan trọng
            // (Ví dụ: Kiểm tra quyền admin và xóa tài nguyên)
        return res.status(200).json({ message: "Admin action verified successfully" });
        }

        return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token" });
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
	verifyEmail,
};
