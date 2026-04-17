import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../models/ActivityLog';

/**
 * GET /api/activity
 * Fetches the most recent system activities.
 */
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    // In a multi-tenant setup, filter by collegeId from req.user
    const activities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to log activity (not an endpoint)
 */
export const logInternalActivity = async (data: {
  type: 'student' | 'payment' | 'fleet' | 'expense' | 'system';
  message: string;
  collegeId?: string;
  metadata?: any;
}) => {
  try {
    await ActivityLog.create({
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
