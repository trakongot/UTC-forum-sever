import Thread from '../models/threadModel.js';
import User from '../models/userModel.js';
import { checkBadWords } from '../utils/checkBadword.js';
import { handleImagesAndVideosCheckAndUpload } from '../utils/handleMediasCheckAndUpload.js';

/**
 * Tạo mới thread hoặc trả lời thread
 * @param {Object} params - Dữ liệu liên quan đến thread
 * @param {string} params.userId - ID của user
 * @param {string} params.text - Nội dung thread
 * @param {string} params.parentId - (optional) ID của thread cha (nếu là reply)
 * @param {Array} params.media - File media upload
 * @returns {Promise<Object>} - Thread đã được tạo
 */
export const createOrReplyThreadService = async ({
  userId,
  text,
  parentId,
  media,
}) => {
  if (!text) throw new Error('Text field is required');
  if (text.length > 500)
    throw new Error('Text must be less than 500 characters');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Kiểm tra từ ngữ không phù hợp
  const badWords = checkBadWords(text);
  if (badWords.length > 0) {
    throw new Error(
      `Text contains inappropriate language: ${badWords.join(', ')}`,
    );
  }

  // Xử lý media upload (nếu có)
  let mediaUrls = [];
  if (media && media.length > 0) {
    const result = await handleImagesAndVideosCheckAndUpload(media);
    if (result.error) throw new Error(result.error);
    mediaUrls = result.data;
  }

  // Tạo thread mới
  const newThread = new Thread({
    postedBy: userId,
    text,
    parentId: parentId || null,
    media: mediaUrls || [],
  });

  await newThread.save();

  // Nếu là reply (có parentId), thêm comment vào parent thread
  if (parentId) {
    const parentThread = await Thread.findById(parentId);
    if (!parentThread) throw new Error('Parent thread not found');
    await parentThread.addComment(newThread._id);
  }

  return newThread;
};
/**
 * Lấy danh sách các reply cho một thread
 * @param {Object} params - Dữ liệu liên quan đến thread
 * @param {string} params.parentId - ID của thread cha
 * @param {string} params.userId - ID của user (để kiểm tra like, follow)
 * @param {number} params.pageNumber - Số trang cần lấy
 * @param {number} params.pageSize - Số lượng thread trên mỗi trang
 * @returns {Promise<Object>} - Danh sách các thread trả về
 */
