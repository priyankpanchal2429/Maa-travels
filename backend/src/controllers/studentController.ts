import mongoose from 'mongoose';
import { Student } from '../models/Student';
import '../models/PaymentLog'; // Make sure the model is registered

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
    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    // Build filter: If searching for default college, also include students with null collegeId
    let filter: any = (collegeId && typeof collegeId === 'string' && collegeId.length === 24) ? { collegeId } : {};
    const defaultId = await getDefaultCollegeId();
    if (collegeId === defaultId) {
      filter = { $or: [{ collegeId }, { collegeId: null }] };
    }

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
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ success: false, message: 'Student not found' });

    const wasPaid = oldStudent.paymentStatus === 'paid';
    const isNowPaid = req.body.paymentStatus === 'paid';

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // Log payment if status changed to paid
    if (!wasPaid && isNowPaid && student) {
      await mongoose.connection.models.PaymentLog.create({
        collegeId: student.collegeId,
        studentId: student._id,
        amountPaid: student.amount,
        recordedBy: 'Admin', // In a real app with auth, extract from req.user
      });
    }

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
