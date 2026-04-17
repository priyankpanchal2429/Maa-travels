import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { Bus } from '../models/Bus';
import { getDefaultCollegeId } from '../utils/collegeUtils';

/**
 * GET /api/alerts
 * Scans for high-priority operational issues:
 * - Passes expiring in < 48 hours.
 * - Buses currently in maintenance.
 */
export const getGlobalAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;
    const defaultId = await getDefaultCollegeId();
    
    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = defaultId as string;
    }

    const filter: any = { collegeId };
    if (collegeId === defaultId) {
      filter.collegeId = { $in: [collegeId, null] };
    }

    const now = new Date();
    const fortyEightHoursLater = new Date();
    fortyEightHoursLater.setHours(fortyEightHoursLater.getHours() + 48);

    const [expiringPasses, maintenanceBuses] = await Promise.all([
      Student.find({
        ...filter,
        expiryDate: { $gte: now, $lte: fortyEightHoursLater }
      }).select('name studentId expiryDate').lean(),

      Bus.find({
        ...filter,
        status: 'maintenance'
      }).select('busNumber plateNumber status').lean()
    ]);

    const alerts = [
      ...expiringPasses.map(s => ({
        type: 'critical',
        category: 'Pass Expiry',
        message: `Bus pass for ${s.name} (${s.studentId}) expires within 48h.`,
        date: s.expiryDate,
        id: `pass-${s._id}`
      })),
      ...maintenanceBuses.map(b => ({
        type: 'warning',
        category: 'Fleet Health',
        message: `Bus ${b.busNumber} is currently out of service (Maintenance).`,
        date: new Date(),
        id: `bus-${b._id}`
      }))
    ];

    // Sort by type (critical first) then date
    const sortedAlerts = alerts.sort((a, b) => {
      if (a.type === 'critical' && b.type !== 'critical') return -1;
      if (a.type !== 'critical' && b.type === 'critical') return 1;
      return 0;
    });

    res.json({ success: true, count: sortedAlerts.length, data: sortedAlerts });
  } catch (error) {
    next(error);
  }
};
