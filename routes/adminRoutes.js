import express from "express";
import {
    getAllUsers,
    toggleUserBlock,
    deleteUser,
    updateUserRole,
    getUserById ,
    searchUsers
} from "../controllers/adminUserMangementController.js";


import {
    getAllThreads,
    deleteThread,
    toggleThreadVisibility,
    searchThreads,
} from "../controllers/adminThreadsManagementController.js";
import { protectRoute, adminProtectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();




router.get("/users",protectRoute , adminProtectRoute ,   getAllUsers);
router.put("/users/block/:id",protectRoute, adminProtectRoute , toggleUserBlock);
router.delete("/users/delete/:id", protectRoute, adminProtectRoute , deleteUser);
router.get("/users/get/:id", protectRoute, adminProtectRoute ,getUserById);
router.put("/users/role/:id", protectRoute, adminProtectRoute ,updateUserRole);
router.get("/users/search", protectRoute, adminProtectRoute ,searchUsers) ;


router.get("/threads",protectRoute , adminProtectRoute ,   getAllThreads);
router.put("/threads/block/:id",protectRoute, adminProtectRoute , toggleThreadVisibility);
router.delete("/threads/delete/:id", protectRoute, adminProtectRoute , deleteThread);
router.get("/threads/search", protectRoute, adminProtectRoute ,searchThreads) ;

export default router;
