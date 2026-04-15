/**
 * Seed Script — Run once to create default admin user.
 * Usage: npm run seed
 *
 * This is idempotent — safe to run multiple times.
 * It only creates the admin if NO users exist in the DB.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';

const SEED_USER = {
  userId: 'Bus001',
  name: 'System Administrator',
  password: 'admin123',
  role: 'admin' as const,
  mustChangePassword: false,
  isActive: true,
};

async function seed(): Promise<void> {
  console.log('\n🌱  Bus Management System — Seed Script\n');

  await mongoose.connect(env.MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  const count = await User.countDocuments();

  if (count > 0) {
    console.log(`ℹ️   Database already has ${count} user(s). Skipping seed.\n`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(SEED_USER.password, 12);

  await User.create({ ...SEED_USER, password: hashedPassword });

  console.log('───────────────────────────────');
  console.log('✅  Default admin user created:');
  console.log(`    User ID  : ${SEED_USER.userId}`);
  console.log(`    Password : ${SEED_USER.password}`);
  console.log(`    Role     : ${SEED_USER.role}`);
  console.log('───────────────────────────────');
  console.log('⚠️   CHANGE THE DEFAULT PASSWORD IMMEDIATELY IN PRODUCTION!\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
