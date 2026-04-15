import { Router } from 'express';
import * as expenseController from '../controllers/expenseController';

const router = Router();

router.route('/')
  .get(expenseController.getAllExpenses)
  .post(expenseController.createExpense);

router.route('/:id')
  .get(expenseController.getExpenseById)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

export default router;
