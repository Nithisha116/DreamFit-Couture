import express from 'express';
import { 
  getWorkflowJobs,
  assignWorkerToStage
} from '../controllers/workflow.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/jobs', getWorkflowJobs);
router.post('/works/:id/assign-worker', authorize('ADMIN', 'STORE_KEEPER'), assignWorkerToStage);

export default router;
