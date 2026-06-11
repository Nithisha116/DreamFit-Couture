import express from 'express';
import { getPublicInvoiceByOrderId } from '../controllers/publicInvoice.controller.js';
import { getPublicOrderCardByOrderId } from '../controllers/publicOrderCard.controller.js';

const router = express.Router();

/** GET /api/public/invoice/:orderId — customer-facing invoice (no auth) */
router.get('/invoice/:orderId', getPublicInvoiceByOrderId);

/** GET /api/public/order-card/:orderId — customer-facing order card (no auth) */
router.get('/order-card/:orderId', getPublicOrderCardByOrderId);

export default router;
