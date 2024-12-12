import Thread from '../models/threadModel.js';
import User from '../models/userModel.js';

/**
 * Tìm kiếm gợi ý người dùng
 * @param {string} query - Câu truy vấn tìm kiếm
 * @returns {Array} - Danh sách các gợi ý người dùng
 * @throws {Error} - Nếu có lỗi trong quá trình tìm kiếm
 */
export const getUsersBySearch = async (query) => {
  const limit = 5; // Giới hạn tổng số kết quả

  // Truy vấn ưu tiên: Tài khoản bắt đầu bằng cụm từ tìm kiếm
  const prioritizedSuggestions = await User.find({
    $or: [
      { name: { $regex: `^${query}`, $options: 'i' } }, // Bắt đầu bằng query
      { username: { $regex: `^${query}`, $options: 'i' } }, // Bắt đầu bằng query
    ],
  })
    .select('name username profilePic') // Chỉ chọn các trường cần thiết
    .limit(limit); // Giới hạn kết quả ưu tiên

  // Nếu đã đủ 5 kết quả từ truy vấn ưu tiên, trả về luôn
  if (prioritizedSuggestions.length >= limit) {
    return prioritizedSuggestions;
  }

  // Lấy danh sách ID đã được ưu tiên
  const prioritizedIds = prioritizedSuggestions.map((user) => user._id);

  // Truy vấn thứ hai: Tài khoản chứa cụm từ tìm kiếm nhưng không ưu tiên
  const fallbackSuggestions = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
    ],
    _id: { $nin: prioritizedIds }, // Loại trừ các ID đã được ưu tiên
  })
    .select('name username profilePic') // Chỉ chọn các trường cần thiết
    .limit(limit - prioritizedSuggestions.length); // Đảm bảo tổng kết quả không vượt quá 5

  // Gộp kết quả ưu tiên và fallback
  const allSuggestions = [...prioritizedSuggestions, ...fallbackSuggestions];

  return allSuggestions;
};

/**
 * Tìm kiếm các thread theo câu truy vấn và phân trang
 * @param {string} query - Câu truy vấn tìm kiếm
 * @param {string} userId - ID người dùng để loại trừ các thread đã xem
 * @param {number} pageNumber - Số trang hiện tại
 * @param {number} pageSize - Số lượng kết quả mỗi trang
 * @returns {Object} - Các thread tìm được và thông tin phân trang
 * @throws {Error} - Nếu có lỗi trong quá trình tìm kiếm
 */
export const getThreadsBySearch = async (
  query,
  userId,
  pageNumber,
  pageSize,
) => {
  const skipAmount = (pageNumber - 1) * pageSize;
  const baseQuery = {
    parentId: null,
    isHidden: false,
    text: { $regex: query, $options: 'i' },
  };

  // Lấy thông tin user để xử lý viewedThreads và following
  const user = await User.findById(userId)
    .select('viewedThreads following')
    .lean();
  const followingIds = new Set(
    user?.following?.map((id) => id.toString()) || [],
  );
  const viewedThreads = new Set(
    user?.viewedThreads?.map((id) => id.toString()) || [],
  );

  // Thêm điều kiện loại trừ các threads đã xem
  const threadConditions = {
    ...baseQuery,
    ...(viewedThreads.size > 0 && {
      _id: { $nin: Array.from(viewedThreads) },
    }),
  };

  // Truy vấn danh sách threads
  const threads = await Thread.find(threadConditions)
    .populate({
      path: 'postedBy',
      select: '_id name profilePic bio username followers',
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(parseInt(pageSize))
    .select('-__v -isHidden')
    .lean();

  // Gắn thêm thông tin bổ sung cho mỗi thread
  threads.forEach((thread) => {
    thread.postedBy.isFollowed = followingIds.has(
      thread.postedBy._id.toString(),
    );
    thread.postedBy.followerCount = thread.postedBy?.followers?.length || 0;
    thread.isLiked = thread.likes?.some((like) => like.toString() === userId);
    delete thread.postedBy.followers; // Loại bỏ thông tin không cần thiết
  });

  // Đếm tổng số threads để kiểm tra page tiếp theo
  const totalThreadsCount = await Thread.countDocuments(baseQuery);
  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { threads, isNext };
};
