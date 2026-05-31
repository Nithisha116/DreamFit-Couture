import express from 'express';
import { getJobByQrCode, processScanByQrCode } from '../controllers/qr.controller.js';

const router = express.Router();

// Publicly accessible routes for QR workers
router.get('/:qrCode', getJobByQrCode);
router.post('/:qrCode/scan', processScanByQrCode);

export default router;
