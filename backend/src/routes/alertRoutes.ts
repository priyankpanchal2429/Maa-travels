import { Router } from 'express';
import * as alertController from '../controllers/alertController';

const router = Router();

router.get('/', alertController.getGlobalAlerts);

export default router;
