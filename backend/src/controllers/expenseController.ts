import { Request, Response, NextFunction } from 'express';
import { Expense } from '../models/Expense';

import { getDefaultCollegeId } from '../utils/collegeUtils';

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.collegeId) {
      req.body.collegeId = await getDefaultCollegeId();
    }
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const getAllExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId, busId, type, startDate, endDate } = req.query;
    
    if (!collegeId) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    const filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    
    if (busId) filter.busId = busId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(filter).populate('busId').sort('-date');
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('busId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};
