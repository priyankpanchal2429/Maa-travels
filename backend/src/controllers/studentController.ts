import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';

import { getDefaultCollegeId } from '../utils/collegeUtils';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Graceful fallback: Default to 'Default College' if no collegeId provided
    if (!req.body.collegeId) {
      req.body.collegeId = await getDefaultCollegeId();
    }
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;
    
    // Graceful fallback: Isolation for old frontend versions
    if (!collegeId) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    const filter: any = collegeId ? { collegeId } : {};
    const students = await Student.find(filter).populate('routeId');
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id).populate('routeId');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
};
