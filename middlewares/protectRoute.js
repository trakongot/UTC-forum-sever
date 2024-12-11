import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
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
const adminProtectRoute = (req, res, next) => {
    if (req.user && req.user.role === "super_admin") {
        next(); // Cho phép tiếp tục nếu vai trò là admin
    } else {
        res.status(403).json({ message: "Forbidden: Requires admin role" });
    }
};

export  {protectRoute , adminProtectRoute };
