import { Router } from 'express';
import * as collegeController from '../controllers/collegeController';

const router = Router();

router.route('/')
  .get(collegeController.getAllColleges)
  .post(collegeController.createCollege);

router.route('/:id')
  .get(collegeController.getCollegeById)
  .put(collegeController.updateCollege)
  .delete(collegeController.deleteCollege);

export default router;
