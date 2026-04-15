import { Router } from 'express';
import * as busController from '../controllers/busController';

const router = Router();

router.route('/')
  .get(busController.getAllBuses)
  .post(busController.createBus);

router.route('/:id')
  .get(busController.getBusById)
  .put(busController.updateBus)
  .delete(busController.deleteBus);

export default router;
