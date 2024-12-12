import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
const ROLE_HIERARCHY = {
  user: 1,
  moderator: 2,
  super_admin: 3,
};
export const authenticateUserWithOptionalCookie = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log('Error in authenticateUserWithOptionalCookie: ', err.message);
  }
};
export const authorize = ({
  minRole = 'user',
  allowSuperAdmin = true,
} = {}) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (!token)
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
      }
      req.user = user;
      // Nếu là super_admin và được phép bỏ qua mọi quyền
      if (allowSuperAdmin && user.role === 'super_admin') {
        return next();
      }

      // Kiểm tra cấp bậc vai trò
      const userRoleRank = ROLE_HIERARCHY[user.role] || 0;
      const requiredRoleRank = ROLE_HIERARCHY[minRole];

      if (userRoleRank < requiredRoleRank) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next(); // Tiếp tục xử lý nếu hợp lệ
    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
