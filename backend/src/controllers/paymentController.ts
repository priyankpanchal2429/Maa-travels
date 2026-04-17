import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { PaymentLog } from '../models/PaymentLog';
import { getDefaultCollegeId } from '../utils/collegeUtils';
import { logInternalActivity } from './activityController';

/**
 * GET /api/payments
 * Returns all students with populated college/route data for payment views.
 * Supports filtering by: status, collegeId, fromDate, toDate
 */
export const getPaymentOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId, status, fromDate, toDate } = req.query;

    // Graceful fallback for collegeId
    if (!collegeId) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    // Build filter object
    const filter: any = {};
    if (collegeId) filter.collegeId = collegeId;

    // Status filter: 'expired' is a computed status based on expiryDate
    const now = new Date();
    if (status === 'expired') {
      filter.expiryDate = { $lt: now };
    } else if (status === 'expiring') {
      // Expiring within 7 days
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      filter.expiryDate = { $gt: now, $lte: in7Days };
    } else if (status && status !== 'all') {
      filter.paymentStatus = status;
      // Exclude expired students from paid/unpaid/bypassed views
      filter.expiryDate = { $gte: now };
    }

    // Date range filter on expiryDate
    if (fromDate || toDate) {
      filter.expiryDate = filter.expiryDate || {};
      if (fromDate) filter.expiryDate.$gte = new Date(fromDate as string);
      if (toDate) filter.expiryDate.$lte = new Date(toDate as string);
    }

    const students = await Student.find(filter)
      .populate('collegeId', 'name code')
      .populate('routeId', 'routeName')
      .sort({ expiryDate: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/insights
 * Returns dashboard-ready payment & pass insights:
 * - unpaidStudents, expiringSoon, expiredStudents with counts
 */
export const getDashboardInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;

    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    const defaultId = await getDefaultCollegeId();
    let baseFilter: any = (collegeId && typeof collegeId === 'string' && collegeId.length === 24) ? { collegeId } : {};
    
    if (collegeId === defaultId) {
      baseFilter = { $or: [{ collegeId }, { collegeId: null }] };
    }
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    // Execute all queries in parallel for performance
    const [unpaidStudents, expiringSoon, expiredStudents] = await Promise.all([
      // Unpaid: paymentStatus === 'unpaid' AND not yet expired
      Student.find({
        ...baseFilter,
        paymentStatus: 'unpaid',
        expiryDate: { $gte: now },
      })
        .populate('collegeId', 'name code')
        .select('name studentId amount expiryDate parentPhone')
        .sort({ expiryDate: 1 })
        .lean(),

      // Expiring soon: pass expires within 7 days
      Student.find({
        ...baseFilter,
        expiryDate: { $gt: now, $lte: in7Days },
      })
        .populate('collegeId', 'name code')
        .select('name studentId expiryDate parentPhone')
        .sort({ expiryDate: 1 })
        .lean(),

      // Expired: expiryDate is in the past
      Student.find({
        ...baseFilter,
        expiryDate: { $lt: now },
      })
        .populate('collegeId', 'name code')
        .select('name studentId expiryDate parentPhone')
        .sort({ expiryDate: -1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        unpaid: { count: unpaidStudents.length, students: unpaidStudents },
        expiring: { count: expiringSoon.length, students: expiringSoon },
        expired: { count: expiredStudents.length, students: expiredStudents },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/:id/history
 * Returns payment log history for a given student
 */
export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const logs = await PaymentLog.find({ studentId: id }).sort({ paymentDate: -1 });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/:id/record
 * Formally records a payment:
 * 1. Updates student status to 'paid'
 * 2. Advances expiryDate based on student.duration
 * 3. Creates a record in the 'payments' (PaymentLog) collection
 */
export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paymentMethod, notes: userNotes } = req.body;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Calculate new expiry date based on subscription duration
    const now = new Date();
    const newExpiry = new Date();
    if (student.duration === '6m') {
      newExpiry.setMonth(newExpiry.getMonth() + 6);
    } else {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    }

    // Transactional Update
    student.paymentStatus = 'paid';
    student.expiryDate = newExpiry;
    await student.save();

    // Create Audit Log in the 'payments' collection
    const log = await PaymentLog.create({
      collegeId: student.collegeId,
      studentId: student._id,
      amountPaid: student.amount,
      paymentDate: now,
      paymentMethod: paymentMethod || 'Cash',
      recordedBy: 'Admin (System)',
      notes: userNotes || `Formal payment record for ${student.name} (ID: ${student.studentId})`
    });

    // Log System Activity Pulse
    await logInternalActivity({
      type: 'payment',
      message: `Payment of ₹${student.amount} received from ${student.name}`,
      collegeId: student.collegeId.toString(),
      metadata: { studentId: student._id, logId: log._id, amount: student.amount }
    });

    res.json({ 
      success: true, 
      message: 'Payment verified and recorded in history.', 
      data: { student, log } 
    });
  } catch (error) {
    next(error);
  }
};

