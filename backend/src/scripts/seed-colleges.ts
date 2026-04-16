/**
 * Seeding Script: Adds two fake colleges with localized sample data
 * to verify multitenancy switching.
 * 
 * Usage: npx ts-node src/scripts/seed-colleges.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { College } from '../models/College';
import { Student } from '../models/Student';
import { Driver } from '../models/Driver';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Expense } from '../models/Expense';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-management';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // --- COLLEGE 1: ABC Institute ---
    const abcCollege = await College.findOneAndUpdate(
      { code: 'ABC' },
      { name: 'ABC Institute of Technology', code: 'ABC', address: 'Navsari, Gujarat', isActive: true },
      { upsert: true, new: true }
    );
    console.log('✅ Created ABC College');

    const abcBus = await Bus.create({
      collegeId: abcCollege._id,
      busNumber: 'B-ABC-01',
      plateNumber: 'GJ-05-AB-1234',
      capacity: 50,
      status: 'idle'
    });

    const abcDriver = await Driver.create({
      collegeId: abcCollege._id,
      driverId: 'D-ABC-001',
      name: 'John Doe (ABC)',
      phone: '9876543210',
      address: 'ABC Campus Staff Quarters',
      assignedBusId: abcBus._id,
      salary: 25000
    });
    
    abcBus.currentDriverId = abcDriver._id;
    await abcBus.save();

    const abcRoute = await Route.create({
      collegeId: abcCollege._id,
      routeName: 'ABC-Route-A',
      stops: [{ name: 'Campus Gate', order: 1 }, { name: 'City Center', order: 2 }],
      assignedBusId: abcBus._id
    });

    await Student.create([
      {
        collegeId: abcCollege._id,
        studentId: 'S-ABC-001',
        name: 'Alice (ABC Student)',
        parentPhone: '9999988888',
        duration: '1y',
        routeId: abcRoute._id,
        stopId: 'City Center',
        paymentStatus: 'paid',
        expiryDate: new Date('2025-12-31'),
        isActive: true
      }
    ]);

    await Expense.create({
      collegeId: abcCollege._id,
      type: 'fuel',
      amount: 5000,
      date: new Date(),
      description: 'Monthly fuel for ABC-01',
      busId: abcBus._id
    });

    // --- COLLEGE 2: XYZ Academy ---
    const xyzCollege = await College.findOneAndUpdate(
      { code: 'XYZ' },
      { name: 'XYZ Academy of Excellence', code: 'XYZ', address: 'Surat, Gujarat', isActive: true },
      { upsert: true, new: true }
    );
    console.log('✅ Created XYZ College');

    const xyzBus = await Bus.create({
      collegeId: xyzCollege._id,
      busNumber: 'B-XYZ-99',
      plateNumber: 'GJ-05-XY-9999',
      capacity: 40,
      status: 'running'
    });

    const xyzDriver = await Driver.create({
      collegeId: xyzCollege._id,
      driverId: 'D-XYZ-099',
      name: 'Jane Smith (XYZ)',
      phone: '9123456789',
      address: 'XYZ Housing Board',
      assignedBusId: xyzBus._id,
      salary: 22000
    });

    xyzBus.currentDriverId = xyzDriver._id;
    await xyzBus.save();

    const xyzRoute = await Route.create({
      collegeId: xyzCollege._id,
      routeName: 'XYZ-Route-Alpha',
      stops: [{ name: 'Academy Link', order: 1 }, { name: 'Railway Station', order: 2 }],
      assignedBusId: xyzBus._id
    });

    await Student.create([
      {
        collegeId: xyzCollege._id,
        studentId: 'S-XYZ-999',
        name: 'Bob (XYZ Student)',
        parentPhone: '7777766666',
        duration: '6m',
        routeId: xyzRoute._id,
        stopId: 'Railway Station',
        paymentStatus: 'unpaid',
        expiryDate: new Date('2024-06-30'),
        isActive: true
      }
    ]);

    await Expense.create({
      collegeId: xyzCollege._id,
      type: 'maintenance',
      amount: 1200,
      date: new Date(),
      description: 'Oil change for XYZ-99',
      busId: xyzBus._id
    });

    console.log('\n🎉 Successfully seeded 2 colleges with isolated data!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
