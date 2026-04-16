import { Request, Response, NextFunction } from 'express';
import { College } from '../models/College';

export const createCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const getAllColleges = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const colleges = await College.find({ isActive: true }).sort('name');
    res.json({ success: true, count: colleges.length, data: colleges });
  } catch (error) {
    next(error);
  }
};

export const getCollegeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const updateCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const deleteCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, message: 'College deactivated' });
  } catch (error) {
    next(error);
  }
};
