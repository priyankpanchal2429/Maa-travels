import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { upload, compressImage } from '../middlewares/imageMiddleware';

const router = Router();

router.route('/')
  .get(studentController.getAllStudents)
  .post(upload.single('photo'), compressImage, studentController.createStudent);

router.route('/:id')
  .get(studentController.getStudentById)
  .put(upload.single('photo'), compressImage, studentController.updateStudent)
  .delete(studentController.deleteStudent);

export default router;
