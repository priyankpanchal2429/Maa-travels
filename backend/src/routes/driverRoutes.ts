import { Router } from 'express';
import * as driverController from '../controllers/driverController';
import { upload, compressImage } from '../middlewares/imageMiddleware';

const router = Router();

router.route('/')
  .get(driverController.getAllDrivers)
  .post(upload.single('photo'), compressImage, driverController.createDriver);

router.route('/:id')
  .get(driverController.getDriverById)
  .put(upload.single('photo'), compressImage, driverController.updateDriver)
  .delete(driverController.deleteDriver);

export default router;
