import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Admin } from '../models/Admin';
import { Student } from '../models/Student';
import { College } from '../models/College';
import { PaymentLog } from '../models/PaymentLog';
import { Expense } from '../models/Expense';

// ─── Multer Config ───────────────────────────
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  },
});

/**
 * Gets the singleton admin profile.
 * Creates it if it doesn't exist.
 */
export const getProfile = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({});
    }
    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the admin profile photo with compression.
 * Uses Sharp to resize and convert to WebP for best quality/size ratio.
 */
export const updatePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const uploadDir = path.join(__dirname, '../../uploads/profile');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `admin-profile-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    // Process image with Sharp
    await sharp(req.file.buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(filePath);

    // Update DB
    const photoUrl = `/uploads/profile/${fileName}`;
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({ profilePhoto: photoUrl });
    } else {
      admin.profilePhoto = photoUrl;
      await admin.save();
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

/**
 * Migration: Finds all students with null collegeId and assigns them the first available college.
 */
export const fixLegacyStudents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const defaultCollege = await College.findOne({ code: 'DEFAULT' }) || await College.findOne();
    if (!defaultCollege) {
      return res.status(404).json({ success: false, message: 'No colleges found to assign students to' });
    }

    const result = await Student.updateMany(
      { collegeId: null },
      { $set: { collegeId: defaultCollege._id } }
    );

    res.json({ 
      success: true, 
      message: `Migrated ${result.modifiedCount} legacy students to college: ${defaultCollege.name}` 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/clear-demo
 * Purges all mock records created by the Global Seeder.
 */
export const clearDemoData = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete payments created by seeder
    const paymentPurge = await PaymentLog.deleteMany({ recordedBy: 'Global Seeder' });
    
    // Expenses don't have a specific tag, so we match against the seeder's known descriptions
    const seederDescs = [
      'Fuel Tank Refill', 'Oil Change', 'Tire Rotation', 
      'Cleaning Supplies', 'Brake Pad Replacement', 
      'Insurance Renewal', 'GPS Maintenance'
    ];
    const expensePurge = await Expense.deleteMany({ description: { $in: seederDescs } });

    res.json({ 
      success: true, 
      message: `System Cleanse Complete: Purged ${paymentPurge.deletedCount} mock payments and ${expensePurge.deletedCount} mock expenses.` 
    });
  } catch (error) {
    next(error);
  }
};
