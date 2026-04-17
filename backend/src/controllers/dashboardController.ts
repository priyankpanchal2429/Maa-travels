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

/**
 * GET /api/dashboard/analytics
 * Returns last 6 months of revenue and expenses for charting.
 */
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;
    const defaultId = await getDefaultCollegeId();
    
    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = defaultId as string;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const matchFilter: any = { 
      collegeId: new mongoose.Types.ObjectId(collegeId as string),
      date: { $gte: sixMonthsAgo } 
    };

    // If default college, include legacy null records (though analytics usually focuses on recent tagged data)
    if (collegeId === defaultId) {
      matchFilter.collegeId = { $in: [new mongoose.Types.ObjectId(collegeId as string), null] };
    }

    // Aggregate Expenses by Month
    const expensePipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    // Aggregate Revenue (Payments) by Month
    const revenuePipeline = [
      { 
        $match: { 
          ...matchFilter, 
          paymentDate: { $gte: sixMonthsAgo },
          date: undefined // PaymentLog uses paymentDate
        } 
      },
      {
        $group: {
          _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } },
          total: { $sum: "$amountPaid" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    const [monthlyExpenses, monthlyRevenue] = await Promise.all([
      Expense.aggregate(expensePipeline),
      PaymentLog.aggregate(revenuePipeline as any)
    ]);

    // Format data for Recharts (merge revenue and expenses by month)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const rev = monthlyRevenue.find(r => r._id.month === m && r._id.year === y)?.total || 0;
      const exp = monthlyExpenses.find(e => e._id.month === m && e._id.year === y)?.total || 0;

      chartData.push({
        name: monthNames[m - 1],
        revenue: rev,
        expenses: exp,
        profit: rev - exp
      });
    }

    res.json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};
