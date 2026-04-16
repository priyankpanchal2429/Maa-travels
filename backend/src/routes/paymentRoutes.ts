import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';

const router = Router();

// GET /api/payments — Full payment overview with filters
router.get('/', paymentController.getPaymentOverview);

// GET /api/payments/insights — Dashboard insight aggregations
router.get('/insights', paymentController.getDashboardInsights);

// GET /api/payments/:id/history — Payment log history
router.get('/:id/history', paymentController.getPaymentHistory);

export default router;
