import { Request, Response, NextFunction } from 'express';
import { Route } from '../models/Route';

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

export const getAllRoutes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await Route.find().populate('assignedBusId');
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

export const getRouteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findById(req.params.id).populate('assignedBusId');
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

export const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

export const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    next(error);
  }
};
