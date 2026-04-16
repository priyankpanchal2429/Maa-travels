/**
 * Migration Script: Assigns all existing records to a "Default College".
 * Safe to run multiple times (idempotent).
 * 
 * Usage: npx ts-node src/scripts/migrate-college.ts
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

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find or create the Default College
    let defaultCollege = await College.findOne({ code: 'DEFAULT' });
    if (!defaultCollege) {
      defaultCollege = await College.create({
        name: 'Default College',
        code: 'DEFAULT',
        address: 'N/A',
        isActive: true,
      });
      console.log('✅ Created Default College:', defaultCollege._id);
    } else {
      console.log('ℹ️  Default College already exists:', defaultCollege._id);
    }

    const collegeId = defaultCollege._id;

    // 2. Update all records missing collegeId
    const studentResult = await Student.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId } }
    );
    console.log(`✅ Students updated: ${studentResult.modifiedCount}`);

    const driverResult = await Driver.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId } }
    );
    console.log(`✅ Drivers updated: ${driverResult.modifiedCount}`);

    const busResult = await Bus.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId } }
    );
    console.log(`✅ Buses updated: ${busResult.modifiedCount}`);

    const routeResult = await Route.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId } }
    );
    console.log(`✅ Routes updated: ${routeResult.modifiedCount}`);

    const expenseResult = await Expense.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId } }
    );
    console.log(`✅ Expenses updated: ${expenseResult.modifiedCount}`);

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
