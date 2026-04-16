import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Student } from '../models/Student';
import { Driver } from '../models/Driver';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Expense } from '../models/Expense';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-management';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collections = [
      { name: 'Students', model: Student },
      { name: 'Drivers', model: Driver },
      { name: 'Buses', model: Bus },
      { name: 'Routes', model: Route },
      { name: 'Expenses', model: Expense },
    ];

    for (const coll of collections) {
      const total = await coll.model.countDocuments();
      const orphaned = await coll.model.countDocuments({ collegeId: { $exists: false } });
      const nulls = await coll.model.countDocuments({ collegeId: null });
      console.log(`${coll.name}: Total ${total}, Orphaned (no field) ${orphaned}, Null field ${nulls}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
