import { Router } from 'express';
import * as routeController from '../controllers/routeController';

const router = Router();

router.route('/')
  .get(routeController.getAllRoutes)
  .post(routeController.createRoute);

router.route('/:id')
  .get(routeController.getRouteById)
  .put(routeController.updateRoute)
  .delete(routeController.deleteRoute);

export default router;
