import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const studentSchema = new mongoose.Schema({
  name: String,
  expiryDate: Date,
  paymentStatus: String,
  collegeId: mongoose.Types.ObjectId
}, { collection: 'students' });

const Student = mongoose.model('Student', studentSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const student = await Student.findOne({ name: /Isha/i });
  console.log('Student Isha:', student);

  const now = new Date();
  console.log('Current server date:', now);
  console.log('Expired < now?', student && (student.expiryDate < now));

  const allExpired = await Student.find({ expiryDate: { $lt: now } });
  console.log('Total expired students globally:', allExpired.length);
  
  process.exit(0);
}

run().catch(console.error);
