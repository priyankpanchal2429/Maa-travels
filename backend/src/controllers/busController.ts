import { Request, Response, NextFunction } from 'express';
import { Bus } from '../models/Bus';

import { getDefaultCollegeId } from '../utils/collegeUtils';

export const createBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.collegeId) {
      req.body.collegeId = await getDefaultCollegeId();
    }
    const bus = await Bus.create(req.body);
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
    const filter: any = collegeId && (collegeId as string).length === 24 ? { collegeId } : {};
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
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

export const deleteBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    next(error);
  }
};
