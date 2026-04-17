import { Request, Response, NextFunction } from 'express';
import { Bus } from '../models/Bus';
import { getDefaultCollegeId } from '../utils/collegeUtils';
import { logInternalActivity } from './activityController';

export const createBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.collegeId) {
      req.body.collegeId = await getDefaultCollegeId();
    }
    const bus = await Bus.create(req.body);

    await logInternalActivity({
      type: 'fleet',
      message: `Bus registered: ${bus.busNumber} (${bus.plateNumber})`,
      collegeId: bus.collegeId.toString(),
      metadata: { busId: bus._id }
    });

    res.status(201).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

export const getAllBuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { collegeId } = req.query;
    if (!collegeId || (typeof collegeId === 'string' && collegeId.length !== 24)) {
      collegeId = (await getDefaultCollegeId()) as string;
    }
    const filter: any = (collegeId && typeof collegeId === 'string' && collegeId.length === 24) ? { collegeId } : {};
    const buses = await Bus.find(filter).populate('currentDriverId');
    res.json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    next(error);
  }
};

export const getBusById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('currentDriverId');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

export const updateBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldBus = await Bus.findById(req.params.id);
    if (!oldBus) return res.status(404).json({ success: false, message: 'Bus not found' });

    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (bus) {
      const statusChanged = oldBus.status !== bus.status;
      const message = statusChanged 
        ? `Bus ${bus.busNumber} status changed: ${oldBus.status} -> ${bus.status}`
        : `Bus ${bus.busNumber} details updated`;

      await logInternalActivity({
        type: 'fleet',
        message,
        collegeId: bus.collegeId.toString(),
        metadata: { busId: bus._id, oldStatus: oldBus.status, newStatus: bus.status }
      });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

export const deleteBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    await logInternalActivity({
      type: 'fleet',
      message: `Bus removed from fleet: ${bus.busNumber}`,
      collegeId: bus.collegeId?.toString()
    });

    res.json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    next(error);
  }
};
