import express from 'express';
import { 
  getWorkers, 
  getWorkerById, 
  createWorker, 
  updateWorker 
} from '../controllers/worker.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkers)
  .post(authorize('ADMIN', 'MANAGER', 'STORE_KEEPER'), createWorker);

router.route('/:id')
  .get(getWorkerById)
  .put(authorize('ADMIN', 'STORE_KEEPER'), updateWorker);

export default router;
