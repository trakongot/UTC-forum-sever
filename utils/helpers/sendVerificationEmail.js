import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const sendVerificationEmail = async (user, action) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Tạo token với userId và thời gian hết hạn (15 phút)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Cấu hình liên kết xác thực với action đi kèm

    user.emailVerifiedToken = token;
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/api/users/${user._id}/verifyEmail/?token=${token}&action=${action}`;

    const subject = `Xác thực hành động: ${action}`;
    const text = `Xin chào ${user.username},\n\n` +
                 `Để xác nhận hành động của bạn, vui lòng nhấn vào liên kết dưới đây:\n\n` +
                 `${verificationLink}\n\n` +
                 `Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email này.\n\n` +
                 `Trân trọng,\nNhóm 7`;

    const html = `<p>Xin chào ${user.username},</p>
                  <p>Để xác nhận hành động của bạn, vui lòng nhấn vào link dưới để xác thực.</p>
                  <a href="${verificationLink}">Verify your email</a>
                  <p>Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email này.</p>
                  <p>Trân trọng,<br>Nhóm 7</p>`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html,  // Gửi nội dung HTML thay vì văn bản thuần túy
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

export default sendVerificationEmail;
