import User from "../models/userModel.js";

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Không trả về mật khẩu

        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

// Khóa hoặc mở khóa người dùng
const toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }

        // Đổi trạng thái của accountStatus giữa "active" và "permanent_ban"
        user.accountStatus = user.accountStatus === "active" ? "permanent_ban" : "active";
        await user.save();

        res.status(200).json({
            success: true,
            message: `Người dùng đã được ${user.accountStatus === "permanent_ban" ? "khóa" : "mở khóa"} thành công`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống "});
    }
};
// Xóa người dùng
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id); // Trực tiếp xóa người dùng dựa trên id
        
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }

        res.status(200).json({ success: true, message: "Người dùng đã được xóa thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};
// Cập nhật vai trò của người dùng
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }
        user.role = role;
        await user.save();

        res.status(200).json({ success: true, message: "Vai trò người dùng đã được cập nhật" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password"); // Không trả về mật khẩu
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }

        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query; // Lấy query từ URL
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Tìm theo tên
                { username: { $regex: query, $options: 'i' } }, // Tìm theo username
                { email: { $regex: query, $options: 'i' } } // Tìm theo email
            ]
        }).select("-password"); // Không trả về mật khẩu

        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};
export {
    getAllUsers,
    toggleUserBlock,
    deleteUser,
    updateUserRole ,
    getUserById , 
    searchUsers , 
};


