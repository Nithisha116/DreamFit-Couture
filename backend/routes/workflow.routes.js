import express from 'express';
import {
  getWorkflowJobs,
  getOrdersPipeline,
  assignWorkerToStage,
  processQrScan
} from '../controllers/workflow.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/jobs', getWorkflowJobs);
router.get('/orders-pipeline', getOrdersPipeline);
router.post('/works/:id/assign-worker', authorize('ADMIN', 'STORE_KEEPER'), assignWorkerToStage);
router.post('/works/:id/scan', processQrScan);

export default router;
