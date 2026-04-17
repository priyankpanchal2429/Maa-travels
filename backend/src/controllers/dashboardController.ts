import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { Bus } from '../models/Bus';
import { Driver } from '../models/Driver';
import { Route } from '../models/Route';
import { Expense } from '../models/Expense';
import { getDefaultCollegeId } from '../utils/collegeUtils';

/**
 * GET /api/dashboard/nexus
 * High-speed overview for the Operational Nexus dashboard.
 * Uses countDocuments() instead of full array fetches for efficiency.
 */
export const getNexusOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;

    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = (await getDefaultCollegeId()) as string;
    }

    const defaultId = await getDefaultCollegeId();
    let filter: any = (collegeId && typeof collegeId === 'string' && collegeId.length === 24) ? { collegeId } : {};
    
    // For default college, include legacy null collegeId records
    if (collegeId === defaultId) {
      filter = { $or: [{ collegeId }, { collegeId: null }] };
    }

    // Run count queries in parallel
    const [
      studentCount,
      busStats,
      driverCount,
      routeCount,
      recentExpenses,
      totalExpenseData
    ] = await Promise.all([
      Student.countDocuments(filter),
      Bus.aggregate([
        { $match: filter },
        { 
          $group: { 
            _id: null, 
            total: { $sum: 1 }, 
            active: { $sum: { $cond: [{ $eq: ["$status", "running"] }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0] } }
          } 
        }
      ]),
      Driver.countDocuments(filter),
      Route.countDocuments(filter),
      Expense.find(filter).sort({ date: -1 }).limit(5).lean(),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, totalSales: { $sum: "$amount" } } }
      ])
    ]);

    const busResult = busStats[0] || { total: 0, active: 0, maintenance: 0 };
    const totalExpenses = totalExpenseData[0]?.totalSales || 0;

    res.json({
      success: true,
      data: {
        counts: {
          students: studentCount,
          buses: {
            total: busResult.total,
            active: busResult.active,
            maintenance: busResult.maintenance
          },
          drivers: driverCount,
          routes: routeCount
        },
        expenses: {
          total: totalExpenses,
          recent: recentExpenses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
