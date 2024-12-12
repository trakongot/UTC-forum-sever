import express from 'express';
import {
  createPolicy,
  getPolicies,
  getPolicyById,
  togglePolicyStatus,
} from '../controllers/policyController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// router.post('', authorizeRoles(['user', 'super_admin']), createPolicy);
router.post('', authorize({ minRole: 'user' }), createPolicy);

router.get('/', authorize({ minRole: 'user' }), getPolicies);

router.get('/:id', authorize({ minRole: 'user' }), getPolicyById);

router.patch('/:id', authorize({ minRole: 'user' }), togglePolicyStatus);

export default router;
