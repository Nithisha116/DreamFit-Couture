import express from 'express';
import { getPublicInvoiceByOrderId } from '../controllers/publicInvoice.controller.js';

const router = express.Router();

/** GET /api/public/invoice/:orderId — customer-facing invoice (no auth) */
router.get('/invoice/:orderId', getPublicInvoiceByOrderId);

export default router;
