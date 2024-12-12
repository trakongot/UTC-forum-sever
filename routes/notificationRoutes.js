import express from 'express';
const router = express.Router();

import {
  getNotifications,
  toggleIsReadNotification,
} from '../controllers/notificationController.js';
import { authorize } from '../middlewares/authMiddleware.js';

router.get('/', authorize({ minRole: 'user' }), getNotifications);
router.put(
  '/toggleIsRead/:id',
  authorize({ minRole: 'user' }),
  toggleIsReadNotification,
);

export default router;
