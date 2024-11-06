import Thread from "../models/threadModel.js";
import User from "../models/userModel.js"; 

// Lấy tất cả các thread (có thể phân trang để dễ quản lý)
const getAllThreads = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Phân trang
        const threads = await Thread.find()
            .populate("postedBy", "username") // Hiển thị thông tin người đăng
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

        res.status(200).json({ success: true, threads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

// Xóa một thread
const deleteThreadAndChildren = async (threadId) => {
    // Tìm và xóa tất cả các thread con của thread có id là `threadId`
    const childThreads = await Thread.find({ parentId: threadId });
    for (const child of childThreads) {
        // Đệ quy xóa tất cả các thread con
        await deleteThreadAndChildren(child._id);
    }

    // Xóa thread gốc
    await Thread.findByIdAndDelete(threadId);
};

const deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await Thread.findById(id);

        if (!thread) {
            return res.status(404).json({ error: "Thread không tồn tại" });
        }

        // Xóa thread và tất cả các thread con của nó
        await deleteThreadAndChildren(id);

        res.status(200).json({ success: true, message: "Thread đã được xóa thành công cùng với các thread con của nó" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

// Ẩn hoặc hiện một thread
const toggleThreadVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await Thread.findById(id);

        if (!thread) {
            return res.status(404).json({ error: "Thread không tồn tại" });
        }
        // Đổi trạng thái ẩn hiện của thread
        thread.isHidden = !thread.isHidden;
        await thread.save();

        res.status(200).json({
            success: true,
            message: `Thread đã được ${thread.isHidden ? "ẩn" : "hiện"} thành công`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

// Tìm kiếm thread theo nội dung hoặc người đăng
const searchThreads = async (req, res) => {
    try {
        const { query } = req.query; // Lấy query từ URL
        const threads = await Thread.find({
            $or: [
                { text: { $regex: query, $options: 'i' } }, // Tìm theo nội dung
                { postedBy: { $regex: query, $options: 'i' } } // Tìm theo người đăng
            ]
        }).populate("postedBy", "username");

        res.status(200).json({ success: true, threads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

// Cập nhật thông tin thread (nếu cần thiết, ví dụ như chỉnh sửa nội dung)

export {
    getAllThreads,
    deleteThread,
    toggleThreadVisibility,
    searchThreads,
};
