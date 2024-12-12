import mongoose from 'mongoose';

const resetPwdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 }, // Token hết hạn sau 1 phút
});

const ResetPwd =
  mongoose.models.resetPwdSchema || mongoose.model('ResetPwd', resetPwdSchema);

export default ResetPwd;
