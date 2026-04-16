import { Request, Response, NextFunction } from 'express';
import { Driver } from '../models/Driver';

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

export const getAllDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collegeId } = req.query;
    const filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    const drivers = await Driver.find(filter).populate('assignedBusId');
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedBusId');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, message: 'Driver deleted' });
  } catch (error) {
    next(error);
  }
};
