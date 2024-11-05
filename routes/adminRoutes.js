import express from "express";
import {
    getAllUsers,
    toggleUserBlock,
    deleteUser,
    updateUserRole,
} from "../controllers/adminUserMangementController.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();




// Lấy tất cả người dùng
router.get("/users", getAllUsers);

// Khóa hoặc mở khóa người dùng
router.put("/users/block/:id", toggleUserBlock);

// Xóa người dùng
router.delete("/users/:id", deleteUser);

// Cập nhật vai trò của người dùng
router.put("/users/role/:id", updateUserRole);


export default router;
