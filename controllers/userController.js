import User from '../models/userModel.js';
import {
  updateUserOnboardedService,
  updateUserService,
} from '../services/userService.js';

/**
 * Lấy thông tin người dùng theo ID
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password -updatedAt');
    // const user = getUserByIdService(id);
    res.status(200).json({
      _id: user._id,
      name: user.name || 'Welcome to UTC Threads',
      email: user.email,
      username: user.username || 'user_' + user._id?.toString().slice(-6),
      bio: user.bio || 'New member at UTC Threads',
      profilePic:
        user.profilePic ||
        'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png',
      onboarded: user.onboarded || false,
      followers: user.followers || [],
      following: user.following || [],
      role: user.role || 'user',
      accountStatus: user.accountStatus || 'active',
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
    console.log('Error in getUserById: ', err.message);
  }
};

/**
 * Lấy thông tin người dùng từ cookies (JWT) - trường hợp user đã đăng nhập thì ko cần đăng nhập lại nữa
 */
export const getUserByCookies = (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const defaultProfilePic =
      'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png';
    const _idSuffix = user._id?.toString().slice(-6) || 'unknown';

    res.status(200).json({
      _id: user._id,
      name: user.name || 'Welcome to UTC Threads',
      email: user.email,
      username: user.username || `user_${_idSuffix}`,
      bio: user.bio || 'New member at UTC Threads',
      profilePic: user.profilePic || defaultProfilePic,
      onboarded: user.onboarded,
      followers: user.followers || [],
      following: user.following || [],
      role: user.role || 'user',
      accountStatus: user.accountStatus || 'active',
      banExpiration: user.banExpiration || null,
      viewedThreads: user.viewedThreads || [],
      saves: user.saves || [],
      reposts: user.reposts || [],
      blockedUsers: user.blockedUsers || [],
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in getUserByCookies:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Theo dõi hoặc huỷ theo dõi người dùng
 */
export const followUnFollowUser = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    // Gọi service để thực hiện hành động theo dõi/huỷ theo dõi
    const message = followUnFollowUserService(userId, id);

    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in followUnFollowUser: ', err.message);
  }
};

/**
 * Cập nhật thông tin người dùng khi onboarded
 */
export const updateUserOnboarded = (req, res) => {
  try {
    const userId = req.user._id;
    const userData = req.body;
    const img = req.file;

    const updatedUser = updateUserOnboardedService(userId, {
      ...userData,
      img,
    });

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name || 'Welcome to UTC Threads',
      email: updatedUser.email,
      username:
        updatedUser.username || 'user_' + updatedUser._id.toString().slice(-6),
      bio: updatedUser.bio || 'New member at UTC Threads',
      profilePic:
        updatedUser.profilePic ||
        'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png',
      onboarded: updatedUser.onboarded || false,
      followers: updatedUser.followers || [],
      following: updatedUser.following || [],
      role: updatedUser.role || 'user',
      accountStatus: updatedUser.accountStatus || 'active',
      banExpiration: updatedUser.banExpiration || null,
      viewedThreads: updatedUser.viewedThreads || [],
      saves: updatedUser.saves || [],
      reposts: updatedUser.reposts || [],
      blockedUsers: updatedUser.blockedUsers || [],
      createdAt: updatedUser.createdAt || new Date().toISOString(),
      updatedAt: updatedUser.updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in updateUserOnboarded: ', err.message);
  }
};
/**
 * Cập nhật thông tin người dùng
 */
export const updateUser = (req, res) => {
  try {
    const userId = req.user._id;
    const userData = req.body;
    const img = req.file;

    const updatedUser = updateUserService(userId, {
      ...userData,
      img,
    });

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name || 'Welcome to UTC Threads',
      email: updatedUser.email,
      username:
        updatedUser.username || 'user_' + updatedUser._id?.toString().slice(-6),
      bio: updatedUser.bio || 'New member at UTC Threads',
      profilePic:
        updatedUser.profilePic ||
        'https://res.cloudinary.com/muckhotieu/image/upload/v1731805369/l60Hf_ztxub0.png',
      onboarded: updatedUser.onboarded || false,
      followers: updatedUser.followers || [],
      following: updatedUser.following || [],
      role: updatedUser.role || 'user',
      accountStatus: updatedUser.accountStatus || 'active',
      banExpiration: updatedUser.banExpiration || null,
      viewedThreads: updatedUser.viewedThreads || [],
      saves: updatedUser.saves || [],
      reposts: updatedUser.reposts || [],
      blockedUsers: updatedUser.blockedUsers || [],
      createdAt: updatedUser.createdAt || new Date().toISOString(),
      updatedAt: updatedUser.updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in updateUser: ', err.message);
  }
};

export const getSuggestedUsers = (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByYou = User.findById(userId).select('following');

    const users = User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id),
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const freezeAccount = (req, res) => {
  try {
    const user = User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isFrozen = true;
    user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsersIAmFollowing = (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const user = User.findById(userId);

    const following = User.find({
      _id: { $in: user.following.map((id) => new mongoose.Types.ObjectId(id)) },
    }).select('-password');

    if (following.length === 0) {
      return res
        .status(404)
        .json({ message: 'You are not following anyone yet' });
    }

    res.status(200).json({ success: true, following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

export const getTop4Follow = (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const currentUser = User.findById(userId).select('following');
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const users = User.find({
      _id: { $nin: currentUser.following, $ne: userId },
    })
      .select('-password')
      .sort({ followers: -1 })
      .limit(4);
    console.log(users, 'hahahahahaha==');
    if (users.length === 0) {
      return res.status(404).json({ message: 'No suggested users found' });
    }
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};
