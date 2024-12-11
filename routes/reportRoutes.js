import express from "express";

const router = express.Router();

import { protectRoute, adminProtectRoute } from "../middlewares/protectRoute.js";


import {
    createReport , 
    getReportsByStatus , 
    getReportById,
    updateReportStatus,
    getReportsByContent
}
from "../controllers/reportController.js";

router.post("", protectRoute ,  createReport);
router.get("/reports",protectRoute , adminProtectRoute , getReportsByStatus);
router.get("/reports/:id",protectRoute ,     adminProtectRoute , getReportById);
router.put("/report/status/", updateReportStatus);
router.get("/search/", protectRoute , adminProtectRoute , getReportsByContent) ;

export default router;