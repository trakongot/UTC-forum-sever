import {
  getThreadsBySearch,
  getUsersBySearch,
} from '../services/searchService.js';

/**
 * Tìm kiếm gợi ý người dùng theo truy vấn
 */
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const suggestions = await getUsersBySearch(query);

    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Tìm kiếm các thread theo truy vấn và phân trang
 */
export const searchThreads = async (req, res) => {
  try {
    const userId = req?.user?._id?.toString();
    const { query, pageNumber = 1, pageSize = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Gọi service để lấy kết quả tìm kiếm
    const { threads, isNext } = await getThreadsBySearch(
      query,
      userId,
      pageNumber,
      pageSize,
    );

    res.status(200).json({
      success: true,
      threads,
      isNext,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
