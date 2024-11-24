import Thread from "../models/threadModel.js";
import User from "../models/userModel.js";

export const searchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        // Truy vấn ưu tiên: Tài khoản bắt đầu bằng cụm từ tìm kiếm
        const prioritizedSuggestions = await User.find({
            $or: [
                { name: { $regex: `^${query}`, $options: "i" } },      // Bắt đầu bằng query
                { username: { $regex: `^${query}`, $options: "i" } },  // Bắt đầu bằng query
            ]
        })
            .select('-_id name username profilePic') // Chọn các trường cần thiết
            .limit(10); // Giới hạn kết quả

        // Lấy danh sách ID đã được ưu tiên
        const prioritizedIds = prioritizedSuggestions.map((user) => user._id);

        // Truy vấn thứ hai: Tài khoản chứa cụm từ tìm kiếm nhưng không ưu tiên
        const fallbackSuggestions = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
            ],
            _id: { $nin: prioritizedIds }, // Loại trừ các ID đã được ưu tiên
        })
            .select('_id name username profilePic')
            .limit(10 - prioritizedSuggestions.length); // Giới hạn sao cho tổng là 10

        // Gộp kết quả ưu tiên và fallback
        const allSuggestions = [...prioritizedSuggestions, ...fallbackSuggestions];

        res.status(200).json(allSuggestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getThreadsBySearch = async (req, res) => {
    try {
        const { query } = req.query;
        const { pageNumber = 1, pageSize = 20 } = req.query; // Phân trang
        const skipAmount = (pageNumber - 1) * pageSize;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        // Tìm kiếm threads chứa từ khóa
        const threads = await Thread.find({
            text: { $regex: query, $options: "i" }, // Tìm trong text, không phân biệt hoa thường
        })
            .populate({
                path: 'postedBy', // Lấy thông tin người đăng
                select: '_id name username profilePic',
            })
            .select('_id text createdAt likeCount commentCount repostCount shareCount imgs') // Chỉ lấy các trường cần thiết
            .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
            .skip(skipAmount) // Bỏ qua các kết quả cũ hơn
            .limit(parseInt(pageSize)); // Lấy số lượng theo pageSize

        // Đếm tổng số threads để kiểm tra có page tiếp theo không
        const totalThreadsCount = await Thread.countDocuments({
            text: { $regex: query, $options: "i" },
        });
        const isNext = totalThreadsCount > skipAmount + threads.length;

        res.status(200).json({
            success: true,
            threads,
            isNext,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

