import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/nexus', dashboardController.getNexusOverview);

export default router;
