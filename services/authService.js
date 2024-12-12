import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import ResetPwd from '../models/resetPwdModel.js';
import User from '../models/userModel.js';
import generateTokenAndSetCookie from '../utils/generateTokenAndSetCookie.js';

/**
 * Đăng ký người dùng mới
 * @param {Object} userData - Dữ liệu đăng ký người dùng
 * @param {string} userData.email - Email người dùng
 * @param {string} userData.password - Mật khẩu người dùng
 * @returns {Object} - Thông tin người dùng sau khi đăng ký
 * @throws {Error} - Lỗi nếu có sự cố trong quá trình đăng ký
 */
export const signupUserService = async ({ email, password }) => {
  // Kiểm tra định dạng email hợp lệ (email phải có định dạng đúng: ví dụ: abc@xyz.com)
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    throw new Error('Invalid email');
  }
  // Kiểm tra mật khẩu hợp lệ (mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số, và ký tự đặc biệt)
  if (
    !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(
      password,
    )
  ) {
    throw new Error(
      'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    email,
    password: hashedPassword,
    name: 'Welcome to UTC Threads',
    username: 'new_user' + Date.now().toString(),
  });

  await newUser.save();
  generateTokenAndSetCookie(newUser._id, res);

  return {
    _id: newUser._id,
    email: newUser.email,
    username: 'user_' + newUser._id.toString().slice(-6),
    bio: 'New member at UTC Threads',
    profilePic:
      'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png',
  };
};

/**
 * Xử lý đăng nhập người dùng
 * @param {string} email - Email của người dùng
 * @param {string} password - Mật khẩu của người dùng
 * @returns {Object} - Thông tin người dùng sau khi đăng nhập
 * @throws {Error} - Nếu có lỗi trong quá trình đăng nhập
 */
export const signinUserService = async (email, password, res) => {
  // Kiểm tra email hợp lệ
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Kiểm tra mật khẩu không rỗng
  if (!password) {
    throw new Error('Password is required');
  }

  // Tìm người dùng theo email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Kiểm tra mật khẩu
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error('Invalid username or password');
  }

  // Nếu người dùng bị đóng băng, bỏ trạng thái đóng băng
  if (user.isFrozen) {
    user.isFrozen = false;
  }

  // Gán giá trị mặc định nếu chưa có
  const defaults = {
    name: 'Welcome to UTC Threads',
    username: 'user_' + user._id.toString().slice(-6),
    bio: 'New member at UTC Threads',
    profilePic:
      'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png',
    role: 'user',
    accountStatus: 'active',
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

  // Sinh mã token và thiết lập cookie
  generateTokenAndSetCookie(user._id, res);

  return {
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
  };
};
/**
 * Xử lý đăng xuất người dùng
 * @returns {void}
 * @throws {Error} - Nếu có lỗi trong quá trình đăng xuất
 */
export const logoutUserService = () => {
  // chưa nghĩa ra
  return true;
};
/**
 * Gửi email đặt lại mật khẩu
 * @param {string} email - Địa chỉ email của người dùng
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình xử lý
 */
export const sendPasswordResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email không tồn tại');
  }

  const token = crypto.randomBytes(32).toString('hex');

  const resetPwd = new ResetPwd({
    userId: user._id,
    token,
  });
  await resetPwd.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Đặt lại mật khẩu của bạn',
    html: `<p>Nhấn vào đường dẫn bên dưới để đặt lại mật khẩu của bạn:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  });

  return 'Đường dẫn đặt lại mật khẩu đã được gửi tới email';
};

export const resetPasswordService = async (token, newPassword) => {
  // Tìm token trong database
  const resetPwd = await ResetPwd.findOne({ token });
  if (!resetPwd) {
    throw new Error('Invalid or expired token');
  }

  const user = await User.findById(resetPwd.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Cập nhật mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  await resetPwd.deleteOne({ _id: resetPwd._id });
  return { message: 'Password reset successfully' };
};
