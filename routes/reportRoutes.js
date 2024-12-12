import express from 'express';

const router = express.Router();

import {
  createReport,
  getReportById,
  getReportsByStatus,
  updateReportStatus,
} from '../controllers/reportController.js';
import { authorize } from '../middlewares/authMiddleware.js';

router.post('', authorize({ minRole: 'user' }), createReport);
router.get('/reports', getReportsByStatus);
router.get(
  '/reports/:id',
  authorize({ minRole: 'user' }),
  authorize(['modaration', 'super_admin']),
  getReportById,
);
router.put('/report/status/:id', updateReportStatus);

export default router;
