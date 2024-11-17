import Notification  from "../models/notificationModel.js";

const getNotifications = async (req, res) => {
    try{
        
        const userId = req.user._id;

        const notificationConditions = {
            user : userId
        }
        const notifications = await Notification.aggregate([
        
            { $match:  notificationConditions  },
            { $sort: { createdAt: -1 } },
        ]);
        res.status(200).json({ success: true, notifications });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const toggleIsReadNotification = async (req, res) => {
    try{
        const userId = req.user._id;
        const notificationId = req.params.id ;
        const isSeen = req.query.isSeen;
        const notification = await Notification.findById({ _id: notificationId});
        console.log(notification , "ehhehehehe") ; 

        
        isSeen ? notification.isRead = true : notification.isRead = false;
        notification.save();
        res.status(200).json({ success: true, notification });

    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
    
}
export {
    getNotifications,
    toggleIsReadNotification
}