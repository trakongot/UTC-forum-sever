
import express from "express";
import {
    searchSuggestions,
    getThreadsBySearch
} from "../controllers/searchController.js";
import { authenticateUser } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/suggestions", searchSuggestions);
router.get("/searchThread",getThreadsBySearch);

export default router;  