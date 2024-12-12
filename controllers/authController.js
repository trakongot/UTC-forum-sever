import {
  logoutUserService,
  resetPasswordService,
  sendPasswordResetEmail,
  signinUserService,
  signupUserService,
} from '../services/authService.js';

/**
 * Đăng ký người dùng mới
 */
export const signupUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userInfo = await signupUserService({ email, password });

    res.status(201).json(userInfo);
  } catch (err) {
    console.error('Error in signupUser:', err.message);
    res.status(400).json({ error: err.message });
  }
};
/**
 * Đăng nhập (cho cả admin lẫn user ...)
 */
export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userInfo = await signinUserService(email, password, res);

    // Trả về thông tin người dùng đã đăng nhập
    res.status(200).json(userInfo);
  } catch (err) {
    // Xử lý lỗi và trả về phản hồi
    console.error('Error in signinUser: ', err.message);
    res.status(500).json({ error: err.message });
  }
};
/**
 * Đăng xuất người dùng
 */
export const logoutUser = (req, res) => {
  try {
    logoutUserService();

    // Xóa cookie jwt
    res.cookie('jwt', '', { maxAge: 1 });

    // Trả về thông báo đăng xuất thành công
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (err) {
    // Xử lý lỗi và trả về phản hồi
    console.error('Error in logoutUser: ', err.message);
    res.status(500).json({ error: err.message });
  }
};
/**
 * Quên mật khẩu - Gửi email đặt lại mật khẩu
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email là bắt buộc' });
    }

    const message = await sendPasswordResetEmail(email);

    res.status(200).json({ message });
  } catch (error) {
    console.error('Lỗi trong forgotPassword:', error.message);
    if (error.message === 'Email không tồn tại') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};

/**
 * Đặt lại mật khẩu người dùng
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const message = await resetPasswordService(token, newPassword);
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in resetPassword:', error.message);
    res.status(500).json({ error: error.message });
  }
};
