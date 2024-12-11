import express from "express";
const router = express.Router();


import { protectRoute, adminProtectRoute } from "../middlewares/protectRoute.js";
import{
    getNotifications,
    toggleIsReadNotification
}from "../controllers/notificationController.js" ; 

router.get('/' , protectRoute  ,getNotifications) ;
router.put('/toggleIsRead/:id' , protectRoute  ,toggleIsReadNotification) ; 

export  default router ; 