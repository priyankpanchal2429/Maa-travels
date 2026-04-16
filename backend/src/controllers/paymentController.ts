import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { PaymentLog } from '../models/PaymentLog';
import { getDefaultCollegeId } from '../utils/collegeUtils';

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

    if (!collegeId) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    const baseFilter: any = collegeId ? { collegeId } : {};
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
