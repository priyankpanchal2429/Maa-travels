import { Router } from 'express';
import * as adminController from '../controllers/adminController';

const router = Router();

router.get('/profile', adminController.getProfile);
router.post('/profile/photo', adminController.upload.single('photo'), adminController.updatePhoto);
router.post('/migrate-legacy-students', adminController.fixLegacyStudents);
router.delete('/clear-demo', adminController.clearDemoData);

export default router;
