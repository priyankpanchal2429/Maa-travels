import { Router } from 'express';
import * as adminController from '../controllers/adminController';

const router = Router();

router.get('/profile', adminController.getProfile);
router.post('/profile/photo', adminController.upload.single('photo'), adminController.updatePhoto);
router.post('/migrate-legacy-students', adminController.fixLegacyStudents);
router.post('/seed-demo', adminController.seedDemoData);

export default router;