export const getRepliesService = async ({
  parentId,
  userId,
  pageNumber = 1,
  pageSize = 20,
}) => {
  const skipAmount = (pageNumber - 1) * pageSize;

  const parentThread = await Thread.findById(parentId);
  if (!parentThread) throw new Error('Parent thread not found');

  const baseQuery = { parentId, isHidden: false };
  const threadsQuery = Thread.find(baseQuery)
    .populate({
      path: 'postedBy',
      select: '_id name profilePic bio username followers',
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(parseInt(pageSize))
    .select('-__v -isHidden')
    .lean();

  const user = await User.findById(userId)
    .select('viewedThreads following')
    .lean();

  const followingIds = new Set(
    user?.following?.map((id) => id.toString()) || [],
  );

  const threads = await threadsQuery;
  threads.forEach((thread) => {
    thread.postedBy.isFollowed = followingIds.has(
      thread.postedBy._id.toString(),
    );
    thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
    thread.isLiked = thread.likes?.some((like) => like.toString() === userId);
    delete thread.postedBy.followers;
  });

  const totalThreads = await Thread.countDocuments(baseQuery);

  return {
    threads,
    isNext: totalThreads > skipAmount + threads.length,
  };
};
/**
 * Lấy danh sách các threads với phân trang và các dữ liệu người dùng liên quan
 * @param {Object} params - Dữ liệu liên quan đến threads
 * @param {string} params.userId - ID của người dùng
 * @param {number} params.pageNumber - Số trang
 * @param {number} params.pageSize - Kích thước mỗi trang
 * @returns {Promise<Object>} - Danh sách các threads và thông tin phân trang
 */
export const getThreadsService = async ({ userId, pageNumber, pageSize }) => {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const baseQuery = { parentId: null, isHidden: false };
    const threadsQuery = Thread.find(baseQuery)
      .populate({
        path: 'postedBy',
        select: '_id name profilePic bio username followers',
      })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(parseInt(pageSize))
      .select('-__v -isHidden')
      .lean();

    const user = await User.findById(userId)
      .select('viewedThreads following')
      .lean();
    const followingIds = new Set(
      user?.following?.map((id) => id.toString()) || [],
    );
    const viewedThreads = new Set(
      user?.viewedThreads?.map((id) => id.toString()) || [],
    );

    const threadConditions = {
      ...baseQuery,
      ...(viewedThreads.size > 0 && {
        _id: { $nin: Array.from(viewedThreads) },
      }),
    };

    const threads = await threadsQuery.where(threadConditions);
    threads.forEach((thread) => {
      thread.postedBy.isFollowed = followingIds.has(
        thread.postedBy._id.toString(),
      );
      thread.postedBy.followerCount = thread.postedBy?.followers?.length ?? 0;
      thread.isLiked = thread.likes?.some((like) => like.toString() === userId);
      delete thread.postedBy.followers;
    });

    const totalThreads = await Thread.countDocuments(baseQuery);
    const isNext = totalThreads > skipAmount + threads.length;

    return { threads, isNext };
  } catch (err) {
    throw new Error(err.message || 'Failed to get threads');
  }
};
/**
 * Lấy danh sách các threads của một người dùng với phân trang
 * @param {Object} params - Dữ liệu liên quan đến threads
 * @param {string} params.userId - ID của người dùng hiện tại
 * @param {string} params.authorId - ID của tác giả (người tạo các thread)
 * @param {number} params.pageNumber - Số trang
 * @param {number} params.pageSize - Kích thước mỗi trang
 * @returns {Promise<Object>} - Danh sách các threads của tác giả và thông tin phân trang
 */
export const getThreadsByUserService = async ({
  userId,
  authorId,
  pageNumber,
  pageSize,
}) => {
  try {
    const parsedPageSize = parseInt(pageSize);
    const skipAmount = (pageNumber - 1) * parsedPageSize;

    const threads = await Thread.find({
      postedBy: authorId,
      isHidden: false,
    })
      .populate({ path: 'postedBy', select: '_id name profilePic username' })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(parsedPageSize)
      .select('-__v -isHidden')
      .lean();

    const updatedThreads = threads.map((thread) => ({
      ...thread,
      isLiked: thread.likes?.some((like) => like.toString() === userId),
    }));

    const totalThreads = await Thread.countDocuments({
      postedBy: authorId,
      isHidden: false,
    });
    const isNext = totalThreads > skipAmount + updatedThreads.length;

    return { threads: updatedThreads, isNext };
  } catch (err) {
    throw new Error(err.message || 'Failed to get threads by user');
  }
};
/**
 * Lấy thông tin thread theo ID
 * @param {string} threadId - ID của thread cần lấy
 * @param {string} userId - ID của người dùng hiện tại
 * @returns {Promise<Object>} - Thông tin của thread
 */
export const getThreadByIdService = async (threadId, userId) => {
  try {
    const thread = await Thread.findOne({
      _id: threadId,
      isHidden: false,
    })
      .select('-__v -parentId -children')
      .populate({
        path: 'postedBy',
        select: '_id name profilePic bio username followers',
      })
      .lean();

    if (!thread) {
      throw new Error('Thread not found');
    }

    const isLiked =
      thread.likes?.some((like) => like.toString() === userId) || false;
    const followerCount = thread.postedBy?.followers?.length || 0;

    // Xóa likes khỏi dữ liệu thread để không trả về cho client
    delete thread.likes;

    return { thread, isLiked, followerCount };
  } catch (err) {
    throw new Error(err.message || 'Failed to get thread by ID');
  }
};
/**
 * Xóa thread theo ID
 * @param {string} threadId - ID của thread cần xóa
 * @param {string} userId - ID của người dùng hiện tại (người thực hiện hành động)
 * @returns {Promise<boolean>} - Trả về kết quả xóa thành công hay không
 */
export const deleteThreadService = async (threadId, userId) => {
  try {
    const thread = await Thread.findOne({
      _id: threadId,
      isHidden: false,
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    // Kiểm tra xem người yêu cầu xóa có phải là người đăng thread không
    if (thread.postedBy.toString() !== userId.toString()) {
      throw new Error('Forbidden: Unauthorized to delete thread');
    }

    // Thực hiện xóa thread
    await Thread.findByIdAndDelete(threadId);
    return true;
  } catch (err) {
    throw new Error(err.message || 'Failed to delete thread');
  }
};
/**
 * Thực hiện hành động like hoặc unlike trên thread
 * @param {string} threadId - ID của thread
 * @param {string} userId - ID của người dùng hiện tại (người thực hiện hành động)
 * @returns {Promise<{likeCount: number, message: string}>} - Trả về số lượng like mới và thông báo
 */
export const likeUnlikeThreadService = async (threadId, userId) => {
  try {
    // Tìm kiếm thread theo ID và kiểm tra nếu nó không bị ẩn
    const thread = await Thread.findOne({ _id: threadId, isHidden: false });
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Kiểm tra nếu người dùng đã like thread
    const userLikedThread = thread.likes.includes(userId);

    // Cập nhật thread theo hành động like/unlike
    const updateQuery = userLikedThread
      ? { $pull: { likes: userId }, $inc: { likeCount: -1 } }
      : { $addToSet: { likes: userId }, $inc: { likeCount: 1 } };

    await Thread.updateOne({ _id: threadId }, updateQuery);

    // Tính số lượng like sau khi thay đổi
    const likeCount = thread.likeCount + (userLikedThread ? -1 : 1);
    const message = userLikedThread
      ? 'Thread unliked successfully'
      : 'Thread liked successfully';

    // Trả về kết quả
    return { likeCount: Math.max(likeCount, 0), message };
  } catch (err) {
    throw new Error(err.message || 'Failed to like/unlike thread');
  }
};
/**
 * Lấy danh sách người dùng thích (likes) của một thread
 * @param {string} threadId - ID của thread
 * @returns {Promise<Array>} - Danh sách người dùng đã thích thread
 */
export const getLikesService = async (threadId) => {
  try {
    // Tìm thread theo ID và kiểm tra nếu nó không bị ẩn
    const thread = await Thread.findOne({ _id: threadId, isHidden: false })
      .populate('likes', '_id name username profilePic')
      .lean();

    if (!thread) {
      throw new Error('Thread not found');
    }

    // Trả về danh sách người dùng đã thích thread
    return thread.likes;
  } catch (err) {
    throw new Error(err.message || 'Failed to get likes for the thread');
  }
};
/**
 * Cấm thread theo ID
 * @param {string} threadId - ID của thread
 * @param {Object} user - Người thực hiện hành động (admin/moderator)
 * @returns {Promise} - Trả về kết quả sau khi cập nhật thread
 */
export const restrictThreadService = async (threadId, user) => {
  try {
    // Tìm thread theo ID
    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Kiểm tra quyền sở hữu hoặc quyền của admin/moderator
    const isOwner = thread.postedBy.equals(user._id);
    const isAdminOrModerator =
      user.role === 'admin' || user.role === 'moderator';

    if (!isOwner && !isAdminOrModerator) {
      throw new Error('You do not have permission to restrict this thread');
    }

    // Cập nhật trạng thái thread thành "cấm"
    await Thread.findByIdAndUpdate(threadId, { isHidden: true }, { new: true });

    // Trả về thông báo thành công
    return {
      success: true,
      message: 'Thread has been successfully restricted',
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to restrict thread');
  }
};
