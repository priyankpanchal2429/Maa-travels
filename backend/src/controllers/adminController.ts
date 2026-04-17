import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Admin } from '../models/Admin';

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
import { Student } from '../models/Student';
import { College } from '../models/College';

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
import { PaymentLog } from '../models/PaymentLog';
import { Expense } from '../models/Expense';
import { Bus } from '../models/Bus';

export const seedDemoData = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await Student.find().limit(10);
    const buses = await Bus.find().limit(5);

    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No students found to seed payments for' });
    }

    const paymentRecords = [];
    const expenseRecords = [];

    // Create 20 random payments for existing students
    for (let i = 0; i < 20; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

      paymentRecords.push({
        collegeId: student.collegeId,
        studentId: student._id,
        amountPaid: Math.floor(Math.random() * 5000) + 1000,
        paymentDate: date,
        recordedBy: 'Demo Seeder',
        notes: 'Automated demo payment'
      });
    }

    // Create 15 random expenses for existing buses
    const expenseTypes = ['fuel', 'maintenance', 'daily', 'other'];
    const expenseDescs = ['Fuel Tank Refill', 'Oil Change', 'Tire Rotation', 'Cleaning Supplies', 'Brake Pad Replacement'];
    
    for (let i = 0; i < 15; i++) {
      const bus = buses.length > 0 ? buses[Math.floor(Math.random() * buses.length)] : null;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 15));

      expenseRecords.push({
        collegeId: students[0].collegeId, // Use first student's college as fallback
        type: expenseTypes[Math.floor(Math.random() * expenseTypes.length)],
        amount: Math.floor(Math.random() * 2000) + 500,
        date: date,
        description: expenseDescs[Math.floor(Math.random() * expenseDescs.length)],
        busId: bus ? bus._id : null
      });
    }

    await Promise.all([
      PaymentLog.insertMany(paymentRecords),
      Expense.insertMany(expenseRecords)
    ]);

    res.json({ 
      success: true, 
      message: `Successfully seeded 20 payments and 15 expenses for demonstration.` 
    });
  } catch (error) {
    next(error);
  }
};
