import {
  createOrReplyThreadService,
  deleteThreadService,
  getRepliesService,
  getThreadByIdService,
  getThreadsByUserService,
  getThreadsService,
  likeUnlikeThreadService,
  restrictThreadService,
} from '../services/threadService.js';

/**
 * Tạo mới thread hoặc trả lời thread
 */
export const createOrReplyThread = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const { id: parentId } = req.params;
    const media = req.files;

    const newThread = await createOrReplyThreadService({
      userId,
      text,
      parentId,
      media,
    });

    res.status(201).json(newThread);
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 * Lấy danh sách các comment cho một thread
 */
export const getReplies = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 20 } = req.query;
    const { id: parentId } = req.params;
    const userId = req.user?._id.toString();

    const { threads, isNext } = await getRepliesService({
      parentId,
      userId,
      pageNumber,
      pageSize,
    });

    res.status(200).json({
      success: true,
      threads,
      isNext,
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 *Lấy danh sách các threads với phân trang
 */
export const getThreads = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 20 } = req.query;
    const userId = req.user?._id.toString();

    const { threads, isNext } = await getThreadsService({
      userId,
      pageNumber,
      pageSize,
    });

    res.status(200).json({
      success: true,
      threads,
      isNext,
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 * Lấy danh sách các threads của một người dùng với phân trang
 */
export const getThreadsByUser = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 20 } = req.query;
    const { userId: authorId } = req.params;
    const userId = req.user._id?.toString();

    if (!authorId) {
      return res.status(400).json({ error: 'Author ID is required' });
    }

    const { threads, isNext } = await getThreadsByUserService({
      userId,
      authorId,
      pageNumber,
      pageSize,
    });

    res.status(200).json({
      success: true,
      threads,
      isNext,
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 * Lấy thông tin thread theo ID
 */
export const getThreadById = async (req, res) => {
  try {
    const threadId = req.params.id;
    const userId = req?.user?._id?.toString();

    const { thread, isLiked, followerCount } = await getThreadByIdService(
      threadId,
      userId,
    );

    return res.status(200).json({
      ...thread,
      isLiked,
      followerCount,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal Server Error' });
  }
};
/**
 * Xóa thread theo ID
 */
export const deleteThread = async (req, res) => {
  try {
    const threadId = req.params.id;
    const userId = req.user._id?.toString();

    await deleteThreadService(threadId, userId);

    return res.status(200).json({
      success: true,
      message: 'Thread deleted successfully',
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 * Thực hiện hành động like hoặc unlike thread
 */
export const likeUnlikeThread = async (req, res) => {
  try {
    const { id: threadId } = req.params;
    const userId = req.user?._id?.toString();
    // Gọi service để thực hiện hành động like/unlike
    const { likeCount, message } = await likeUnlikeThreadService(
      threadId,
      userId,
    );

    // Trả về response cho client
    return res.status(200).json({
      success: true,
      message,
      likeCount,
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
/**
 * Lấy danh sách người dùng đã thích thread
 */
export const getLikes = async (req, res) => {
  try {
    const { id: threadId } = req.params;

    // Gọi service để lấy danh sách likes
    const likes = await getLikesService(threadId);

    // Trả về kết quả cho client
    return res.status(200).json({
      success: true,
      likes,
    });
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};

export const shareThread = async (req, res) => {
  try {
    const { id: threadId } = req.params;

    const thread = await Thread.findOne({
      _id: req.params.id,
      isHidden: false,
    });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    await Thread.findByIdAndUpdate(
      threadId,
      { $inc: { shareCount: 1 } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: 'Thread shared successfully',
      shareCount: thread.shareCount + 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const repostThread = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: threadId } = req.body;
    const user = await User.findById(userId);
    const thread = await Thread.updateOne(
      { _id: threadId, isHidden: false },
      { $inc: { repostCount: 1 } },
    );
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    await user.updateOne(userId, { $push: { reposts: threadId } });
    res.status(200).json({
      success: true,
      message: 'Thread repost successfully',
      repostCount: thread.repostCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
/******************************************************************************************
 * ================= Admin Controllers =================
 * Quản lý và xử lý các yêu cầu liên quan đến Admin
 * ======================================================
 ******************************************************************************************/
/**
 * Admin cấm thread
 */
export const restrictThread = async (req, res) => {
  try {
    const { id: threadId } = req.params;
    const user = req.user;

    // Gọi service để cấm thread
    const result = await restrictThreadService(threadId, user);

    // Trả về kết quả cho client
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    next(err); // Gửi lỗi đến middleware xử lý lỗi
  }
};
