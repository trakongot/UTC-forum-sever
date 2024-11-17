import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		if (!token) return res.status(401).json({ message: "Unauthorized" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("-password");

		req.user = user;

		next();
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

export const authenticateUserWithOptionalCookie = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		if (!token) return next();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("-password");

		req.user = user;

		next();
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("Error in authenticateUserWithOptionalCookie: ", err.message);
	}
};

export const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: "Access denied" });
		}
		next();
	};
};