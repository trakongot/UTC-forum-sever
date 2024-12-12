import User from '../models/userModel.js';
import { checkBadWords } from '../utils/checkBadword.js';
import { handleImagesCheckAndUpload } from '../utils/handleMediasCheckAndUpload.js';

/**
 * Lấy thông tin người dùng theo ID
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} - Thông tin người dùng
 */
export const getUserByIdService = async (userId) => {
  const user = await User.findOne({ _id: userId }).select(
    '-password -updatedAt',
  );
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Cập nhật thông tin người dùng khi onboarded
 * @param {string} userId - ID của người dùng
 * @param {Object} userData - Dữ liệu người dùng (name, username, bio, img)
 * @returns {Object} - Thông tin người dùng sau khi cập nhật
 * @throws {Error} - Nếu có lỗi
 */
export const updateUserOnboardedService = async (userId, userData) => {
  const { name, username, bio, img } = userData;

  const badWordsInName = checkBadWords(name);
  const badWordsInUsername = checkBadWords(username);
  const badWordsInBio = bio ? checkBadWords(bio) : [];

  if (
    badWordsInName.length > 0 ||
    badWordsInUsername.length > 0 ||
    badWordsInBio.length > 0
  ) {
    throw new Error('Text contains inappropriate language');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const errors = [];
  if (!name) {
    errors.push('Name is required.');
  } else if (name.length < 3) {
    errors.push('Name must be at least 3 characters.');
  } else if (name.length > 15) {
    errors.push('Name must not exceed 15 characters.');
  }

  if (!username) {
    errors.push('Username is required.');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters.');
  } else if (username.length > 15) {
    errors.push('Username must not exceed 15 characters.');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push(
      'Username must contain only letters, numbers, and underscores.',
    );
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  let imgUrl = null;
  if (img) {
    const result = await handleImagesCheckAndUpload([img]);
    if (result.error) {
      throw new Error(result.error);
    }
    imgUrl = result.data[0];
  }

  user.onboarded = true;
  user.name = name;
  user.username = username;
  user.bio = bio || user.bio;
  user.profilePic = imgUrl;

  await user.save();

  return user;
};
/**
 * Cập nhật thông tin người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} userData - Dữ liệu người dùng (name, username, bio, img)
 * @returns {Object} - Thông tin người dùng sau khi cập nhật
 * @throws {Error} - Nếu có lỗi
 */
export const updateUserService = async (userId, userData) => {
  const { name, username, bio, img } = userData;

  const badWordsInName = checkBadWords(name);
  const badWordsInUsername = checkBadWords(username);
  const badWordsInBio = bio ? checkBadWords(bio) : [];

  if (
    badWordsInName.length > 0 ||
    badWordsInUsername.length > 0 ||
    badWordsInBio.length > 0
  ) {
    throw new Error('Text contains inappropriate language');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const errors = [];
  if (!name) {
    errors.push('Name is required.');
  } else if (name.length < 3) {
    errors.push('Name must be at least 3 characters.');
  } else if (name.length > 15) {
    errors.push('Name must not exceed 15 characters.');
  }

  if (!username) {
    errors.push('Username is required.');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters.');
  } else if (username.length > 15) {
    errors.push('Username must not exceed 15 characters.');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push(
      'Username must contain only letters, numbers, and underscores.',
    );
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  let imgUrl = null;
  if (img) {
    const result = await handleImagesCheckAndUpload([img]);
    if (result.error) {
      throw new Error(result.error);
    }
    imgUrl = result.data[0];
  }

  user.name = name;
  user.username = username;
  user.bio = bio || user.bio;
  if (imgUrl) user.profilePic = imgUrl;

  await user.save();

  return user;
};
