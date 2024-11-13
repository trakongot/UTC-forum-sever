import express from "express";
import { authenticateUser } from "../middlewares/protectRoute.js";
import { saveUnsaveThread } from '../controllers/saveController.js'; 

const router = express.Router();

router.post('/', authenticateUser, saveUnsaveThread);

export default router;
